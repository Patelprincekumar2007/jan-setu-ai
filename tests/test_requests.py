from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db
from backend.schemas import GeminiExtractionResult

init_db()
client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_post_valid_request_without_gemini():
    payload = {
        "citizen_request": "Drinking water pipeline is leaking continuously in sector 4.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
        "affected_household_count": 85,
    }
    with patch("backend.routes.requests.extract_request_intelligence", return_value=None):
        res = client.post("/api/requests", json=payload)
        assert res.status_code == 201
        data = res.json()
        assert "reference_id" in data
        assert data["status"] == "RECEIVED"

        # Check detail GET
        detail = client.get(f"/api/requests/{data['reference_id']}")
        assert detail.status_code == 200
        detail_data = detail.json()
        assert detail_data["location"]["district"] == "Dharashiv"
        assert detail_data["category"] == "Water"


def test_post_valid_request_with_mocked_gemini():
    payload = {
        "citizen_request": "Primary health centre lacks clean drinking water facility and borewell is non-functional.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
        "affected_household_count": 85,
    }
    mock_extracted = GeminiExtractionResult(
        category="Water",
        severity="High",
        problem_summary="PHC lacks drinking water due to failed borewell.",
        affected_group="PHC patients and staff",
        location_hint="Ward 4 PHC",
        language="English",
    )
    with patch("backend.routes.requests.extract_request_intelligence", return_value=mock_extracted):
        res = client.post("/api/requests", json=payload)
        assert res.status_code == 201
        ref_id = res.json()["reference_id"]

        detail = client.get(f"/api/requests/{ref_id}")
        assert detail.status_code == 200
        d = detail.json()
        assert d["ai_extraction_status"] == "SUCCESS"
        assert d["problem_summary"] == "PHC lacks drinking water due to failed borewell."
        assert d["severity"] == "High"


def test_missing_citizen_request():
    payload = {
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422


def test_missing_state():
    payload = {
        "citizen_request": "Road is damaged.",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Roads",
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422


def test_missing_district():
    payload = {
        "citizen_request": "Road is damaged.",
        "state": "Maharashtra",
        "locality": "Ward 4",
        "category": "Roads",
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422


def test_missing_locality():
    payload = {
        "citizen_request": "Road is damaged.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "category": "Roads",
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422


def test_missing_category():
    payload = {
        "citizen_request": "Road is damaged.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422


def test_negative_affected_household_count():
    payload = {
        "citizen_request": "Road is damaged.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Roads",
        "affected_household_count": -5,
    }
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 422


def test_reference_id_generation_and_uniqueness():
    from backend.database import SessionLocal
    from backend.utils import generate_reference_id, generate_unique_reference_id
    db = SessionLocal()
    try:
        ref1 = generate_reference_id()
        ref2 = generate_reference_id()
        assert ref1.startswith("NL-")
        assert len(ref1) >= 15
        assert ref1 != ref2

        uniq = generate_unique_reference_id(db)
        assert uniq.startswith("NL-")
    finally:
        db.close()


def test_get_existing_request():
    payload = {
        "citizen_request": "Drainage blocked near community hall.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Sanitation",
    }
    post_res = client.post("/api/requests", json=payload)
    ref_id = post_res.json()["reference_id"]

    res = client.get(f"/api/requests/{ref_id}")
    assert res.status_code == 200
    assert res.json()["reference_id"] == ref_id
    assert res.json()["status"] == "RECEIVED"


def test_get_nonexistent_request_returns_404():
    res = client.get("/api/requests/NL-NONEXISTENT-999999")
    assert res.status_code == 404
