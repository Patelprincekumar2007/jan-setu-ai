import math
from typing import Optional, List, Dict, Any
from backend.models import CitizenRequest
from backend.knowledge.models import KnowledgeEvidence
from backend.prioritization.schemas import PriorityFactorDetail


SEVERITY_SCORES = {
    "LOW": 25.0,
    "MEDIUM": 50.0,
    "HIGH": 75.0,
    "CRITICAL": 100.0,
}

def extract_reported_severity_factor(request: CitizenRequest) -> PriorityFactorDetail:
    """
    Evaluates reported urgency from citizen submission / Gemini extraction.
    """
    sev_str = getattr(request, "severity", None)
    if not sev_str or sev_str.strip().upper() not in SEVERITY_SCORES:
        return PriorityFactorDetail(
            factor="Reported Severity",
            raw_value=None,
            normalized_value=None,
            weight=30.0,
            available=False,
            contribution=None,
            source="Citizen Request (Severity unavailable)",
            evidence_ids=[],
            explanation="Severity rating was not explicitly determined or provided for this request.",
        )

    norm_sev = sev_str.strip().upper()
    score = SEVERITY_SCORES[norm_sev]
    return PriorityFactorDetail(
        factor="Reported Severity",
        raw_value=score,
        normalized_value=score,
        weight=30.0,
        available=True,
        contribution=None,  # Computed by engine after weight re-normalization
        source=f"Citizen Request ({norm_sev} urgency)",
        evidence_ids=[],
        explanation=f"Reported urgency evaluated as {norm_sev}, yielding a {score:.1f}/100 severity baseline.",
    )


def extract_affected_households_factor(request: CitizenRequest) -> PriorityFactorDetail:
    """
    Evaluates self-reported household impact using a deterministic saturation function.
    Scale: 1 household -> ~15, 50 households -> ~60, 200 households -> ~85, 500+ households -> 100.
    """
    hh_count = getattr(request, "affected_household_count", None)
    if hh_count is None or hh_count < 0:
        return PriorityFactorDetail(
            factor="Affected Households",
            raw_value=None,
            normalized_value=None,
            weight=25.0,
            available=False,
            contribution=None,
            source="Citizen Request (Count not provided)",
            evidence_ids=[],
            explanation="Household impact was not provided by the citizen.",
        )

    if hh_count == 0:
        norm_val = 0.0
    else:
        # Saturation formula: min(100, log10(hh_count + 1) / log10(501) * 100)
        norm_val = min(100.0, (math.log10(hh_count + 1) / math.log10(501.0)) * 100.0)

    return PriorityFactorDetail(
        factor="Affected Households",
        raw_value=float(hh_count),
        normalized_value=round(norm_val, 2),
        weight=25.0,
        available=True,
        contribution=None,
        source=f"Citizen Submission ({hh_count} households)",
        evidence_ids=[],
        explanation=f"Self-reported citizen impact of {hh_count} households normalizes to {norm_val:.1f}/100 on standard population saturation scale.",
    )


