from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.analytics.schemas import (
    CategoryAnalyticsResponse,
    GeographicAnalyticsResponse,
    TimelineAnalyticsResponse,
    EvidenceCoverageAnalyticsResponse,
    SeverityAnalyticsResponse,
)
from backend.analytics.service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Request Analytics"])

@router.get("/categories", response_model=CategoryAnalyticsResponse)
def get_categories_analytics(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db),
):
    try:
        return AnalyticsService.get_category_analytics(
            db=db,
            start_date=start_date,
            end_date=end_date,
            state=state,
            district=district,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/geography", response_model=GeographicAnalyticsResponse)
def get_geography_analytics(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    try:
        return AnalyticsService.get_geography_analytics(
            db=db,
            start_date=start_date,
            end_date=end_date,
            category=category,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/timeline", response_model=TimelineAnalyticsResponse)
def get_timeline_analytics(
    start_date: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format"),
    category: Optional[str] = Query(None, description="Filter by category"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db),
):
    try:
        return AnalyticsService.get_timeline_analytics(
            db=db,
            start_date=start_date,
            end_date=end_date,
            category=category,
            district=district,
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

@router.get("/evidence-coverage", response_model=EvidenceCoverageAnalyticsResponse)
def get_evidence_coverage_analytics(
    category: Optional[str] = Query(None, description="Filter by category"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db),
):
    return AnalyticsService.get_evidence_coverage_analytics(
        db=db,
        category=category,
        district=district,
    )

@router.get("/severity", response_model=SeverityAnalyticsResponse)
def get_severity_analytics(
    category: Optional[str] = Query(None, description="Filter by category"),
    district: Optional[str] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db),
):
    return AnalyticsService.get_severity_analytics(
        db=db,
        category=category,
        district=district,
    )
