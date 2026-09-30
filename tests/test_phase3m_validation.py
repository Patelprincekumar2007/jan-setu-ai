from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db
from backend.schemas import GeminiExtractionResult

init_db()
client = TestClient(app)


def test_phase3m_scenario_1_water_gujarati():
    """Scenario 1: Water in Gujarati (Gujarat, Rajkot, 85 households)."""
    payload = {
        "citizen_request": "અમારા વિસ્તારમાં પીવાના પાણીની નિયમિત સમસ્યા છે અને જૂની પાણીની લાઇન વારંવાર બંધ થઈ જાય છે. આશરે 85 પરિવારો અસરગ્રસ્ત છે.",
        "state": "Gujarat",
        "district": "Rajkot",
        "locality": "Ward 7",
        "category": "Water",
        "affected_household_count": 85,
    }

    # 1. Citizen Request Creation
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 201
    data = res.json()
    ref_id = data["reference_id"]
    assert ref_id.startswith("NL-")
    assert data["status"] == "RECEIVED"

    # 2. Persistence and Gujarati Text Preservation
    get_res = client.get(f"/api/requests/{ref_id}")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["citizen_request"] == payload["citizen_request"]
    assert get_data["category"] == "Water"
    assert get_data["location"]["state"] == "Gujarat"
    assert get_data["location"]["district"] == "Rajkot"
    assert get_data["affected_household_count"] == 85
    assert get_data["created_at"] is not None

    # 3. Evidence Retrieval
    ev_res = client.get(f"/api/requests/{ref_id}/evidence")
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["retrieval_status"] in ["COMPLETED", "NO_EVIDENCE", "EVIDENCE_FOUND", "HYBRID_RETRIEVED"]
    assert ev_data["evidence_count"] >= 1
    assert "results" in ev_data
    first_item = ev_data["results"][0]
    first_ev = first_item["evidence"]
    assert first_ev["dataset_id"] == "ds-jjm-water-coverage-2024"
    assert first_ev["district"] == "Rajkot"
    assert "source_reference" in first_ev
    assert "similarity_score" in first_item
    assert "metadata_match_level" in first_item

    # 4. RAG Analysis (Safe fallback or grounded response)
    analysis_res = client.post(f"/api/requests/{ref_id}/analysis")
    assert analysis_res.status_code in [200, 201]
    analysis_data = analysis_res.json()
    assert "analysis" in analysis_data
    inner_analysis = analysis_data["analysis"]
    assert "summary" in inner_analysis
    assert "observations" in inner_analysis
    assert "evidence_used" in inner_analysis
    assert "evidence_gaps" in inner_analysis
    assert "source_references" in inner_analysis
    assert "limitations" in inner_analysis

    # 5. Deterministic Priority Assessment (priority-v1)
    prio_res = client.post(f"/api/requests/{ref_id}/priority")
    assert prio_res.status_code == 200
    prio_data = prio_res.json()
    assert prio_data["methodology_version"] == "priority-v1"
    assert 0 <= prio_data["overall_priority"] <= 100
    assert "factors" in prio_data
    assert len(prio_data["factors"]) > 0

    # Check Priority GET persistence
    prio_get = client.get(f"/api/requests/{ref_id}/priority")
    assert prio_get.status_code == 200
    assert prio_get.json()["overall_priority"] == prio_data["overall_priority"]


def test_phase3m_scenario_2_healthcare_english():
    """Scenario 2: Healthcare in English (Maharashtra, Dharashiv, 120 households)."""
    payload = {
        "citizen_request": "Our local primary health centre has limited functional facilities and residents have difficulty accessing basic healthcare services.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Healthcare",
        "affected_household_count": 120,
    }

    # 1. Submit Request
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 201
    ref_id = res.json()["reference_id"]

    # 2. Persistence Check
    get_res = client.get(f"/api/requests/{ref_id}")
    assert get_res.status_code == 200
    assert get_res.json()["affected_household_count"] == 120
    assert get_res.json()["category"] == "Healthcare"
    assert get_res.json()["location"]["district"] == "Dharashiv"

    # 3. Evidence Retrieval
    ev_res = client.get(f"/api/requests/{ref_id}/evidence")
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["evidence_count"] >= 1
    assert any(r["evidence"]["category"] == "Healthcare" for r in ev_data["results"])

    # 4. RAG Analysis
    analysis_res = client.post(f"/api/requests/{ref_id}/analysis")
    assert analysis_res.status_code in [200, 201]

    # 5. Priority Assessment
    prio_res = client.post(f"/api/requests/{ref_id}/priority")
    assert prio_res.status_code == 200
    assert prio_res.json()["methodology_version"] == "priority-v1"


