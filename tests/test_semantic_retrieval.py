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
from backend.knowledge.vector_index import (
    build_vector_index,
    get_vector_index_status,
    VectorIndexUnavailableException,
)
from backend.knowledge.retriever import (
    DeterministicMetadataRetriever,
    SemanticFAISSRetriever,
    semantic_search,
)

init_db()
client = TestClient(app)


@pytest.fixture(scope="module")
def vector_test_env():
    """Sets up an isolated vector index directory using MockEmbeddingService."""
    temp_dir = tempfile.mkdtemp(prefix="nagriklens_vector_test_")
    db = SessionLocal()
    mock_service = MockEmbeddingService(model_name="mock-test-model", dimension=64)

    try:
        # Seed public datasets & knowledge evidence
        PublicDataService.seed_default_datasets(db)
        KnowledgeService.seed_default_knowledge(db)

        # Build index in temp_dir
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


# ==========================================
# 1. RETRIEVER INTERFACE & RANKING TESTS
# ==========================================

def test_semantic_retriever_basic(vector_test_env):
    """Verify semantic retriever returns valid results, similarity_scores, and complete provenance."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, total = retriever.retrieve(query="water problem in Dharashiv", top_k=5)

    assert total > 0
    assert len(results) <= 5

    first = results[0]
    assert first.evidence_id.startswith("EVID-")
    assert first.source_name is not None
    assert first.source_reference is not None
    assert isinstance(first.similarity_score, float)
    assert first.content is not None


def test_semantic_retriever_ranking_and_stable_order(vector_test_env):
    """Verify results are sorted descending by similarity_score with stable tie-breaking."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results_1, _ = retriever.retrieve(query="drinking water coverage", top_k=5)
    results_2, _ = retriever.retrieve(query="drinking water coverage", top_k=5)

    # Verify descending score ordering
    scores = [r.similarity_score for r in results_1]
    assert scores == sorted(scores, reverse=True)

    # Verify deterministic identical ordering
    ids_1 = [r.evidence_id for r in results_1]
    ids_2 = [r.evidence_id for r in results_2]
    assert ids_1 == ids_2


def test_semantic_retriever_top_k_bounds(vector_test_env):
    """Verify top_k values 1, 3, 5 and boundary validation."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)

    for k in [1, 3, 5]:
        res, _ = retriever.retrieve(query="rural tap water", top_k=k)
        assert len(res) <= k

    with pytest.raises(ValueError):
        retriever.retrieve(query="test", top_k=0)

    with pytest.raises(ValueError):
        retriever.retrieve(query="test", top_k=25)


def test_semantic_retriever_empty_query_rejected(vector_test_env):
    """Verify empty and whitespace queries are rejected."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)

    with pytest.raises(ValueError):
        retriever.retrieve(query="")

    with pytest.raises(ValueError):
        retriever.retrieve(query="   ")


# ==========================================
# 2. METADATA FILTERING TESTS
# ==========================================

def test_semantic_retriever_state_filter(vector_test_env):
    """Verify state filter returns only records from the specified state."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, _ = retriever.retrieve(query="water supply", state="Maharashtra", top_k=10)

    assert len(results) > 0
    for r in results:
        assert r.state.lower() == "maharashtra"


def test_semantic_retriever_district_filter(vector_test_env):
    """Verify district filter returns only records from the specified district."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, _ = retriever.retrieve(query="water tap connection", district="Dharashiv", top_k=5)

    assert len(results) >= 1
    for r in results:
        assert r.district.lower() == "dharashiv"


def test_semantic_retriever_category_filter(vector_test_env):
    """Verify category filter returns only records matching the civic category."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, _ = retriever.retrieve(query="drinking water", category="Water", top_k=5)

    assert len(results) > 0
    for r in results:
        assert r.category == "Water"


def test_semantic_retriever_combined_filters_and_semantics(vector_test_env):
    """Verify combined filters enforce strict AND logic."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, _ = retriever.retrieve(
        query="tap connection",
        state="Maharashtra",
        district="Dharashiv",
        category="Water",
        top_k=5,
    )

    assert len(results) == 1
    assert results[0].district == "Dharashiv"
    assert results[0].state == "Maharashtra"
    assert results[0].category == "Water"


