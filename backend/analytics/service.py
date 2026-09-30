import datetime
from typing import Optional, List, Dict, Any
from collections import defaultdict
from sqlalchemy.orm import Session
from backend.models import CitizenRequest, RequestEvidenceMatch
from backend.analytics.schemas import (
    CategoryAnalyticsResponse,
    CategoryDemandMetric,
    GeographicAnalyticsResponse,
    GeographicDemandMetric,
    TimelineAnalyticsResponse,
    TimelinePoint,
    EvidenceCoverageAnalyticsResponse,
    SeverityAnalyticsResponse,
)

class AnalyticsService:
    @staticmethod
    def _apply_filters(
        query,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        locality: Optional[str] = None,
    ):
        if start_date:
            try:
                s_dt = datetime.datetime.strptime(start_date, "%Y-%m-%d")
                query = query.filter(CitizenRequest.created_at >= s_dt)
            except ValueError:
                raise ValueError("Invalid start_date format. Expected YYYY-MM-DD.")

        if end_date:
            try:
                e_dt = datetime.datetime.strptime(end_date, "%Y-%m-%d") + datetime.timedelta(days=1)
                query = query.filter(CitizenRequest.created_at < e_dt)
            except ValueError:
                raise ValueError("Invalid end_date format. Expected YYYY-MM-DD.")

        if start_date and end_date:
            if start_date > end_date:
                raise ValueError("start_date cannot be after end_date.")

        if category:
            query = query.filter(CitizenRequest.category.ilike(f"%{category}%"))
        if state:
            query = query.filter(CitizenRequest.state.ilike(f"%{state}%"))
        if district:
            query = query.filter(CitizenRequest.district.ilike(f"%{district}%"))
        if locality:
            query = query.filter(CitizenRequest.locality.ilike(f"%{locality}%"))

        return query

    @staticmethod
    def get_category_analytics(
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
    ) -> CategoryAnalyticsResponse:
        query = db.query(CitizenRequest)
        query = AnalyticsService._apply_filters(query, start_date=start_date, end_date=end_date, state=state, district=district)
        requests = query.all()

        total = len(requests)
        if total == 0:
            return CategoryAnalyticsResponse(total_requests=0, categories=[])

        cat_counts = defaultdict(int)
        cat_households = defaultdict(list)

        for r in requests:
            c = r.category or "Other"
            cat_counts[c] += 1
            if r.affected_household_count is not None and r.affected_household_count >= 0:
                cat_households[c].append(r.affected_household_count)

        cat_metrics: List[CategoryDemandMetric] = []
        for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
            hh_list = cat_households.get(cat, [])
            total_hh = sum(hh_list) if hh_list else None
            pct = round((cnt / total) * 100.0, 2)
            cat_metrics.append(
                CategoryDemandMetric(
                    category=cat,
                    request_count=cnt,
                    affected_households=total_hh,
                    percentage=pct,
                )
            )

        return CategoryAnalyticsResponse(total_requests=total, categories=cat_metrics)

    @staticmethod
    def get_geography_analytics(
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
    ) -> GeographicAnalyticsResponse:
        query = db.query(CitizenRequest)
        query = AnalyticsService._apply_filters(query, start_date=start_date, end_date=end_date, category=category)
        requests = query.all()

        total = len(requests)
        if total == 0:
            return GeographicAnalyticsResponse(total_locations=0, total_requests=0, locations=[])

        geo_map = defaultdict(lambda: {"count": 0, "households": []})

        for r in requests:
            st = r.state or "Unknown"
            dist = r.district or "Unknown"
            loc = r.locality
            key = (st, dist, loc)
            geo_map[key]["count"] += 1
            if r.affected_household_count is not None and r.affected_household_count >= 0:
                geo_map[key]["households"].append(r.affected_household_count)

        locations: List[GeographicDemandMetric] = []
        for (st, dist, loc), data in sorted(geo_map.items(), key=lambda x: -x[1]["count"]):
            hh_list = data["households"]
            total_hh = sum(hh_list) if hh_list else None
            locations.append(
                GeographicDemandMetric(
                    state=st,
                    district=dist,
                    locality=loc,
                    request_count=data["count"],
                    affected_households=total_hh,
                )
            )

        return GeographicAnalyticsResponse(
            total_locations=len(locations),
            total_requests=total,
            locations=locations,
        )

    @staticmethod
    def get_timeline_analytics(
        db: Session,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        category: Optional[str] = None,
        district: Optional[str] = None,
    ) -> TimelineAnalyticsResponse:
        query = db.query(CitizenRequest)
        query = AnalyticsService._apply_filters(query, start_date=start_date, end_date=end_date, category=category, district=district)
        requests = query.all()

        date_counts = defaultdict(int)
        for r in requests:
            if r.created_at:
                d_str = r.created_at.strftime("%Y-%m-%d")
                date_counts[d_str] += 1

        timeline_points = [
            TimelinePoint(date=d, request_count=c)
            for d, c in sorted(date_counts.items())
        ]

        return TimelineAnalyticsResponse(
            total_days=len(timeline_points),
            timeline=timeline_points,
        )

    @staticmethod
    def get_evidence_coverage_analytics(
        db: Session,
        category: Optional[str] = None,
        district: Optional[str] = None,
    ) -> EvidenceCoverageAnalyticsResponse:
        query = db.query(CitizenRequest)
        if category:
            query = query.filter(CitizenRequest.category.ilike(f"%{category}%"))
        if district:
            query = query.filter(CitizenRequest.district.ilike(f"%{district}%"))
        requests = query.all()

        total = len(requests)
        if total == 0:
            return EvidenceCoverageAnalyticsResponse(
                total_requests=0,
                requests_with_evidence=0,
                requests_without_evidence=0,
                coverage_percentage=None,
            )

        req_ids = [r.id for r in requests]
        matched_req_ids = set(
            row[0]
            for row in db.query(RequestEvidenceMatch.request_id)
            .filter(RequestEvidenceMatch.request_id.in_(req_ids))
            .distinct()
            .all()
        )

        with_ev = len(matched_req_ids)
        without_ev = total - with_ev
        pct = round((with_ev / total) * 100.0, 2)

        return EvidenceCoverageAnalyticsResponse(
            total_requests=total,
            requests_with_evidence=with_ev,
            requests_without_evidence=without_ev,
            coverage_percentage=pct,
        )

    @staticmethod
    def get_severity_analytics(
        db: Session,
        category: Optional[str] = None,
        district: Optional[str] = None,
    ) -> SeverityAnalyticsResponse:
        query = db.query(CitizenRequest)
        if category:
            query = query.filter(CitizenRequest.category.ilike(f"%{category}%"))
        if district:
            query = query.filter(CitizenRequest.district.ilike(f"%{district}%"))
        requests = query.all()

        total = len(requests)
        counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0, "UNSPECIFIED": 0}

        for r in requests:
            s = (r.severity or "").upper()
            if s in counts:
                counts[s] += 1
            else:
                counts["UNSPECIFIED"] += 1

        return SeverityAnalyticsResponse(
            total_requests=total,
            counts=counts,
        )
