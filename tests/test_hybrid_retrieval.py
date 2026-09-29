import os
import shutil
import tempfile
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import init_db, SessionLocal
from backend.public_data.service import PublicDataService
from backend.knowledge.service import KnowledgeService
from backend.knowledge.embedding_service import MockEmbeddingService
from backend.knowledge.vector_index import build_vector_index
from backend.knowledge.hybrid_retriever import (
    HybridKnowledgeRetriever,
    calculate_metadata_match_level,
    hybrid_search,
)

init_db()
client = TestClient(app)


@pytest.fixture(scope="module")
def hybrid_test_env():
    """Sets up an isolated vector index directory using MockEmbeddingService for hybrid tests."""
    temp_dir = tempfile.mkdtemp(prefix="nagriklens_hybrid_test_")
    db = SessionLocal()
    mock_service = MockEmbeddingService(model_name="mock-hybrid-model", dimension=64)

    try:
        PublicDataService.seed_default_datasets(db)
        KnowledgeService.seed_default_knowledge(db)

        build_vector_index(
            db=db,
            embedding_service=mock_service,
            vector_dir=temp_dir,
        )

        yield {
            "db": db,
            "vector_dir": temp_dir,
            "service": mock_service,
        }
    finally:
        db.close()
        shutil.rmtree(temp_dir, ignore_errors=True)


def test_metadata_match_level_calculation():
    # Level 3: state + district + category
    assert calculate_metadata_match_level("Maharashtra", "Dharashiv", "Water", "Maharashtra", "Dharashiv", "Water") == 3
    # Level 2: district + category
    assert calculate_metadata_match_level("Maharashtra", "Dharashiv", "Water", None, "Dharashiv", "Water") == 2
    # Level 1: category only
    assert calculate_metadata_match_level("Maharashtra", "Dharashiv", "Water", None, None, "Water") == 1
    # Level 0: no match
    assert calculate_metadata_match_level("Maharashtra", "Dharashiv", "Water", "Punjab", "Ludhiana", "Roads") == 0


def test_hybrid_retriever_semantic_only_query(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, total = retriever.retrieve(query="water problem in Dharashiv", top_k=5)

    assert total > 0
    assert len(results) <= 5
    first = results[0]
    assert first.evidence_id.startswith("EVID-")
    assert first.retrieval_method in ("semantic", "hybrid")
    assert isinstance(first.similarity_score, float)
    assert isinstance(first.metadata_match_level, int)


def test_hybrid_retriever_metadata_filtered_query(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, total = retriever.retrieve(
        query="rural drinking water supply",
        state="Maharashtra",
        district="Dharashiv",
        category="Water",
        top_k=5,
    )

    assert len(results) >= 1
    dharashiv_item = results[0]
    assert dharashiv_item.district == "Dharashiv"
    assert dharashiv_item.state == "Maharashtra"
    assert dharashiv_item.category == "Water"
    assert dharashiv_item.metadata_match_level == 3
    assert dharashiv_item.retrieval_method in ("hybrid", "metadata", "semantic")


def test_hybrid_retriever_deduplication(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, _ = retriever.retrieve(
        query="District Dharashiv tap water coverage",
        district="Dharashiv",
        category="Water",
        top_k=10,
    )

    evidence_ids = [r.evidence_id for r in results]
    assert len(evidence_ids) == len(set(evidence_ids)), "Evidence records must be uniquely deduplicated by evidence_id."


def test_hybrid_retriever_deterministic_ranking(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results_1, _ = retriever.retrieve(query="household water supply", district="Dharashiv", top_k=5)
    results_2, _ = retriever.retrieve(query="household water supply", district="Dharashiv", top_k=5)

    # Identical deterministic results
    ids_1 = [r.evidence_id for r in results_1]
    ids_2 = [r.evidence_id for r in results_2]
    assert ids_1 == ids_2

    # Verify sort invariant: metadata_match_level desc, then similarity desc
    for i in range(len(results_1) - 1):
        cur = results_1[i]
        nxt = results_1[i + 1]
        if cur.metadata_match_level == nxt.metadata_match_level:
            assert cur.similarity_score >= nxt.similarity_score


def test_hybrid_retriever_provenance_preservation(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, _ = retriever.retrieve(query="water problem in Dharashiv", top_k=1)

    assert len(results) == 1
    r = results[0]
    assert r.evidence_id is not None
    assert r.dataset_id is not None
    assert r.record_id is not None
    assert r.title is not None
    assert r.content is not None
    assert r.state is not None
    assert r.district is not None
    assert r.category is not None
    assert r.metric_name is not None
    assert r.source_name is not None
    assert r.source_reference is not None


def test_hybrid_retriever_empty_query_rejected(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    with pytest.raises(ValueError):
        retriever.retrieve(query="")


def test_hybrid_retriever_top_k_bounds(hybrid_test_env):
    db = hybrid_test_env["db"]
    service = hybrid_test_env["service"]
    v_dir = hybrid_test_env["vector_dir"]

    retriever = HybridKnowledgeRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    with pytest.raises(ValueError):
        retriever.retrieve(query="test", top_k=0)
    with pytest.raises(ValueError):
        retriever.retrieve(query="test", top_k=25)


def test_hybrid_search_api_endpoint(hybrid_test_env):
    # Test through HTTP API
    res = client.get("/api/knowledge/hybrid-search?q=water%20problem%20in%20Dharashiv&top_k=5")
    assert res.status_code == 200
    data = res.json()
    assert data["query"] == "water problem in Dharashiv"
    assert data["retriever"] == "hybrid"
    assert data["top_k"] == 5
    assert len(data["results"]) >= 1
    assert any("Dharashiv" in r["title"] or "Dharashiv" in r["content"] for r in data["results"])


def test_hybrid_search_api_filtered(hybrid_test_env):
    res = client.get(
        "/api/knowledge/hybrid-search?q=water%20problem&state=Maharashtra&district=Dharashiv&category=Water&top_k=5"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["filters"]["state"] == "Maharashtra"
    assert data["filters"]["district"] == "Dharashiv"
    assert data["filters"]["category"] == "Water"
    assert len(data["results"]) >= 1
    assert data["results"][0]["district"] == "Dharashiv"
    assert data["results"][0]["metadata_match_level"] == 3