def extract_infrastructure_deficit_factor(
    evidence_items: List[KnowledgeEvidence],
    category: Optional[str] = None,
) -> PriorityFactorDetail:
    """
    Evaluates verified infrastructure deficits from official open public datasets.
    If source metric represents coverage percentage P (0-100), deficit is (100 - P).
    """
    if not evidence_items:
        return PriorityFactorDetail(
            factor="Infrastructure Deficit",
            raw_value=None,
            normalized_value=None,
            weight=25.0,
            available=False,
            contribution=None,
            source="No supporting public baseline found",
            evidence_ids=[],
            explanation="No directly comparable infrastructure-deficit indicator was available in verified public datasets.",
        )

    # Find the most relevant matching evidence record with a valid numeric coverage percentage
    valid_evidence = None
    for ev in evidence_items:
        if ev.metric_value is not None and 0.0 <= ev.metric_value <= 100.0:
            valid_evidence = ev
            break

    if not valid_evidence:
        return PriorityFactorDetail(
            factor="Infrastructure Deficit",
            raw_value=None,
            normalized_value=None,
            weight=25.0,
            available=False,
            contribution=None,
            source="Public evidence lacked valid percentage metric",
            evidence_ids=[e.evidence_id for e in evidence_items],
            explanation="Public evidence records do not contain a direct 0-100 coverage baseline metric.",
        )

    coverage_pct = float(valid_evidence.metric_value)
    deficit_pct = max(0.0, min(100.0, 100.0 - coverage_pct))

    return PriorityFactorDetail(
        factor="Infrastructure Deficit",
        raw_value=round(deficit_pct, 2),
        normalized_value=round(deficit_pct, 2),
        weight=25.0,
        available=True,
        contribution=None,
        source=f"{valid_evidence.source_name} ({valid_evidence.source_reference})",
        evidence_ids=[valid_evidence.evidence_id],
        explanation=f"Verified public baseline for {valid_evidence.district} records {coverage_pct:.2f}% {valid_evidence.metric_name}, establishing an observed infrastructure gap of {deficit_pct:.2f} percentage points.",
    )


def extract_vulnerability_evidence_factor() -> PriorityFactorDetail:
    """
    Evaluates verified socioeconomic/deprivation indicators if officially published.
    Currently returns honest unavailable state since current ministerial datasets cover sectoral infrastructure baselines.
    """
    return PriorityFactorDetail(
        factor="Vulnerability Evidence",
        raw_value=None,
        normalized_value=None,
        weight=10.0,
        available=False,
        contribution=None,
        source="Not in active ministerial dataset catalog",
        evidence_ids=[],
        explanation="No verified vulnerability indicator was available for this assessment.",
    )


def extract_geographic_evidence_coverage_factor(
    request: CitizenRequest,
    evidence_items: List[KnowledgeEvidence],
) -> PriorityFactorDetail:
    """
    Evaluates administrative grounding depth between citizen location and verified public records.
    Levels:
    3 = State + District + Category match -> 100.0
    2 = District + Category match -> 66.6
    1 = Category match only -> 33.3
    0 = No verified evidence -> 0.0
    """
    if not evidence_items:
        return PriorityFactorDetail(
            factor="Geographic Evidence Coverage",
            raw_value=0.0,
            normalized_value=0.0,
            weight=10.0,
            available=True,
            contribution=None,
            source="Knowledge Retrieval Layer",
            evidence_ids=[],
            explanation="No public evidence records match the requested geographic location.",
        )

    req_state = (getattr(request, "state", "") or "").strip().lower()
    req_dist = (getattr(request, "district", "") or "").strip().lower()
    req_cat = (getattr(request, "category", "") or "").strip().lower()

    best_level = 0
    best_ev_id = evidence_items[0].evidence_id

    for ev in evidence_items:
        ev_state = (ev.state or "").strip().lower()
        ev_dist = (ev.district or "").strip().lower()
        ev_cat = (ev.category or "").strip().lower()

        state_match = bool(req_state and ev_state and req_state in ev_state)
        dist_match = bool(req_dist and ev_dist and req_dist in ev_dist)
        cat_match = bool(req_cat and ev_cat and req_cat == ev_cat)

        if state_match and dist_match and cat_match:
            level = 3
        elif dist_match and cat_match:
            level = 2
        elif cat_match or dist_match:
            level = 1
        else:
            level = 0

        if level > best_level:
            best_level = level
            best_ev_id = ev.evidence_id

    score_map = {3: 100.0, 2: 66.67, 1: 33.33, 0: 0.0}
    norm_val = score_map[best_level]

    return PriorityFactorDetail(
        factor="Geographic Evidence Coverage",
        raw_value=float(best_level),
        normalized_value=round(norm_val, 2),
        weight=10.0,
        available=True,
        contribution=None,
        source=f"Administrative Match Level {best_level}/3",
        evidence_ids=[best_ev_id],
        explanation=f"Public evidence matches citizen request at geographic level {best_level}/3 (State/District/Category concordance: {norm_val:.1f}%).",
    )
