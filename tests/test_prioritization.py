import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.models import CitizenRequest
from backend.knowledge.models import KnowledgeEvidence
from backend.prioritization.signals import (
    extract_reported_severity_factor,
    extract_affected_households_factor,
    extract_infrastructure_deficit_factor,
    extract_vulnerability_evidence_factor,
    extract_geographic_evidence_coverage_factor,
)
from backend.prioritization.engine import (
    evaluate_priority_assessment,
    determine_priority_band,
    METHODOLOGY_VERSION,
)
from backend.prioritization.service import PrioritizationService
from backend.prioritization.models import RequestPriorityAssessment

init_db()
client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def sample_dharashiv_request(db_session):
    req = CitizenRequest(
        reference_id="NL-20260930-TEST01",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 4",
        category="Water",
        citizen_request="Drinking water supply disrupted for two weeks and borewell is dry.",
        affected_household_count=85,
        severity="HIGH",
        status="RECEIVED",
    )
    db_session.add(req)
    db_session.commit()
    db_session.refresh(req)
    yield req
    db_session.delete(req)
    db_session.commit()

@pytest.fixture
def sample_water_evidence(db_session):
    ev = KnowledgeEvidence(
        evidence_id="EVID-ds-jjm-water-coverage-2024-OGD-JJM-2024-MH-01-TEST",
        dataset_id="ds-jjm-water-coverage-2024",
        record_id="REC-TEST-001",
        title="Dharashiv (Maharashtra) - Rural Household Tap Water Coverage (%)",
        content="District Dharashiv records 50.76% tap water coverage.",
        state="Maharashtra",
        district="Dharashiv",
        category="Water",
        metric_name="Rural Household Tap Water Coverage (%)",
        metric_value=50.76,
        unit="%",
        year=2024,
        source_name="Jal Jeevan Mission",
        source_reference="OGD-JJM-2024-MH-01",
        publisher="Ministry of Jal Shakti",
        license="GODL",
    )
    db_session.add(ev)
    db_session.commit()
    db_session.refresh(ev)
    yield [ev]
    db_session.delete(ev)
    db_session.commit()

def test_determine_priority_band():
    assert determine_priority_band(85.0) == "VERY HIGH"
    assert determine_priority_band(75.0) == "VERY HIGH"
    assert determine_priority_band(74.9) == "HIGH"
    assert determine_priority_band(50.0) == "HIGH"
    assert determine_priority_band(49.9) == "MODERATE"
    assert determine_priority_band(25.0) == "MODERATE"
    assert determine_priority_band(24.9) == "LOW"
    assert determine_priority_band(0.0) == "LOW"

def test_reported_severity_factor():
    req_high = CitizenRequest(reference_id="T1", state="MH", district="D", locality="L", category="Water", citizen_request="desc", severity="HIGH")
    f_high = extract_reported_severity_factor(req_high)
    assert f_high.available is True
    assert f_high.normalized_value == 75.0

    req_crit = CitizenRequest(reference_id="T2", state="MH", district="D", locality="L", category="Water", citizen_request="desc", severity="CRITICAL")
    f_crit = extract_reported_severity_factor(req_crit)
    assert f_crit.available is True
    assert f_crit.normalized_value == 100.0

    req_none = CitizenRequest(reference_id="T3", state="MH", district="D", locality="L", category="Water", citizen_request="desc", severity=None)
    f_none = extract_reported_severity_factor(req_none)
    assert f_none.available is False
    assert f_none.normalized_value is None

def test_affected_households_factor():
    req_85 = CitizenRequest(reference_id="T1", state="MH", district="D", locality="L", category="Water", citizen_request="desc", affected_household_count=85)
    f_85 = extract_affected_households_factor(req_85)
    assert f_85.available is True
    assert 60.0 <= f_85.normalized_value <= 80.0

    req_none = CitizenRequest(reference_id="T2", state="MH", district="D", locality="L", category="Water", citizen_request="desc", affected_household_count=None)
    f_none = extract_affected_households_factor(req_none)
    assert f_none.available is False
    assert f_none.normalized_value is None

def test_infrastructure_deficit_factor(sample_water_evidence):
    f = extract_infrastructure_deficit_factor(sample_water_evidence, "Water")
    assert f.available is True
    # 100 - 50.76 = 49.24
    assert f.normalized_value == 49.24
    assert f.raw_value == 49.24

def test_infrastructure_deficit_missing_evidence():
    f = extract_infrastructure_deficit_factor([], "Water")
    assert f.available is False
    assert f.normalized_value is None

def test_vulnerability_evidence_factor_honest_unavailable():
    f = extract_vulnerability_evidence_factor()
    assert f.available is False
    assert f.normalized_value is None
    assert "No verified vulnerability indicator" in f.explanation

