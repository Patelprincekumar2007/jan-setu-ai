import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.models import CitizenRequest, RequestEvidenceMatch
from backend.hotspots.aggregator import aggregate_citizen_demand, METHODOLOGY_VERSION
from backend.hotspots.detector import detect_hotspots_from_aggregates, generate_hotspot_id
from backend.hotspots.service import HotspotService

init_db()
client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_empty_database_aggregation(db_session):
    # If no requests match a filter, aggregation must return empty list (no fake clusters)
    res = aggregate_citizen_demand(db_session, district_filter="NonExistentDistrict999")
    assert res == []
    hotspots = detect_hotspots_from_aggregates(res)
    assert hotspots == []

def test_generate_hotspot_id():
    hid1 = generate_hotspot_id("Maharashtra", "Dharashiv", "Ward 4", "Water")
    assert hid1 == "HS-MAHARASHTRA-DHARASHIV-WARD-4-WATER"
    hid2 = generate_hotspot_id("Punjab", "Ludhiana", None, "Roads")
    assert hid2 == "HS-PUNJAB-LUDHIANA-ROADS"

def test_aggregation_and_detection_with_real_requests(db_session):
    # Insert test citizen requests with unique locality for isolation
    req1 = CitizenRequest(
        reference_id="NL-HOTSPOT-TEST-01",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 99-Test",
        category="Water",
        citizen_request="Borewell motor damaged",
        affected_household_count=40,
        severity="HIGH",
        status="RECEIVED",
    )
    req2 = CitizenRequest(
        reference_id="NL-HOTSPOT-TEST-02",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 99-Test",
        category="Water",
        citizen_request="Pipeline broken near main road",
        affected_household_count=60,
        severity="CRITICAL",
        status="RECEIVED",
    )
    req3 = CitizenRequest(
        reference_id="NL-HOTSPOT-TEST-03",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 99-Test",
        category="Healthcare",
        citizen_request="Primary health clinic doctor absent",
        affected_household_count=None,
        severity="MEDIUM",
        status="RECEIVED",
    )

    db_session.add_all([req1, req2, req3])
    db_session.commit()
    db_session.refresh(req1)
    db_session.refresh(req2)
    db_session.refresh(req3)

    # Link evidence match for req1
    ev_match = RequestEvidenceMatch(
        request_id=req1.id,
        evidence_id="EVID-TEST-001",
        retrieval_method="hybrid",
        rank=1,
        similarity_score=0.92,
        metadata_match_level=3,
    )
    db_session.add(ev_match)
    db_session.commit()

    try:
        # Aggregation for Dharashiv Ward 99-Test
        aggs = aggregate_citizen_demand(db_session, locality_filter="Ward 99-Test")
        assert len(aggs) == 2  # Water cluster and Healthcare cluster

        # Find the Ward 99-Test Water cluster
        water_cluster = next((a for a in aggs if a["locality"] == "Ward 99-Test" and a["category"] == "Water"), None)
        assert water_cluster is not None
        assert water_cluster["request_count"] == 2
        assert water_cluster["affected_households"] == 100  # 40 + 60
        assert water_cluster["high_severity_request_count"] == 2
        assert water_cluster["severity_distribution"]["HIGH"] == 1
        assert water_cluster["severity_distribution"]["CRITICAL"] == 1
        assert water_cluster["evidence_count"] >= 1
        assert water_cluster["evidence_coverage"] == 50.0  # 1 out of 2 requests has linked evidence

        # Find the Ward 99-Test Healthcare cluster
        health_cluster = next((a for a in aggs if a["locality"] == "Ward 99-Test" and a["category"] == "Healthcare"), None)
        assert health_cluster is not None
        assert health_cluster["request_count"] == 1
        assert health_cluster["affected_households"] is None  # Preserves null instead of 0

        # Detect hotspots
        hotspots = detect_hotspots_from_aggregates(aggs)
        assert len(hotspots) == 2
        hs_water = next((h for h in hotspots if h.category == "Water"), None)
        assert hs_water is not None
        assert hs_water.methodology_version == METHODOLOGY_VERSION
        assert hs_water.factors.request_count == 2
        assert hs_water.factors.affected_households == 100
        assert len(hs_water.limitations) >= 2
    finally:
        # Clean up test rows
        db_session.query(RequestEvidenceMatch).filter(RequestEvidenceMatch.request_id.in_([req1.id, req2.id, req3.id])).delete()
        db_session.query(CitizenRequest).filter(CitizenRequest.reference_id.in_([
            "NL-HOTSPOT-TEST-01", "NL-HOTSPOT-TEST-02", "NL-HOTSPOT-TEST-03"
        ])).delete()
        db_session.commit()

