from typing import List, Tuple
from backend.models import CitizenRequest
from backend.knowledge.models import KnowledgeEvidence

from backend.prioritization.schemas import PriorityAssessmentResponse, PriorityFactorDetail, PriorityBandType
from backend.prioritization.signals import (
    extract_reported_severity_factor,
    extract_affected_households_factor,
    extract_infrastructure_deficit_factor,
    extract_vulnerability_evidence_factor,
    extract_geographic_evidence_coverage_factor,
)

METHODOLOGY_VERSION = "priority-v1"

def determine_priority_band(score: float) -> PriorityBandType:
    """
    Deterministically maps a 0-100 score into a descriptive decision-support band.
    0-24: LOW
    25-49: MODERATE
    50-74: HIGH
    75-100: VERY HIGH
    """
    if score >= 75.0:
        return "VERY HIGH"
    elif score >= 50.0:
        return "HIGH"
    elif score >= 25.0:
        return "MODERATE"
    else:
        return "LOW"


def evaluate_priority_assessment(
    request: CitizenRequest,
    evidence_items: List[KnowledgeEvidence],
) -> PriorityAssessmentResponse:
    """
    Computes a deterministic, evidence-grounded priority assessment for a citizen request.
    
    Principles:
    1. Zero randomness or AI hallucination.
    2. Unavailable factors are excluded from the denominator rather than forced to zero.
    3. Weights re-normalize across available factors so the final score is strictly in [0.0, 100.0].
    """
    # 1. Extract the 5 deterministic factors
    factors: List[PriorityFactorDetail] = [
        extract_reported_severity_factor(request),
        extract_affected_households_factor(request),
        extract_infrastructure_deficit_factor(evidence_items, getattr(request, "category", None)),
        extract_vulnerability_evidence_factor(),
        extract_geographic_evidence_coverage_factor(request, evidence_items),
    ]

    # 2. Filter available factors and compute total available weight
    available_factors = [f for f in factors if f.available and f.normalized_value is not None]
    total_available_weight = sum(f.weight for f in available_factors)

    if total_available_weight == 0:
        # Extreme fallback if no data whatsoever is available
        overall_score = 0.0
    else:
        # Re-normalize contributions so that sum(contribution) == overall_score (0-100)
        weighted_sum = sum(f.normalized_value * f.weight for f in available_factors)
        overall_score = round(weighted_sum / total_available_weight, 2)

        for f in factors:
            if f.available and f.normalized_value is not None:
                # Effective point contribution to the final 0-100 score
                effective_contribution = (f.normalized_value * f.weight) / total_available_weight
                f.contribution = round(effective_contribution, 2)
            else:
                f.contribution = None

    # 3. Assemble honest technical limitations
    limitations: List[str] = [
        "Priority score is a deterministic decision-support heuristic (priority-v1) and does not constitute an official government directive.",
    ]

    if not any(f.factor == "Infrastructure Deficit" and f.available for f in factors):
        limitations.append("Public infrastructure deficit metric was not available for this sector/district.")
    else:
        limitations.append(f"Public data evidence is evaluated at district granularity ({request.district or 'Unknown district'}) and may not reflect localized ward-level conditions.")

    if not any(f.factor == "Affected Households" and f.available for f in factors):
        limitations.append("Affected household count was not provided in the citizen submission.")
    else:
        limitations.append("Household count is citizen-provided and has not been independently verified via ground census.")

    if not any(f.factor == "Vulnerability Evidence" and f.available for f in factors):
        limitations.append("Verified demographic/socioeconomic vulnerability indicators were unavailable in the active dataset catalog.")

    return PriorityAssessmentResponse(
        request_reference_id=request.reference_id,
        overall_priority=overall_score,
        priority_band=determine_priority_band(overall_score),
        methodology_version=METHODOLOGY_VERSION,
        evidence_count=len(evidence_items),
        factors=factors,
        limitations=limitations,
        generated_at=request.created_at,
    )
