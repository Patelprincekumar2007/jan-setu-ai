import os
import shutil
import tempfile
import pytest
from backend.database import init_db, SessionLocal
from backend.public_data.service import PublicDataService
from backend.knowledge.service import KnowledgeService
from backend.knowledge.embedding_service import MockEmbeddingService, l2_normalize
from backend.knowledge.vector_index import (
    build_vector_index,
    get_vector_index_status,
    search_vector_index,
    VectorIndexUnavailableException,
)

init_db()


@pytest.fixture(scope="module")
def setup_db():
    db = SessionLocal()
    try:
        PublicDataService.seed_default_datasets(db)
        KnowledgeService.seed_default_knowledge(db)
        yield db
    finally:
        db.close()


@pytest.fixture
def cleanup_vector_dir():
    temp_dir = tempfile.mkdtemp(prefix="nagriklens_vec_test_")
    yield temp_dir
    shutil.rmtree(temp_dir, ignore_errors=True)


def test_embedding_service_normalization():
    mock_service = MockEmbeddingService(dimension=64)
    query_vec = mock_service.encode_query("test water query")
    import numpy as np
    norm = np.linalg.norm(query_vec)
    assert pytest.approx(norm, rel=1e-4) == 1.0


def test_vector_index_creation_and_status(setup_db, cleanup_vector_dir):
    mock_service = MockEmbeddingService(dimension=64)
    res = build_vector_index(
        db=setup_db,
        embedding_service=mock_service,
        vector_dir=cleanup_vector_dir,
    )
    assert res["status"] == "built"
    assert res["evidence_count"] >= 25

    status = get_vector_index_status(
        db=setup_db,
        embedding_service=mock_service,
        vector_dir=cleanup_vector_dir,
    )
    assert status["available"] is True
    assert status["stale"] is False
    assert status["evidence_count"] >= 25


def test_stale_index_detection_model_mismatch(setup_db, cleanup_vector_dir):
    mock_service_1 = MockEmbeddingService(model_name="model-v1", dimension=64)
    mock_service_2 = MockEmbeddingService(model_name="model-v2", dimension=64)

    build_vector_index(
        db=setup_db,
        embedding_service=mock_service_1,
        vector_dir=cleanup_vector_dir,
    )

    status = get_vector_index_status(
        db=setup_db,
        embedding_service=mock_service_2,
        vector_dir=cleanup_vector_dir,
    )
    assert status["available"] is False
    assert status["stale"] is True
    assert status["reason"] == "model_mismatch"


def test_stale_index_detection_content_hash(setup_db, cleanup_vector_dir):
    mock_service = MockEmbeddingService(dimension=64)
    build_vector_index(
        db=setup_db,
        embedding_service=mock_service,
        vector_dir=cleanup_vector_dir,
    )

    status = get_vector_index_status(
        db=setup_db,
        embedding_service=mock_service,
        vector_dir=cleanup_vector_dir,
    )
    assert status["available"] is True


def test_semantic_search_functionality(setup_db, cleanup_vector_dir):
    mock_service = MockEmbeddingService(dimension=64)
    build_vector_index(
        db=setup_db,
        embedding_service=mock_service,
        vector_dir=cleanup_vector_dir,
    )

    results, total = search_vector_index(
        db=setup_db,
        query_text="water problem in Dharashiv",
        top_k=5,
        embedding_service=mock_service,
        vector_dir=cleanup_vector_dir,
    )
    assert total > 0
    assert len(results) <= 5
    first_record, score = results[0]
    assert first_record.evidence_id.startswith("EVID-")
    assert isinstance(score, float)


def test_missing_index_behavior(setup_db):
    empty_dir = tempfile.mkdtemp(prefix="empty_vec_")
    try:
        mock_service = MockEmbeddingService(dimension=64)
        with pytest.raises(VectorIndexUnavailableException):
            search_vector_index(
                db=setup_db,
                query_text="water supply",
                top_k=5,
                embedding_service=mock_service,
                vector_dir=empty_dir,
            )
    finally:
        shutil.rmtree(empty_dir, ignore_errors=True)
