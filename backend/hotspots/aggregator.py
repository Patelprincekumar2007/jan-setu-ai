from typing import List, Dict, Any, Optional
from collections import defaultdict
from sqlalchemy.orm import Session
from backend.models import CitizenRequest, RequestEvidenceMatch

METHODOLOGY_VERSION = "hotspot-v1"

def aggregate_citizen_demand(
    db: Session,
    state_filter: Optional[str] = None,
    district_filter: Optional[str] = None,
    locality_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Deterministically aggregates actual stored citizen requests from SQLite database.
    Does NOT fabricate records or assume zero where data is missing.
    """
    query = db.query(CitizenRequest)

    if state_filter:
        query = query.filter(CitizenRequest.state.ilike(f"%{state_filter}%"))
    if district_filter:
        query = query.filter(CitizenRequest.district.ilike(f"%{district_filter}%"))
    if locality_filter:
        query = query.filter(CitizenRequest.locality.ilike(f"%{locality_filter}%"))
    if category_filter:
        query = query.filter(CitizenRequest.category.ilike(f"%{category_filter}%"))

    requests = query.all()
    if not requests:
        return []

    # Map request ID to evidence count
    req_ids = [r.id for r in requests]
    evidence_matches = (
        db.query(RequestEvidenceMatch.request_id, RequestEvidenceMatch.evidence_id)
        .filter(RequestEvidenceMatch.request_id.in_(req_ids))
        .all()
    )
    req_to_ev_count = defaultdict(set)
    for r_id, ev_id in evidence_matches:
        req_to_ev_count[r_id].add(ev_id)

    # Group requests by (state, district, locality, category)
    clusters = defaultdict(list)
    geo_total_requests = defaultdict(int)

    for req in requests:
        st = req.state.strip() if req.state else "Unknown"
        dist = req.district.strip() if req.district else "Unknown"
        loc = req.locality.strip() if req.locality else None
        cat = req.category.strip() if req.category else "Uncategorized"

        key = (st, dist, loc, cat)
        clusters[key].append(req)
        geo_total_requests[(st, dist, loc)] += 1

    aggregated_results: List[Dict[str, Any]] = []

    for (st, dist, loc, cat), req_list in clusters.items():
        req_count = len(req_list)
        
        # Affected households: sum only if provided
        provided_households = [r.affected_household_count for r in req_list if r.affected_household_count is not None and r.affected_household_count >= 0]
        total_households = sum(provided_households) if provided_households else None

        # Severity breakdown
        severity_dist = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0, "UNSPECIFIED": 0}
        high_severity_count = 0
        for r in req_list:
            s = (r.severity or "").upper()
            if s in severity_dist:
                severity_dist[s] += 1
            else:
                severity_dist["UNSPECIFIED"] += 1
            if s in ("HIGH", "CRITICAL"):
                high_severity_count += 1

        # Evidence count & coverage
        all_linked_ev_ids = set()
        reqs_with_evidence = 0
        for r in req_list:
            ev_set = req_to_ev_count.get(r.id, set())
            if ev_set:
                reqs_with_evidence += 1
                all_linked_ev_ids.update(ev_set)

        evidence_coverage_pct = round((reqs_with_evidence / req_count) * 100.0, 2) if req_count > 0 else 0.0

        # Category concentration
        total_in_geo = geo_total_requests[(st, dist, loc)]
        cat_concentration_pct = round((req_count / total_in_geo) * 100.0, 2) if total_in_geo > 0 else 100.0

        aggregated_results.append({
            "state": st,
            "district": dist,
            "locality": loc,
            "category": cat,
            "request_count": req_count,
            "affected_households": total_households,
            "evidence_count": len(all_linked_ev_ids),
            "severity_distribution": severity_dist,
            "high_severity_request_count": high_severity_count,
            "evidence_coverage": evidence_coverage_pct,
            "category_concentration": cat_concentration_pct,
        })

    # Deterministic sort by request_count descending, then state, district, category
    aggregated_results.sort(key=lambda x: (-x["request_count"], x["state"], x["district"], x["category"]))
    return aggregated_results
