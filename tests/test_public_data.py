from fastapi.testclient import TestClient
import pytest
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.public_data.normalizer import (
    normalize_geographic_name,
    normalize_numeric_metric,
    normalize_integer,
    normalize_category,
)
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate
from backend.public_data.loaders import JJMWaterCoverageLoader
from backend.public_data.service import PublicDataService
from backend.public_data import repository as pub_repo
from backend.public_data.models import Dataset

init_db()

client = TestClient(app)


def test_geographic_normalization_casing_and_whitespace():
    assert normalize_geographic_name("  MAHARASHTRA  ") == "Maharashtra"
    assert normalize_geographic_name("dharashiv") == "Dharashiv"
    assert normalize_geographic_name("south   24   parganas") == "South 24 Parganas"


def test_geographic_normalization_empty_and_null_values():
    assert normalize_geographic_name(None) is None
    assert normalize_geographic_name("") is None
    assert normalize_geographic_name("   ") is None


def test_numeric_metric_normalization():
    assert normalize_numeric_metric("50.76") == 50.76
    assert normalize_numeric_metric("50.76%") == 50.76
    assert normalize_numeric_metric("1,234.5") == 1234.5
    assert normalize_numeric_metric(75.5) == 75.5


def test_numeric_metric_invalid_and_missing_values():
    assert normalize_numeric_metric("NA") is None
    assert normalize_numeric_metric("N/A") is None
    assert normalize_numeric_metric("-") is None
    assert normalize_numeric_metric(None) is None
    assert normalize_numeric_metric("invalid_text") is None


def test_integer_normalization():
    assert normalize_integer("2024") == 2024
    assert normalize_integer("1,000") == 1000
    assert normalize_integer(2024) == 2024
    assert normalize_integer("NA") is None


def test_category_normalization():
    assert normalize_category("water") == "Water"
    assert normalize_category("Drinking Water supply") == "Water"
    assert normalize_category("Pothole repair") == "Roads"
    assert normalize_category("PHC hospital clinic") == "Healthcare"
    assert normalize_category("drainage cleaning") == "Sanitation"
    assert normalize_category("random xyz") == "Other"


def test_dataset_create_valid_schema():
    ds = DatasetCreate(
        dataset_id="ds-test-01",
        title="Test Civic Dataset",
        source_name="Open Data Portal",
    )
    assert ds.dataset_id == "ds-test-01"
    assert ds.ingestion_status == "NOT_INGESTED"


def test_dataset_create_missing_source_url_allowed():
    ds = DatasetCreate(
        dataset_id="ds-test-02",
        title="Test Civic Dataset 2",
        source_name="Open Data Portal",
        source_url=None,
    )
    assert ds.source_url is None


def test_dataset_create_invalid_status_rejected():
    with pytest.raises(Exception):
        DatasetCreate(
            dataset_id="ds-test-03",
            title="Test Dataset",
            source_name="Portal",
            ingestion_status="INVALID_STATUS",  # type: ignore
        )


def test_dataset_create_empty_title_rejected():
    with pytest.raises(Exception):
        DatasetCreate(
            dataset_id="ds-test-04",
            title="   ",
            source_name="Portal",
        )


def test_public_data_record_create_valid_schema():
    rec = PublicDataRecordCreate(
        record_id="rec-001",
        dataset_id="ds-001",
        state="Maharashtra",
        district="Dharashiv",
        category="Water",
        metric_name="Tap water coverage",
        metric_value=50.76,
        source_reference="REF-01",
    )
    assert rec.record_id == "rec-001"
    assert rec.metric_value == 50.76


def test_public_data_record_invalid_category_rejected():
    with pytest.raises(Exception):
        PublicDataRecordCreate(
            record_id="rec-002",
            dataset_id="ds-001",
            state="Maharashtra",
            district="Dharashiv",
            category="InvalidCategory",  # type: ignore
            metric_name="Tap water",
            source_reference="REF-02",
        )


def test_public_data_record_invalid_metric_value_rejected():
    with pytest.raises(Exception):
        PublicDataRecordCreate(
            record_id="rec-003",
            dataset_id="ds-001",
            state="Maharashtra",
            district="Dharashiv",
            category="Water",
            metric_name="Tap water",
            metric_value="NOT_A_FLOAT",  # type: ignore
            source_reference="REF-03",
        )


def test_dataset_repository_crud():
    db = SessionLocal()
    try:
        ds_in = DatasetCreate(
            dataset_id="ds-crud-test",
            title="CRUD Test Dataset",
            source_name="Test Source",
        )
        existing = pub_repo.get_dataset(db, "ds-crud-test")
        if not existing:
            created = pub_repo.create_dataset(db, ds_in)
            assert created.dataset_id == "ds-crud-test"

        rec = pub_repo.get_dataset(db, "ds-crud-test")
        assert rec is not None
        assert rec.title == "CRUD Test Dataset"
    finally:
        db.query(Dataset).filter(Dataset.dataset_id == "ds-crud-test").delete()
        db.commit()
        db.close()