def test_api_hotspots_endpoints():
    db = SessionLocal()
    req = CitizenRequest(
        reference_id="NL-API-HS-TEST-01",
        state="Maharashtra",
        district="Dharashiv",
        locality="Sector 2",
        category="Roads",
        citizen_request="Potholes on bypass road",
        affected_household_count=15,
        severity="MEDIUM",
        status="RECEIVED",
    )
    db.add(req)
    db.commit()

    try:
        # 1. GET /api/hotspots
        res = client.get("/api/hotspots?district=Dharashiv&category=Roads")
        assert res.status_code == 200
        data = res.json()
        assert data["methodology_version"] == "hotspot-v1"
        assert data["total_hotspots"] >= 1
        found = any(h["hotspot_id"] == "HS-MAHARASHTRA-DHARASHIV-SECTOR-2-ROADS" for h in data["hotspots"])
        assert found is True

        # 2. GET /api/hotspots/{hotspot_id}
        res_detail = client.get("/api/hotspots/HS-MAHARASHTRA-DHARASHIV-SECTOR-2-ROADS")
        assert res_detail.status_code == 200
        detail_data = res_detail.json()
        assert detail_data["hotspot_id"] == "HS-MAHARASHTRA-DHARASHIV-SECTOR-2-ROADS"
        assert detail_data["category"] == "Roads"
        assert detail_data["factors"]["request_count"] == 1

        # 3. GET /api/hotspots/NON_EXISTENT -> 404
        res_404 = client.get("/api/hotspots/HS-DOES-NOT-EXIST-CLUSTER-999")
        assert res_404.status_code == 404

        # 4. GET /api/analytics/overview
        res_ov = client.get("/api/analytics/overview")
        assert res_ov.status_code == 200
        ov_data = res_ov.json()
        assert ov_data["total_requests"] >= 1
        assert ov_data["verified_datasets"] >= 4
        assert ov_data["evidence_records"] >= 100
    finally:
        db.query(CitizenRequest).filter(CitizenRequest.reference_id == "NL-API-HS-TEST-01").delete()
        db.commit()
        db.close()


def test_filters_and_category_separation(db_session):
    req_water = CitizenRequest(
        reference_id="NL-FILTER-TEST-01",
        state="Karnataka",
        district="Belagavi",
        locality="Ward 10",
        category="Water",
        citizen_request="Water outage",
        affected_household_count=25,
        severity="LOW",
        status="RECEIVED",
    )
    req_roads = CitizenRequest(
        reference_id="NL-FILTER-TEST-02",
        state="Karnataka",
        district="Belagavi",
        locality="Ward 10",
        category="Roads",
        citizen_request="Road repair needed",
        affected_household_count=50,
        severity="MEDIUM",
        status="RECEIVED",
    )
    db_session.add_all([req_water, req_roads])
    db_session.commit()

    try:
        # 1. Filter by category Water
        res_w = client.get("/api/hotspots?state=Karnataka&district=Belagavi&category=Water")
        assert res_w.status_code == 200
        data_w = res_w.json()
        assert len(data_w["hotspots"]) == 1
        assert data_w["hotspots"][0]["category"] == "Water"
        assert data_w["hotspots"][0]["factors"]["request_count"] == 1

        # 2. Filter by category Roads
        res_r = client.get("/api/hotspots?state=Karnataka&district=Belagavi&category=Roads")
        assert res_r.status_code == 200
        data_r = res_r.json()
        assert len(data_r["hotspots"]) == 1
        assert data_r["hotspots"][0]["category"] == "Roads"
        assert data_r["hotspots"][0]["factors"]["request_count"] == 1

        # 3. Filter without category should return 2 distinct clusters
        res_all = client.get("/api/hotspots?state=Karnataka&district=Belagavi")
        assert res_all.status_code == 200
        data_all = res_all.json()
        assert len(data_all["hotspots"]) == 2
    finally:
        db_session.query(CitizenRequest).filter(CitizenRequest.reference_id.in_(["NL-FILTER-TEST-01", "NL-FILTER-TEST-02"])).delete()
        db_session.commit()

