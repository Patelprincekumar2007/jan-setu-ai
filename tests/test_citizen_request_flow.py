import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.dataset import Dataset
from app.models.evidence import Evidence
from app.models.citizen_request import RequestEvidenceMatch
from app.services.gemini_service import gemini_service
from app.services.hybrid_retrieval_service import hybrid_retrieval_service


@pytest.fixture
def request_api(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSession()
    db.add(Dataset(
        id="ds-water",
        name="Water coverage",
        organization="Open Government Data Platform India",
        dataset_identifier="OGD-JJM-2024-MH-01",
        category="Water",
    ))
    db.add(Evidence(
        id="ev-1",
        dataset_id="ds-water",
        evidence_identifier="ke-001",
        source_name="Open Government Data Platform India",
        source_organization="Government of India",
        source_url="https://example.test/water",
        title="Dharashiv rural tap-water coverage",
        description="District-level rural tap water coverage record.",
        state="Maharashtra",
        district="Dharashiv",
        locality=None,
        category="Water",
        reporting_period="2024",
        metric_name="Rural tap water coverage",
        metric_value="50.76%",
        raw_text="OGD-JJM-2024-MH-01",
        extra_metadata={"source_reference": "OGD-JJM-2024-MH-01", "year": 2024},
    ))
    db.commit()

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    monkeypatch.setattr(
        gemini_service,
        "understand_complaint_with_status",
        lambda **kwargs: ({
            "problem_summary": "Health centre drinking water facility unavailable; borewell non-functional",
            "category": "Water",
            "affected_group": "Patients and staff",
            "severity": "high",
        }, "COMPLETED"),
    )
    monkeypatch.setattr(
        hybrid_retrieval_service,
        "search",
        lambda **kwargs: {
            "results": [{
                "evidence_id": "ke-001",
                "retrieval_method": "hybrid",
                "similarity_score": 0.82,
                "metadata_match_level": 3,
            }]
        },
    )
    client = TestClient(app)
    try:
        yield client, db
    finally:
        app.dependency_overrides.clear()
        db.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


def request_payload():
    return {
        "citizen_request": "Primary health centre lacks clean drinking water facility and borewell is non-functional.",
        "category": "Water",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "affected_households": 85,
    }


def test_request_runs_extraction_retrieval_and_persists_evidence(request_api):
    client, db = request_api

    response = client.post("/api/requests", json=request_payload())

    assert response.status_code == 201
    created = response.json()
    assert created["reference_id"].startswith("REQ-")
    assert created["status"] == "RECEIVED"
    assert created["ai_extraction_status"] == "COMPLETED"
    assert created["retrieval_status"] == "COMPLETED"
    assert created["evidence_count"] == 1
    assert "health centre drinking water" in created["retrieval_query"].lower()
    assert "Dharashiv" in created["retrieval_query"]

    matches = db.query(RequestEvidenceMatch).filter_by(request_id=created["reference_id"]).all()
    assert len(matches) == 1
    assert matches[0].evidence_id == "ke-001"
    assert matches[0].retrieval_method == "hybrid"
    assert matches[0].rank == 1

    status_response = client.get(f"/api/requests/{created['reference_id']}")
    assert status_response.status_code == 200
    assert status_response.json()["evidence_count"] == 1

    evidence_response = client.get(f"/api/requests/{created['reference_id']}/evidence")
    evidence_result = evidence_response.json()["results"][0]
    assert evidence_response.status_code == 200
    assert evidence_result["evidence"]["evidence_id"] == "ke-001"
    assert evidence_result["source"]["source_reference"] == "OGD-JJM-2024-MH-01"


def test_request_continues_when_gemini_extraction_fails(request_api, monkeypatch):
    client, _ = request_api
    monkeypatch.setattr(
        gemini_service,
        "understand_complaint_with_status",
        lambda **kwargs: ({"problem_summary": kwargs["original_narrative"]}, "FAILED"),
    )

    response = client.post("/api/requests", json=request_payload())

    assert response.status_code == 201
    assert response.json()["ai_extraction_status"] == "FAILED"
    assert response.json()["retrieval_status"] == "COMPLETED"


def test_request_persists_when_retrieval_fails(request_api, monkeypatch):
    client, _ = request_api
    monkeypatch.setattr(
        hybrid_retrieval_service,
        "search",
        lambda **kwargs: (_ for _ in ()).throw(RuntimeError("private provider detail")),
    )

    response = client.post("/api/requests", json=request_payload())

    assert response.status_code == 201
    assert response.json()["status"] == "RECEIVED"
    assert response.json()["retrieval_status"] == "FAILED"
    assert "private provider detail" not in response.text