def test_jjm_loader_and_provenance_preservation():
    loader = JJMWaterCoverageLoader()
    dataset, records = loader.load()
    assert dataset.dataset_id == "ds-jjm-water-coverage-2024"
    assert len(records) >= 25

    dharashiv_records = [r for r in records if r.district == "Dharashiv"]
    assert len(dharashiv_records) == 1
    d = dharashiv_records[0]
    assert d.state == "Maharashtra"
    assert d.category == "Water"
    assert d.metric_value is not None


def test_all_four_dataset_loaders():
    from backend.public_data.loaders import (
        JJMWaterCoverageLoader,
        NHMHealthInfrastructureLoader,
        SBMSanitationCoverageLoader,
        PMGSYRoadConnectivityLoader,
    )
    
    # 1. Water
    ds_w, recs_w = JJMWaterCoverageLoader().load()
    assert ds_w.dataset_id == "ds-jjm-water-coverage-2024"
    assert ds_w.category == "Water"
    assert len(recs_w) == 25
    
    # 2. Healthcare
    ds_h, recs_h = NHMHealthInfrastructureLoader().load()
    assert ds_h.dataset_id == "ds-nhm-health-facilities-2024"
    assert ds_h.category == "Healthcare"
    assert len(recs_h) == 25
    
    # 3. Sanitation
    ds_s, recs_s = SBMSanitationCoverageLoader().load()
    assert ds_s.dataset_id == "ds-sbm-sanitation-coverage-2024"
    assert ds_s.category == "Sanitation"
    assert len(recs_s) == 25
    
    # 4. Roads
    ds_r, recs_r = PMGSYRoadConnectivityLoader().load()
    assert ds_r.dataset_id == "ds-pmgsy-road-connectivity-2024"
    assert ds_r.category == "Roads"
    assert len(recs_r) == 25


def test_dataset_registry_manifest():
    from backend.public_data.registry import DatasetRegistry
    datasets = DatasetRegistry.get_registered_datasets()
    assert len(datasets) >= 4
    cat_set = {d.category for d in datasets}
    assert {"Water", "Healthcare", "Sanitation", "Roads"}.issubset(cat_set)



def test_ingestion_idempotency():
    db = SessionLocal()
    try:
        from backend.public_data.loaders import JJMWaterCoverageLoader
        loader = JJMWaterCoverageLoader()
        
        # Ingest once
        _, count1 = PublicDataService.ingest_dataset(db, loader)
        # Ingest again
        _, count2 = PublicDataService.ingest_dataset(db, loader)
        
        assert count1 == 25
        assert count2 == 25
        
        # Verify no duplicate records in DB
        recs, total = pub_repo.list_public_records(db, dataset_id="ds-jjm-water-coverage-2024", limit=100)
        assert total == 25
    finally:
        db.close()


def test_api_list_datasets():
    res = client.get("/api/datasets")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "datasets" in data
    assert data["total"] >= 4


def test_api_get_dataset_by_id():
    for ds_id in [
        "ds-jjm-water-coverage-2024",
        "ds-nhm-health-facilities-2024",
        "ds-sbm-sanitation-coverage-2024",
        "ds-pmgsy-road-connectivity-2024",
    ]:
        res = client.get(f"/api/datasets/{ds_id}")
        assert res.status_code == 200
        data = res.json()
        assert data["dataset_id"] == ds_id
        assert data["source_name"] is not None


def test_api_get_dataset_404():
    res = client.get("/api/datasets/ds-nonexistent-dataset")
    assert res.status_code == 404


def test_api_list_dataset_records_and_filters():
    res = client.get(
        "/api/datasets/ds-jjm-water-coverage-2024/records?state=Maharashtra&district=Dharashiv"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["records"][0]["district"] == "Dharashiv"
    assert data["records"][0]["state"] == "Maharashtra"


def test_api_dataset_quality_report():
    for ds_id in [
        "ds-jjm-water-coverage-2024",
        "ds-nhm-health-facilities-2024",
        "ds-sbm-sanitation-coverage-2024",
        "ds-pmgsy-road-connectivity-2024",
    ]:
        res = client.get(f"/api/datasets/{ds_id}/quality")
        assert res.status_code == 200
        data = res.json()
        assert data["dataset_id"] == ds_id
        assert data["valid_row_count"] == 25
        assert data["duplicate_count"] == 0
        assert data["knowledge_evidence_count"] == 25

