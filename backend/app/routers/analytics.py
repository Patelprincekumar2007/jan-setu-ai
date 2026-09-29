from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.report import Report
from app.models.dataset import Dataset
from app.models.evidence import Evidence
from app.models.analysis import Analysis

router = APIRouter(prefix="/analytics", tags=["Analytics & Telemetry"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_reports = db.query(Report).count()
    analyzed_reports = db.query(Report).filter(Report.status == "analyzed").count()
    active_reports = db.query(Report).filter(Report.status.in_(["submitted", "structuring", "analyzed", "in_review"])).count()
    resolved_reports = db.query(Report).filter(Report.status == "resolved").count()

    evidence_backed = db.query(Analysis).filter(Analysis.evidence_coverage.in_(["STRONG", "PARTIAL"])).count()
    insufficient_evidence = db.query(Analysis).filter(Analysis.evidence_coverage == "INSUFFICIENT").count()

    total_datasets = db.query(Dataset).count()
    total_evidences = db.query(Evidence).count()

    return {
        "total_reports": total_reports,
        "active_reports": active_reports,
        "analyzed_reports": analyzed_reports,
        "resolved_reports": resolved_reports,
        "evidence_backed_reports": evidence_backed,
        "insufficient_evidence_reports": insufficient_evidence,
        "total_datasets": total_datasets,
        "total_evidences": total_evidences
    }

@router.get("/categories")
def get_category_breakdown(db: Session = Depends(get_db)):
    results = db.query(Report.category, func.count(Report.id)).group_by(Report.category).all()
    return [{"category": cat, "count": count} for cat, count in results]

@router.get("/geography")
def get_geographic_breakdown(db: Session = Depends(get_db)):
    results = db.query(Report.state, Report.district, func.count(Report.id)).group_by(Report.state, Report.district).all()
    return [{"state": state, "district": district, "count": count} for state, district, count in results]

@router.get("/severity")
def get_severity_breakdown(db: Session = Depends(get_db)):
    results = db.query(Report.severity, func.count(Report.id)).group_by(Report.severity).all()
    return [{"severity": sev, "count": count} for sev, count in results]

@router.get("/evidence")
def get_evidence_stats(db: Session = Depends(get_db)):
    results = db.query(Analysis.evidence_coverage, func.count(Analysis.id)).group_by(Analysis.evidence_coverage).all()
    return [{"coverage": cov, "count": count} for cov, count in results]
