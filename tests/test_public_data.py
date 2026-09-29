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


def test_api_list_datasets():
    res = client.get("/api/public-data/datasets")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "datasets" in data
    assert data["total"] >= 1


def test_api_get_dataset_by_id():
    res = client.get("/api/public-data/datasets/ds-jjm-water-coverage-2024")
    assert res.status_code == 200
    data = res.json()
    assert data["dataset_id"] == "ds-jjm-water-coverage-2024"
    assert data["source_name"] is not None


def test_api_get_dataset_404():
    res = client.get("/api/public-data/datasets/ds-nonexistent-dataset")
    assert res.status_code == 404


def test_api_list_dataset_records_and_filters():
    res = client.get(
        "/api/public-data/datasets/ds-jjm-water-coverage-2024/records?state=Maharashtra&district=Dharashiv"
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["records"][0]["district"] == "Dharashiv"
    assert data["records"][0]["state"] == "Maharashtra"
