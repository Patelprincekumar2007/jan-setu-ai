import logging
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.models import CitizenRequest, RequestEvidenceMatch
from backend.knowledge.models import KnowledgeEvidence
from backend.public_data.models import Dataset
from backend.prioritization.models import RequestPriorityAssessment
from backend.hotspots.schemas import (
    HotspotDetailResponse,
    HotspotListResponse,
    AnalyticsOverviewResponse,
)
from backend.hotspots.aggregator import aggregate_citizen_demand, METHODOLOGY_VERSION
from backend.hotspots.detector import detect_hotspots_from_aggregates

logger = logging.getLogger("nagriklens.hotspots.service")

class HotspotService:
    @staticmethod
    def list_hotspots(
        db: Session,
        state: Optional[str] = None,
        district: Optional[str] = None,
        locality: Optional[str] = None,
        category: Optional[str] = None,
    ) -> HotspotListResponse:
        """
        Computes deterministic demand hotspots directly from database.
        """
        aggregates = aggregate_citizen_demand(
            db=db,
            state_filter=state,
            district_filter=district,
            locality_filter=locality,
            category_filter=category,
        )
        hotspot_list = detect_hotspots_from_aggregates(aggregates)

        return HotspotListResponse(
            total_hotspots=len(hotspot_list),
            methodology_version=METHODOLOGY_VERSION,
            hotspots=hotspot_list,
        )

    @staticmethod
    def get_hotspot_by_id(db: Session, hotspot_id: str) -> Optional[HotspotDetailResponse]:
        """
        Retrieves a specific hotspot by its unique deterministic ID.
        """
        aggregates = aggregate_citizen_demand(db=db)
        hotspot_list = detect_hotspots_from_aggregates(aggregates)
        for hs in hotspot_list:
            if hs.hotspot_id == hotspot_id.upper():
                return hs
        return None

    @staticmethod
    def get_analytics_overview(db: Session) -> AnalyticsOverviewResponse:
        """
        Aggregates real high-level statistics across all stored records.
        Never fabricates metrics or substitutes missing data with synthetic estimates.
        """
        total_requests = db.query(CitizenRequest).count()

        # Requests with evidence: count requests present in RequestEvidenceMatch or with evidence_count > 0
        req_ids_with_evidence = set(
            row[0] for row in db.query(RequestEvidenceMatch.request_id).distinct().all()
        )
        requests_with_evidence = len(req_ids_with_evidence)
        requests_without_evidence = max(0, total_requests - requests_with_evidence)

        priority_assessments_count = db.query(RequestPriorityAssessment).count()

        # Hotspot groups
        aggregates = aggregate_citizen_demand(db=db)
        hotspots = detect_hotspots_from_aggregates(aggregates)
        hotspot_groups_count = len(hotspots)

        # Datasets & Evidence
        verified_datasets_count = db.query(Dataset).count()
        evidence_records_count = db.query(KnowledgeEvidence).count()

        return AnalyticsOverviewResponse(
            total_requests=total_requests,
            requests_with_evidence=requests_with_evidence,
            requests_without_evidence=requests_without_evidence,
            priority_assessments_generated=priority_assessments_count,
            hotspot_groups=hotspot_groups_count,
            verified_datasets=verified_datasets_count,
            evidence_records=evidence_records_count,
        )
