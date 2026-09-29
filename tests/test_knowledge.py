import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.public_data.service import PublicDataService
from backend.knowledge.service import KnowledgeService
from backend.knowledge.schemas import KnowledgeEvidenceCreate
from backend.knowledge.builders import build_evidence_content
from backend.knowledge.retriever import DeterministicMetadataRetriever

init_db()
client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def seed_knowledge():
    db = SessionLocal()
    try:
        PublicDataService.seed_default_datasets(db)
        KnowledgeService.seed_default_knowledge(db)
    finally:
        db.close()


def test_knowledge_evidence_schema_valid():
    ev = KnowledgeEvidenceCreate(
        evidence_id="EVID-001",
        dataset_id="ds-001",
        record_id="rec-001",
        title="Dharashiv Water Coverage",
        content="District Dharashiv records 50.76% tap coverage.",
        state="Maharashtra",
        district="Dharashiv",
        category="Water",
        metric_name="Rural tap coverage",
        metric_value=50.76,
        source_name="Open Government Data Platform India",
        source_reference="REF-01",
    )
    assert ev.evidence_id == "EVID-001"
    assert ev.metric_value == 50.76


def test_knowledge_evidence_schema_invalid_category_rejected():
    with pytest.raises(Exception):
        KnowledgeEvidenceCreate(
            evidence_id="EVID-002",
            dataset_id="ds-001",
            record_id="rec-002",
            title="Invalid",
            content="Some text",
            state="Maharashtra",
            district="Dharashiv",
            category="InvalidCategory",  # type: ignore
            metric_name="Metric",
            source_name="Source",
            source_reference="REF",
        )


def test_knowledge_evidence_schema_empty_content_rejected():
    with pytest.raises(Exception):
        KnowledgeEvidenceCreate(
            evidence_id="EVID-003",
            dataset_id="ds-001",
            record_id="rec-003",
            title="Title",
            content="   ",
            state="Maharashtra",
            district="Dharashiv",
            category="Water",
            metric_name="Metric",
            source_name="Source",
            source_reference="REF",
        )


def test_deterministic_evidence_builder():
    content = build_evidence_content(
        state="Maharashtra",
        district="Dharashiv",
        locality=None,
        metric_name="Rural Household Tap Water Coverage (%)",
        metric_value=50.76,
        unit="%",
        dataset_title="District-wise Rural Household Tap Water Coverage",
        year=2024,
    )
    assert "District Dharashiv (Maharashtra) records Rural Household Tap Water Coverage (%) of 50.76% in 2024" in content


def test_idempotent_dataset_knowledge_ingestion():
    db = SessionLocal()
    try:
        count1 = KnowledgeService.ingest_dataset_to_knowledge(db, "ds-jjm-water-coverage-2024")
        count2 = KnowledgeService.ingest_dataset_to_knowledge(db, "ds-jjm-water-coverage-2024")
        assert count1 == count2
        assert count1 >= 25
    finally:
        db.close()


def test_source_integrity_provenance_test():
    db = SessionLocal()
    try:
        retriever = DeterministicMetadataRetriever(db)
        results, _ = retriever.retrieve(district="Dharashiv", top_k=5)
        assert len(results) >= 1
        d = results[0]
        assert d.district == "Dharashiv"
        assert "Open Government Data" in d.source_name and "Ministry of Jal Shakti" in d.source_name
        assert d.source_reference is not None
    finally:
        db.close()


def test_deterministic_retriever_exact_district():
    db = SessionLocal()
    try:
        retriever = DeterministicMetadataRetriever(db)
        results, total = retriever.retrieve(district="Dharashiv", top_k=5)
        assert total >= 1
        assert any(r.district == "Dharashiv" for r in results)
    finally:
        db.close()


def test_deterministic_retriever_state_filter():
    db = SessionLocal()
    try:
        retriever = DeterministicMetadataRetriever(db)
        results, total = retriever.retrieve(state="Maharashtra", top_k=10)
        assert total >= 1
        for r in results:
            assert r.state == "Maharashtra"
    finally:
        db.close()


def test_deterministic_retriever_category_filter():
    db = SessionLocal()
    try:
        retriever = DeterministicMetadataRetriever(db)
        results, total = retriever.retrieve(category="Water", top_k=10)
        assert total >= 1
        for r in results:
            assert r.category == "Water"
    finally:
        db.close()


def test_deterministic_retriever_top_k_bounds():
    db = SessionLocal()
    try:
        retriever = DeterministicMetadataRetriever(db)
        results, _ = retriever.retrieve(category="Water", top_k=3)
        assert len(results) <= 3

        with pytest.raises(ValueError):
            retriever.retrieve(category="Water", top_k=0)

        with pytest.raises(ValueError):
            retriever.retrieve(category="Water", top_k=25)
    finally:
        db.close()


def test_deterministic_retriever_empty_result():
    db = SessionLocal()
    try:
        retriever = DeterministicMetadataRetriever(db)
        results, total = retriever.retrieve(district="NonExistentDistrictXYZ", top_k=5)
        assert results == []
        assert total == 0
    finally:
        db.close()


def test_api_knowledge_search_success():
    res = client.get("/api/knowledge/search?district=Dharashiv&category=Water")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 1
    assert data["retriever"] == "baseline_metadata"
    assert data["results"][0]["district"] == "Dharashiv"


def test_api_knowledge_search_invalid_top_k():
    res = client.get("/api/knowledge/search?top_k=0")
    assert res.status_code == 422


def test_api_knowledge_dataset_summary():
    res = client.get("/api/knowledge/datasets/ds-jjm-water-coverage-2024")
    assert res.status_code == 200
    data = res.json()
    assert data["dataset_id"] == "ds-jjm-water-coverage-2024"
    assert data["evidence_count"] >= 25


def test_api_knowledge_dataset_summary_404():
    res = client.get("/api/knowledge/datasets/ds-nonexistent")
    assert res.status_code == 404
