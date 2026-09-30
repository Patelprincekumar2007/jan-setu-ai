import re
import datetime
from typing import List, Dict, Any
from backend.hotspots.schemas import HotspotDetailResponse, HotspotFactorMetrics
from backend.hotspots.aggregator import METHODOLOGY_VERSION

def generate_hotspot_id(state: str, district: str, locality: str | None, category: str) -> str:
    parts = ["HS", state, district]
    if locality:
        parts.append(locality)
    parts.append(category)
    slug = "-".join(parts)
    clean_slug = re.sub(r"[^A-Za-z0-9]+", "-", slug).strip("-").upper()
    return clean_slug

def detect_hotspots_from_aggregates(aggregates: List[Dict[str, Any]]) -> List[HotspotDetailResponse]:
    """
    Transforms aggregated demand clusters into deterministic Hotspot assessments.
    Requires at least 1 actual stored citizen request. Zero fabricated clusters.
    """
    hotspots: List[HotspotDetailResponse] = []
    now = datetime.datetime.now(datetime.timezone.utc)

    for agg in aggregates:
        hs_id = generate_hotspot_id(
            state=agg["state"],
            district=agg["district"],
            locality=agg["locality"],
            category=agg["category"],
        )

        factors = HotspotFactorMetrics(
            request_count=agg["request_count"],
            affected_households=agg["affected_households"],
            high_severity_request_count=agg["high_severity_request_count"],
            evidence_coverage=agg["evidence_coverage"],
            category_concentration=agg["category_concentration"],
        )

        limitations = [
            "Hotspot cluster is formed purely from stored citizen submissions and does not represent an exhaustive public census.",
            "Affected household counts reflect unverified citizen-reported estimations.",
        ]
        if agg["evidence_count"] == 0:
            limitations.append("No verified public evidence is currently linked to requests in this hotspot cluster.")
        if agg["locality"] is None:
            limitations.append("Locality was not specified for one or more requests in this group; aggregated at district level.")

        hotspots.append(
            HotspotDetailResponse(
                hotspot_id=hs_id,
                state=agg["state"],
                district=agg["district"],
                locality=agg["locality"],
                category=agg["category"],
                request_count=agg["request_count"],
                affected_households=agg["affected_households"],
                evidence_count=agg["evidence_count"],
                severity_distribution=agg["severity_distribution"],
                methodology_version=METHODOLOGY_VERSION,
                factors=factors,
                limitations=limitations,
                created_at=now,
            )
        )

    return hotspots