def test_geographic_evidence_coverage_factor(sample_water_evidence):
    req = CitizenRequest(reference_id="T1", state="Maharashtra", district="Dharashiv", locality="Ward 4", category="Water", citizen_request="desc")
    f = extract_geographic_evidence_coverage_factor(req, sample_water_evidence)
    assert f.available is True
    assert f.raw_value == 3.0  # Level 3 match
    assert f.normalized_value == 100.0

def test_deterministic_engine_evaluation(sample_dharashiv_request, sample_water_evidence):
    assessment = evaluate_priority_assessment(sample_dharashiv_request, sample_water_evidence)
    assert assessment.methodology_version == METHODOLOGY_VERSION
    assert 0.0 <= assessment.overall_priority <= 100.0
    assert assessment.priority_band in ["LOW", "MODERATE", "HIGH", "VERY HIGH"]

    # Sum of available contributions should equal overall_priority
    contributions = [f.contribution for f in assessment.factors if f.contribution is not None]
    assert abs(sum(contributions) - assessment.overall_priority) < 0.05

def test_api_calculate_and_get_priority():
    db = SessionLocal()
    try:
        req = CitizenRequest(
            reference_id="NL-20260930-PRIOTEST",
            state="Maharashtra",
            district="Dharashiv",
            locality="Ward 1",
            category="Water",
            citizen_request="Water supply failure",
            affected_household_count=120,
            severity="HIGH",
            status="RECEIVED",
        )
        db.add(req)
        db.commit()

        # 1. GET before POST should return 404
        res_get_before = client.get(f"/api/requests/{req.reference_id}/priority")
        assert res_get_before.status_code == 404

        # 2. POST should compute and persist
        res_post = client.post(f"/api/requests/{req.reference_id}/priority")
        assert res_post.status_code == 200
        data_post = res_post.json()
        assert data_post["overall_priority"] > 0
        assert data_post["priority_band"] in ["LOW", "MODERATE", "HIGH", "VERY HIGH"]
        assert len(data_post["factors"]) == 5

        # 3. GET after POST should return persisted assessment
        res_get_after = client.get(f"/api/requests/{req.reference_id}/priority")
        assert res_get_after.status_code == 200
        data_get = res_get_after.json()
        assert data_get["overall_priority"] == data_post["overall_priority"]
        assert data_get["id"] == data_post["id"]

        # 4. Repeated POST should update existing assessment idempotently (no duplicate rows)
        res_post_repeat = client.post(f"/api/requests/{req.reference_id}/priority")
        assert res_post_repeat.status_code == 200
        count_assessments = (
            db.query(RequestPriorityAssessment)
            .filter(RequestPriorityAssessment.request_reference_id == req.reference_id)
            .count()
        )
        assert count_assessments == 1

        # Clean up
        db.query(RequestPriorityAssessment).filter(RequestPriorityAssessment.request_reference_id == req.reference_id).delete()
        db.query(CitizenRequest).filter(CitizenRequest.reference_id == req.reference_id).delete()
        db.commit()
    finally:
        db.close()


def test_deterministic_repeatability(sample_dharashiv_request, sample_water_evidence):
    # Same inputs must produce exact same score
    res1 = evaluate_priority_assessment(sample_dharashiv_request, sample_water_evidence)
    res2 = evaluate_priority_assessment(sample_dharashiv_request, sample_water_evidence)
    assert res1.overall_priority == res2.overall_priority
    assert res1.priority_band == res2.priority_band
    for f1, f2 in zip(res1.factors, res2.factors):
        assert f1.factor == f2.factor
        assert f1.normalized_value == f2.normalized_value
        assert f1.contribution == f2.contribution


def test_invalid_and_edge_households():
    # Negative households should be marked unavailable with explanation
    req_neg = CitizenRequest(reference_id="T_NEG", state="MH", district="D", locality="L", category="Water", citizen_request="desc", affected_household_count=-10)
    f_neg = extract_affected_households_factor(req_neg)
    assert f_neg.available is False
    assert f_neg.normalized_value is None

    # Zero households is valid 0 normalized value
    req_zero = CitizenRequest(reference_id="T_ZERO", state="MH", district="D", locality="L", category="Water", citizen_request="desc", affected_household_count=0)
    f_zero = extract_affected_households_factor(req_zero)
    assert f_zero.available is True
    assert f_zero.normalized_value == 0.0


def test_jjm_dharashiv_regression_score(sample_dharashiv_request, sample_water_evidence):
    assessment = evaluate_priority_assessment(sample_dharashiv_request, sample_water_evidence)
    # Severity HIGH: 75/100 (wt 30)
    # Households 85: ~70/100 (wt 25)
    # Deficit 49.24%: 49.24/100 (wt 25)
    # Vulnerability: unavailable (wt 10 omitted from denominator)
    # Geo coverage Level 3: 100/100 (wt 10)
    # Available weights sum to 90. Final score should be ~68-72 in HIGH band.
    assert assessment.priority_band in ["HIGH", "VERY HIGH"]
    assert assessment.overall_priority >= 60.0
    assert len(assessment.limitations) >= 1

