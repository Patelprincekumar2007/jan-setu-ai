import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.models import CitizenRequest

init_db()
client = TestClient(app)

def test_security_headers_present():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

def test_cors_options_preflight():
    response = client.options(
        "/api/requests",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers

def test_sql_injection_resilience():
    # Attempt SQL injection through filters
    sql_payload = "' OR 1=1 --"
    response = client.get(f"/api/hotspots?district={sql_payload}")
    assert response.status_code == 200
    data = response.json()
    # Must treat as literal string and find no matching district
    assert data["total_hotspots"] == 0

    response_cat = client.get(f"/api/analytics/categories?district={sql_payload}")
    assert response_cat.status_code == 200
    data_cat = response_cat.json()
    assert data_cat["total_requests"] == 0

def test_path_traversal_resilience():
    bad_id = "../../../etc/passwd"
    response = client.get(f"/api/datasets/{bad_id}")
    assert response.status_code == 404

    bad_hotspot_id = "..\\..\\windows\\system32"
    response_hs = client.get(f"/api/hotspots/{bad_hotspot_id}")
    assert response_hs.status_code == 404

def test_negative_households_validation():
    payload = {
        "citizen_request": "Sanitation pipeline issue",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 1",
        "category": "Sanitation",
        "affected_household_count": -50,  # Negative households
    }
    response = client.post("/api/requests", json=payload)
    # Schema validation rejects negative counts with 422
    assert response.status_code in [400, 422]

def test_sanitized_error_handling():
    # Calling non-existent endpoint
    response = client.get("/api/non-existent-endpoint-xyz")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    # Ensure no Python traceback is included
    assert "Traceback" not in response.text

def test_rate_limiting_behavior():
    # Rapid POST requests to check rate limiting middleware
    for _ in range(65):
        client.post(
            "/api/voice/transcribe",
            files={"file": ("test.wav", b"dummy", "audio/wav")},
        )
    # Beyond 60 requests/min, rate limit triggers 429
    res_limited = client.post(
        "/api/voice/transcribe",
        files={"file": ("test.wav", b"dummy", "audio/wav")},
    )
    assert res_limited.status_code in [429, 503]
