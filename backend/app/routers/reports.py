import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.report import Report, ReportLocation
from app.models.analysis import Analysis
from app.models.priority import PrioritySignal
from app.schemas.report import ReportCreate, ReportUpdate, ReportOut
from app.dependencies import get_current_active_user
from app.services.gemini_service import gemini_service
from app.services.retrieval_service import retrieval_service
from app.services.priority_service import priority_service

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    report_id = f"REP-{datetime.datetime.utcnow().strftime('%Y')}-{uuid.uuid4().hex[:6].upper()}"
    
    # Run Gemini structuring on original narrative
    structured_data = gemini_service.understand_complaint(
        original_narrative=report_in.original_narrative,
        category=report_in.category,
        state=report_in.state,
        district=report_in.district,
        locality=report_in.locality
    )

    report = Report(
        id=report_id,
        user_id=current_user.id,
        title=report_in.title,
        original_narrative=report_in.original_narrative,
        ai_structured_report=structured_data,
        language=report_in.language or "en",
        category=report_in.category,
        subcategory=report_in.subcategory,
        state=report_in.state,
        district=report_in.district,
        locality=report_in.locality,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        severity=report_in.severity or structured_data.get("severity", "medium"),
        status="submitted"
    )
    db.add(report)
    
    # Save ReportLocation entity
    loc = ReportLocation(
        id=f"loc-{uuid.uuid4().hex[:8]}",
        report_id=report_id,
        state=report_in.state,
        district=report_in.district,
        locality=report_in.locality,
        latitude=report_in.latitude,
        longitude=report_in.longitude
    )
    db.add(loc)
    db.commit()
    db.refresh(report)

    # Trigger automatic grounded analysis pipeline
    run_report_analysis_pipeline(report.id, db)
    db.refresh(report)

    return report

@router.get("", response_model=List[ReportOut])
def list_reports(
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if state:
        query = query.filter(Report.state.ilike(f"%{state}%"))
    if district:
        query = query.filter(Report.district.ilike(f"%{district}%"))
    if category:
        query = query.filter(Report.category.ilike(f"%{category}%"))
    if severity:
        query = query.filter(Report.severity == severity)
    if status_filter:
        query = query.filter(Report.status == status_filter)

    return query.order_by(Report.created_at.desc()).all()

@router.get("/me", response_model=List[ReportOut])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()

@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.patch("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: str,
    update_in: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if current_user.role != "admin" and report.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this report")

    for field, value in update_in.dict(exclude_unset=True).items():
        setattr(report, field, value)

    report.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(report)
    return report

@router.post("/{report_id}/analyze")
def trigger_analysis(report_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    result = run_report_analysis_pipeline(report_id, db)
    return result

def run_report_analysis_pipeline(report_id: str, db: Session) -> dict:
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        return {"error": "Report not found"}

    # 1. Structure report if missing
    if not report.ai_structured_report:
        report.ai_structured_report = gemini_service.understand_complaint(
            original_narrative=report.original_narrative,
            category=report.category,
            state=report.state,
            district=report.district,
            locality=report.locality
        )

    # 2. Hybrid Evidence Search (FAISS + Metadata)
    search_query = f"{report.title} {report.original_narrative}"
    evidence_data = retrieval_service.search_evidence(
        db=db,
        query=search_query,
        state=report.state,
        district=report.district,
        category=report.category,
        top_k=5
    )

    retrieved_evidences = evidence_data["results"]
    coverage = evidence_data["evidence_coverage"]

    # 3. Gemini RAG Grounded Analysis
    rag_result = gemini_service.generate_grounded_analysis(
        report_narrative=report.original_narrative,
        structured_report=report.ai_structured_report,
        retrieved_evidence=retrieved_evidences
    )

    # Save or update Analysis record
    analysis = db.query(Analysis).filter(Analysis.report_id == report_id).first()
    if not analysis:
        analysis = Analysis(
            id=f"ans-{uuid.uuid4().hex[:8]}",
            report_id=report_id,
            summary=rag_result.get("summary", ""),
            observations=rag_result.get("observations", []),
            evidence_used=rag_result.get("evidence_used", []),
            limitations=rag_result.get("limitations", []),
            evidence_coverage=coverage,
            grounding_status="GROUNDED" if coverage in ("STRONG", "PARTIAL") else "INSUFFICIENT_EVIDENCE"
        )
        db.add(analysis)
    else:
        analysis.summary = rag_result.get("summary", "")
        analysis.observations = rag_result.get("observations", [])
        analysis.evidence_used = rag_result.get("evidence_used", [])
        analysis.limitations = rag_result.get("limitations", [])
        analysis.evidence_coverage = coverage

    # 4. Priority Engine Calculation
    priority_res = priority_service.calculate_priority(
        severity=report.severity,
        evidence_coverage=coverage,
        retrieved_evidences=retrieved_evidences
    )

    # Save or update PrioritySignal record
    priority = db.query(PrioritySignal).filter(PrioritySignal.report_id == report_id).first()
    if not priority:
        priority = PrioritySignal(
            id=f"pri-{uuid.uuid4().hex[:8]}",
            report_id=report_id,
            score=priority_res["score"],
            status=priority_res["status"],
            factors=priority_res["factors"],
            explanation=priority_res["explanation"]
        )
        db.add(priority)
    else:
        priority.score = priority_res["score"]
        priority.status = priority_res["status"]
        priority.factors = priority_res["factors"]
        priority.explanation = priority_res["explanation"]

    report.status = "analyzed"
    db.commit()

    return {
        "report_id": report_id,
        "evidence_coverage": coverage,
        "analysis": rag_result,
        "priority_signal": priority_res
    }