def test_phase3m_scenario_3_sanitation_hindi():
    """Scenario 3: Sanitation in Hindi (Uttar Pradesh, Varanasi, 100 households)."""
    payload = {
        "citizen_request": "हमारे क्षेत्र में कचरा प्रबंधन की सुविधा पर्याप्त नहीं है और नियमित सफाई की समस्या है।",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "locality": "Sector 2",
        "category": "Sanitation",
        "affected_household_count": 100,
    }

    # 1. Submit Request
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 201
    ref_id = res.json()["reference_id"]

    # 2. Hindi text preservation
    get_res = client.get(f"/api/requests/{ref_id}")
    assert get_res.status_code == 200
    assert get_res.json()["citizen_request"] == payload["citizen_request"]
    assert get_res.json()["location"]["state"] == "Uttar Pradesh"
    assert get_res.json()["location"]["district"] == "Varanasi"

    # 3. Evidence Retrieval
    ev_res = client.get(f"/api/requests/{ref_id}/evidence")
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["evidence_count"] >= 1
    assert any(r["evidence"]["category"] == "Sanitation" for r in ev_data["results"])

    # 4. RAG & Priority
    analysis_res = client.post(f"/api/requests/{ref_id}/analysis")
    assert analysis_res.status_code in [200, 201]

    prio_res = client.post(f"/api/requests/{ref_id}/priority")
    assert prio_res.status_code == 200
    assert prio_res.json()["methodology_version"] == "priority-v1"


def test_phase3m_scenario_4_roads_english():
    """Scenario 4: Roads in English (Maharashtra, Dharashiv, 150 households)."""
    payload = {
        "citizen_request": "Our rural road connection becomes difficult during heavy rainfall and residents have limited reliable road access.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Village Link 3",
        "category": "Roads",
        "affected_household_count": 150,
    }

    # 1. Submit Request
    res = client.post("/api/requests", json=payload)
    assert res.status_code == 201
    ref_id = res.json()["reference_id"]

    # 2. Persistence Check
    get_res = client.get(f"/api/requests/{ref_id}")
    assert get_res.status_code == 200
    assert get_res.json()["location"]["district"] == "Dharashiv"

    # 3. Evidence Retrieval
    ev_res = client.get(f"/api/requests/{ref_id}/evidence")
    assert ev_res.status_code == 200
    ev_data = ev_res.json()
    assert ev_data["evidence_count"] >= 1
    assert any(r["evidence"]["category"] == "Roads" for r in ev_data["results"])

    # 4. RAG & Priority
    analysis_res = client.post(f"/api/requests/{ref_id}/analysis")
    assert analysis_res.status_code in [200, 201]

    prio_res = client.post(f"/api/requests/{ref_id}/priority")
    assert prio_res.status_code == 200
    assert prio_res.json()["methodology_version"] == "priority-v1"


def test_phase3m_ai_extraction_fallback_and_safety():
    """Validate AI extraction safe fallback when Gemini is unavailable and schema when available."""
    # When Gemini returns None (simulating API failure / unavailable key)
    with patch("backend.routes.requests.extract_request_intelligence", return_value=None):
        payload = {
            "citizen_request": "Sanitation pipeline leak in community market.",
            "state": "Maharashtra",
            "district": "Dharashiv",
            "locality": "Market Yard",
            "category": "Sanitation",
            "affected_household_count": 50,
        }
        res = client.post("/api/requests", json=payload)
        assert res.status_code == 201
        data = res.json()
        ref_id = data["reference_id"]

        detail = client.get(f"/api/requests/{ref_id}").json()
        assert detail["ai_extraction_status"] in ["NOT_PROCESSED", "SKIPPED"]
        assert detail["problem_summary"] is None

    # When Gemini returns structured extraction
    mock_extracted = GeminiExtractionResult(
        category="Sanitation",
        severity="High",
        problem_summary="Sanitation pipeline leak in market area causing localized contamination.",
        affected_group="Market vendors and residents",
        location_hint="Market Yard",
        language="English",
    )
    with patch("backend.routes.requests.extract_request_intelligence", return_value=mock_extracted):
        res = client.post("/api/requests", json=payload)
        assert res.status_code == 201
        ref_id2 = res.json()["reference_id"]
        detail2 = client.get(f"/api/requests/{ref_id2}").json()
        assert detail2["ai_extraction_status"] in ["SUCCESS", "COMPLETED"]
        assert detail2["severity"] == "High"
        assert detail2["problem_summary"] is not None


