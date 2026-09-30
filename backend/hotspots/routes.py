from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.hotspots.schemas import (
    HotspotListResponse,
    HotspotDetailResponse,
    AnalyticsOverviewResponse,
)
from backend.hotspots.service import HotspotService

router = APIRouter(tags=["Demand Hotspots & Overview"])

@router.get("/api/hotspots", response_model=HotspotListResponse)
def get_hotspots(
    state: Optional[str] = Query(None, description="Filter by state name"),
    district: Optional[str] = Query(None, description="Filter by district name"),
    locality: Optional[str] = Query(None, description="Filter by locality/ward"),
    category: Optional[str] = Query(None, description="Filter by category (e.g. Water, Healthcare, Roads, Sanitation)"),
    db: Session = Depends(get_db),
):
    """
    Returns deterministic demand clusters aggregated from verified stored citizen requests.
    Zero fabricated geographic clusters or ML approximations.
    """
    return HotspotService.list_hotspots(
        db=db,
        state=state,
        district=district,
        locality=locality,
        category=category,
    )

@router.get("/api/hotspots/{hotspot_id}", response_model=HotspotDetailResponse)
def get_hotspot_by_id(
    hotspot_id: str,
    db: Session = Depends(get_db),
):
    """
    Returns specific demand hotspot assessment by unique identifier.
    """
    hotspot = HotspotService.get_hotspot_by_id(db=db, hotspot_id=hotspot_id)
    if not hotspot:
        raise HTTPException(status_code=404, detail=f"Hotspot with ID '{hotspot_id}' not found.")
    return hotspot

@router.get("/api/analytics/overview", response_model=AnalyticsOverviewResponse)
def get_analytics_overview(
    db: Session = Depends(get_db),
):
    """
    Returns verifiable aggregate counts across all stored citizen requests, evidence matches, datasets, and priority assessments.
    """
    return HotspotService.get_analytics_overview(db=db)
