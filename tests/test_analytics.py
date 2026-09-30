import pytest
import datetime
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.models import CitizenRequest, RequestEvidenceMatch

init_db()
client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_analytics_empty_dataset(db_session):
    # Filter with non-existent district
    res_cat = client.get("/api/analytics/categories?district=NonExistent999")
    assert res_cat.status_code == 200
    data_cat = res_cat.json()
    assert data_cat["total_requests"] == 0
    assert data_cat["categories"] == []

    res_geo = client.get("/api/analytics/geography?category=NonExistentCategory999")
    assert res_geo.status_code == 200
    data_geo = res_geo.json()
    assert data_geo["total_requests"] == 0
    assert data_geo["locations"] == []

    res_cov = client.get("/api/analytics/evidence-coverage?district=NonExistent999")
    assert res_cov.status_code == 200
    data_cov = res_cov.json()
    assert data_cov["total_requests"] == 0
    assert data_cov["coverage_percentage"] is None  # Null if zero requests, not 0

def test_analytics_with_data(db_session):
    now = datetime.datetime.now(datetime.timezone.utc)
    req1 = CitizenRequest(
        reference_id="NL-ANALYTICS-TEST-01",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 1",
        category="Water",
        citizen_request="Water problem",
        affected_household_count=50,
        severity="HIGH",
        status="RECEIVED",
        created_at=now,
    )
    req2 = CitizenRequest(
        reference_id="NL-ANALYTICS-TEST-02",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 2",
        category="Sanitation",
        citizen_request="Drainage overflow",
        affected_household_count=30,
        severity=None,  # Missing severity
        status="RECEIVED",
        created_at=now,
    )
    db_session.add_all([req1, req2])
    db_session.commit()
    db_session.refresh(req1)
    db_session.refresh(req2)

    ev_match = RequestEvidenceMatch(
        request_id=req1.id,
        evidence_id="EVID-TEST-ANALYTICS-01",
        retrieval_method="hybrid",
        rank=1,
        similarity_score=0.9,
        metadata_match_level=3,
    )
    db_session.add(ev_match)
    db_session.commit()

    try:
        # 1. Categories
        res_cat = client.get("/api/analytics/categories?district=Dharashiv")
        assert res_cat.status_code == 200
        cat_data = res_cat.json()
        assert cat_data["total_requests"] >= 2
        categories = [c["category"] for c in cat_data["categories"]]
        assert "Water" in categories
        assert "Sanitation" in categories

        # 2. Geography
        res_geo = client.get("/api/analytics/geography")
        assert res_geo.status_code == 200
        geo_data = res_geo.json()
        assert geo_data["total_requests"] >= 2
        assert geo_data["total_locations"] >= 1

        # 3. Timeline
        res_time = client.get("/api/analytics/timeline?district=Dharashiv")
        assert res_time.status_code == 200
        time_data = res_time.json()
        assert time_data["total_days"] >= 1
        today_str = now.strftime("%Y-%m-%d")
        assert any(p["date"] == today_str for p in time_data["timeline"])

        # 4. Evidence Coverage
        res_cov = client.get("/api/analytics/evidence-coverage?district=Dharashiv")
        assert res_cov.status_code == 200
        cov_data = res_cov.json()
        assert cov_data["total_requests"] >= 2
        assert cov_data["requests_with_evidence"] >= 1
        assert cov_data["coverage_percentage"] is not None
        assert 0.0 <= cov_data["coverage_percentage"] <= 100.0

        # 5. Severity distribution (missing severity must be in UNSPECIFIED, not LOW)
        res_sev = client.get("/api/analytics/severity?district=Dharashiv")
        assert res_sev.status_code == 200
        sev_data = res_sev.json()
        assert sev_data["counts"]["HIGH"] >= 1
        assert sev_data["counts"]["UNSPECIFIED"] >= 1
    finally:
        db_session.query(RequestEvidenceMatch).filter(RequestEvidenceMatch.request_id.in_([req1.id, req2.id])).delete()
        db_session.query(CitizenRequest).filter(CitizenRequest.reference_id.in_(["NL-ANALYTICS-TEST-01", "NL-ANALYTICS-TEST-02"])).delete()
        db_session.commit()

def test_date_range_validation():
    # Inverted date range must return 400 Bad Request
    res_inv = client.get("/api/analytics/categories?start_date=2026-12-31&end_date=2026-01-01")
    assert res_inv.status_code == 400

    # Malformed date string must return 400 Bad Request
    res_bad = client.get("/api/analytics/timeline?start_date=invalid-date")
    assert res_bad.status_code == 400
