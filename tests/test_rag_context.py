import pytest
from pydantic import ValidationError

from rag.context_builder import build_rag_context
from rag.schemas import GroundedAnalysis


def test_context_builder_preserves_request_and_evidence_provenance():
    context = build_rag_context(
        {
            "reference_id": "REQ-2026-ABC12345",
            "citizen_request": "Primary health centre needs drinking water.",
            "category": "Water",
            "state": "Maharashtra",
            "district": "Dharashiv",
            "locality": "Ward 4",
        },
        [{
            "evidence_id": "ke-001",
            "title": "Rural tap water coverage",
            "state": "Maharashtra",
            "district": "Dharashiv",
            "category": "Water",
            "metric_name": "Coverage",
            "metric_value": "50.76",
            "unit": "%",
            "year": 2024,
            "source_name": "Open Government Data Platform India",
            "source_reference": "OGD-JJM-2024-MH-01",
            "content": "District-level public-data record.",
        }],
    )

    assert context["untrusted_citizen_request"]["locality"] == "Ward 4"
    evidence = context["verified_public_evidence"][0]
    assert evidence["evidence_id"] == "ke-001"
    assert evidence["metric_value"] == "50.76"
    assert evidence["source_reference"] == "OGD-JJM-2024-MH-01"
    assert evidence["content"] == "District-level public-data record."


def test_grounded_analysis_schema_requires_evidence_ids_on_observations():
    with pytest.raises(ValidationError):
        GroundedAnalysis.model_validate({
            "summary": "District-level evidence was found.",
            "observations": [{"statement": "Coverage is documented."}],
        })


def test_grounded_analysis_rejects_unexpected_fields():
    with pytest.raises(ValidationError):
        GroundedAnalysis.model_validate({
            "summary": "A summary.",
            "confidence": 0.9,
        })