def test_phase3m_hotspots_and_analytics():
    """Validate hotspots and analytics APIs calculate from real stored requests."""
    # Hotspots
    hotspot_res = client.get("/api/hotspots")
    assert hotspot_res.status_code == 200
    hotspots = hotspot_res.json()["hotspots"]
    assert isinstance(hotspots, list)

    # Analytics endpoints
    overview = client.get("/api/analytics/overview")
    assert overview.status_code == 200
    assert "total_requests" in overview.json()

    categories = client.get("/api/analytics/categories")
    assert categories.status_code == 200
    assert isinstance(categories.json()["categories"], list)

    geography = client.get("/api/analytics/geography")
    assert geography.status_code == 200

    timeline = client.get("/api/analytics/timeline")
    assert timeline.status_code == 200

    coverage = client.get("/api/analytics/evidence-coverage")
    assert coverage.status_code == 200

    severity = client.get("/api/analytics/severity")
    assert severity.status_code == 200

    # Date filter sanity checks
    date_filtered = client.get("/api/analytics/overview?date_from=2024-01-01&date_to=2026-12-31")
    assert date_filtered.status_code == 200

    invalid_date = client.get("/api/analytics/overview?date_from=invalid-date")
    assert invalid_date.status_code in [200, 422]


def test_phase3m_datasets_and_provenance():
    """Validate dataset catalog for all 4 sectors with verified provenance."""
    res = client.get("/api/datasets")
    assert res.status_code == 200
    datasets = res.json()["datasets"]
    categories_found = {d["category"] for d in datasets}
    assert {"Water", "Healthcare", "Sanitation", "Roads"}.issubset(categories_found)

    for d in datasets:
        assert d["dataset_id"] is not None
        assert d["publisher"] is not None
        assert d["license"] is not None

        # Verify records endpoint
        records_res = client.get(f"/api/datasets/{d['dataset_id']}/records?limit=10")
        assert records_res.status_code == 200
        assert len(records_res.json()["records"]) > 0

        # Verify quality report
        qr_res = client.get(f"/api/datasets/{d['dataset_id']}/quality")
        assert qr_res.status_code == 200
        assert qr_res.json()["valid_row_count"] > 0

        # Verify knowledge dataset summary
        ke_res = client.get(f"/api/knowledge/datasets/{d['dataset_id']}")
        assert ke_res.status_code == 200
        assert ke_res.json()["evidence_count"] > 0


def test_phase3m_voice_endpoint_safeguards():
    """Validate voice transcription failure handling and safeguards."""
    # 1. Unsupported MIME type
    bad_mime = client.post(
        "/api/voice/transcribe",
        files={"audio_file": ("test.txt", b"plain text content", "text/plain")},
    )
    assert bad_mime.status_code in [400, 415, 422]

    # 2. Oversized audio file (> 25MB)
    huge_payload = b"0" * (26 * 1024 * 1024)
    oversized = client.post(
        "/api/voice/transcribe",
        files={"audio_file": ("huge.wav", huge_payload, "audio/wav")},
    )
    assert oversized.status_code in [400, 413, 422]


def test_phase3m_security_and_failure_modes():
    """Validate security headers, error sanitization, and invalid inputs."""
    # Health check does not expose internal secrets
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert "api_key" not in str(health_res.json()).lower()
    assert "password" not in str(health_res.json()).lower()

    # Invalid reference ID returns 404 cleanly without traceback
    bad_ref = client.get("/api/requests/NL-NONEXISTENT-9999")
    assert bad_ref.status_code == 404

    # Invalid dataset ID returns 404 cleanly
    bad_ds = client.get("/api/datasets/ds-nonexistent-1234/records")
    assert bad_ds.status_code == 404

    # Invalid request payload (missing required field) returns 422 cleanly
    invalid_req = client.post("/api/requests", json={"locality": "Ward 1"})
    assert invalid_req.status_code == 422
