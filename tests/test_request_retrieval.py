from unittest.mock import patch
from fastapi.testclient import TestClient

from backend.main import app
from backend.database import init_db, SessionLocal
from backend.models import CitizenRequest, RequestEvidenceMatch
from backend.schemas import GeminiExtractionResult
from backend.knowledge.query_builder import build_retrieval_query

init_db()
client = TestClient(app)


def test_query_builder_with_extracted_intelligence():
    query = build_retrieval_query(
        problem_summary="Primary health centre lacks clean drinking water facility and borewell is non-functional.",
        category="Water",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 4",
        affected_group="85 households",
        severity="High",
    )
    assert "Dharashiv" in query
    assert "Maharashtra" in query
    assert "Primary health centre" in query
    assert "85 households" in query


def test_query_builder_fallback_to_raw_narrative():
    query = build_retrieval_query(
        citizen_request="No water supply in village pipeline.",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 4",
        category="Water",
    )
    assert "Dharashiv" in query
    assert "No water supply" in query


def test_request_to_retrieval_pipeline_success():
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
        problem_summary="Primary health centre lacks clean drinking water facility and borewell is non-functional.",
        affected_group="85 households",
        location_hint="Ward 4 PHC",
        language="English",
    )

    with patch("backend.routes.requests.extract_request_intelligence", return_value=mock_extracted):
        res = client.post("/api/requests", json=payload)
        assert res.status_code == 201
        ref_id = res.json()["reference_id"]

        # Verify request details
        req_res = client.get(f"/api/requests/{ref_id}")
        assert req_res.status_code == 200
        req_data = req_res.json()
        assert req_data["ai_extraction_status"] == "SUCCESS"
        assert req_data["retrieval_status"] in ("COMPLETED", "NO_EVIDENCE")
        assert req_data["evidence_count"] >= 1

        # Verify evidence endpoint
        ev_res = client.get(f"/api/requests/{ref_id}/evidence")
        assert ev_res.status_code == 200
        ev_data = ev_res.json()
        assert ev_data["reference_id"] == ref_id
        assert ev_data["evidence_count"] >= 1
        assert len(ev_data["results"]) >= 1

        first_ev = ev_data["results"][0]
        assert first_ev["evidence"]["district"] == "Dharashiv"
        assert first_ev["evidence"]["state"] == "Maharashtra"
        assert first_ev["evidence"]["source_name"] is not None
        assert first_ev["retrieval_method"] in ("hybrid", "semantic", "metadata")
        assert first_ev["rank"] == 1


def test_request_to_retrieval_pipeline_gemini_failure_fallback():
    payload = {
        "citizen_request": "Severe drinking water scarcity in Dharashiv primary clinic.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
    }
    # Simulate Gemini failure (returns None)
    with patch("backend.routes.requests.extract_request_intelligence", return_value=None):
        res = client.post("/api/requests", json=payload)
        assert res.status_code == 201
        ref_id = res.json()["reference_id"]

        req_res = client.get(f"/api/requests/{ref_id}")
        assert req_res.status_code == 200
        req_data = req_res.json()
        assert req_data["ai_extraction_status"] == "SKIPPED"
        assert req_data["retrieval_status"] in ("COMPLETED", "NO_EVIDENCE")

        ev_res = client.get(f"/api/requests/{ref_id}/evidence")
        assert ev_res.status_code == 200
        assert ev_res.json()["evidence_count"] >= 1


def test_request_evidence_endpoint_404_for_nonexistent_request():
    res = client.get("/api/requests/NL-NONEXISTENT-000000/evidence")
    assert res.status_code == 404