def test_semantic_retriever_no_matching_filter(vector_test_env):
    """Verify filtering out all candidates returns empty list with 0 count."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    results, total = retriever.retrieve(
        query="water",
        district="NonExistentDistrict123",
        top_k=5,
    )

    assert results == []
    assert total == 0


# ==========================================
# 3. UNAVAILABLE INDEX BEHAVIOR TESTS
# ==========================================

def test_semantic_retriever_missing_index_raises_exception():
    """Verify querying when vector index does not exist raises VectorIndexUnavailableException."""
    empty_temp_dir = tempfile.mkdtemp(prefix="nagriklens_empty_vector_")
    db = SessionLocal()
    mock_service = MockEmbeddingService(dimension=64)

    try:
        retriever = SemanticFAISSRetriever(
            db=db,
            embedding_service=mock_service,
            vector_dir=empty_temp_dir,
        )
        with pytest.raises(VectorIndexUnavailableException) as exc_info:
            retriever.retrieve(query="water problem")
        assert "unavailable" in str(exc_info.value).lower()
    finally:
        db.close()
        shutil.rmtree(empty_temp_dir, ignore_errors=True)


# ==========================================
# 4. HIGH-LEVEL SERVICE & SCHEMA TESTS
# ==========================================

def test_semantic_search_service_response_schema(vector_test_env):
    """Verify semantic_search function returns validated SemanticKnowledgeSearchResponse."""
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    response = semantic_search(
        db=db,
        query="rural water tap connection",
        top_k=3,
        state="Maharashtra",
        embedding_service=service,
        vector_dir=v_dir,
    )

    assert response.query == "rural water tap connection"
    assert response.retriever == "semantic_faiss"
    assert response.top_k == 3
    assert response.filters.state == "Maharashtra"
    assert len(response.results) <= 3
    for r in response.results:
        assert r.similarity_score is not None
        assert r.source_reference is not None


# ==========================================
# 5. BASELINE VS SEMANTIC RETRIEVAL COMPARISON
# ==========================================

def test_baseline_vs_semantic_retrieval_comparison(vector_test_env):
    """
    Demonstrates architectural difference:
    Baseline metadata retriever requires structured metadata filters.
    Semantic retriever retrieves via natural-language text representation.
    """
    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]

    # Baseline Metadata Retrieval
    baseline_retriever = DeterministicMetadataRetriever(db=db)
    baseline_results, baseline_total = baseline_retriever.retrieve(
        district="Dharashiv",
        category="Water",
        top_k=5,
    )
    assert baseline_total >= 1
    assert baseline_results[0].district == "Dharashiv"

    # Semantic Vector Retrieval (no metadata filters, purely text)
    semantic_retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)
    semantic_results, semantic_total = semantic_retriever.retrieve(
        query="District Dharashiv tap water coverage",
        top_k=5,
    )
    assert semantic_total > 0
    assert len(semantic_results) > 0


def test_retrieval_queries_json_evaluation(vector_test_env):
    """
    Evaluates the defined retrieval_queries.json dataset against the semantic retriever.
    Verifies that all evaluation queries execute cleanly and return valid schema structures.
    """
    import json
    from pathlib import Path

    queries_path = Path(__file__).parent / "data" / "retrieval_queries.json"
    assert queries_path.exists()

    with open(queries_path, "r", encoding="utf-8") as f:
        queries_data = json.load(f)

    db = vector_test_env["db"]
    service = vector_test_env["service"]
    v_dir = vector_test_env["vector_dir"]
    retriever = SemanticFAISSRetriever(db=db, embedding_service=service, vector_dir=v_dir)

    assert len(queries_data) >= 8

    for item in queries_data:
        q = item["query"]
        results, total = retriever.retrieve(query=q, top_k=5)
        assert isinstance(results, list)
        assert total >= 0
        for res in results:
            assert res.evidence_id is not None
            assert res.source_reference is not None
            assert isinstance(res.similarity_score, float)

