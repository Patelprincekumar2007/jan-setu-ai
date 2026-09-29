from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.knowledge.models import KnowledgeEvidence
from backend.knowledge.schemas import KnowledgeEvidenceCreate

def create_knowledge_evidence(db: Session, evidence_in: KnowledgeEvidenceCreate) -> KnowledgeEvidence:
    """Create and persist a single KnowledgeEvidence record."""
    db_obj = KnowledgeEvidence(
        evidence_id=evidence_in.evidence_id,
        dataset_id=evidence_in.dataset_id,
        record_id=evidence_in.record_id,
        title=evidence_in.title,
        content=evidence_in.content,
        state=evidence_in.state,
        district=evidence_in.district,
        locality=evidence_in.locality,
        category=evidence_in.category,
        metric_name=evidence_in.metric_name,
        metric_value=evidence_in.metric_value,
        unit=evidence_in.unit,
        year=evidence_in.year,
        period=evidence_in.period,
        geographic_level=evidence_in.geographic_level,
        source_name=evidence_in.source_name,
        source_url=evidence_in.source_url,
        source_reference=evidence_in.source_reference,
        publisher=evidence_in.publisher,
        license=evidence_in.license,
        last_updated=evidence_in.last_updated,
        notes=evidence_in.notes,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def bulk_save_knowledge_evidence(db: Session, items_in: List[KnowledgeEvidenceCreate]) -> int:
    """Bulk upsert knowledge evidence records for a dataset."""
    if not items_in:
        return 0

    dataset_id = items_in[0].dataset_id
    db.query(KnowledgeEvidence).filter(KnowledgeEvidence.dataset_id == dataset_id).delete()

    db_items = [
        KnowledgeEvidence(
            evidence_id=item.evidence_id,
            dataset_id=item.dataset_id,
            record_id=item.record_id,
            title=item.title,
            content=item.content,
            state=item.state,
            district=item.district,
            locality=item.locality,
            category=item.category,
            metric_name=item.metric_name,
            metric_value=item.metric_value,
            unit=item.unit,
            year=item.year,
            period=item.period,
            geographic_level=item.geographic_level,
            source_name=item.source_name,
            source_url=item.source_url,
            source_reference=item.source_reference,
            publisher=item.publisher,
            license=item.license,
            last_updated=item.last_updated,
            notes=item.notes,
        )
        for item in items_in
    ]
    db.bulk_save_objects(db_items)
    db.commit()
    return len(db_items)

def get_knowledge_evidence_by_id(db: Session, evidence_id: str) -> Optional[KnowledgeEvidence]:
    """Retrieve KnowledgeEvidence by evidence_id."""
    return db.query(KnowledgeEvidence).filter(KnowledgeEvidence.evidence_id == evidence_id).first()

def query_knowledge_evidence_deterministic(
    db: Session,
    query_text: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    top_k: int = 5,
) -> Tuple[List[KnowledgeEvidence], int]:
    """
    Deterministic baseline metadata query.
    Applies exact/prefix filtering and ordered deterministic sorting.
    """
    q = db.query(KnowledgeEvidence)

    has_filter = False
    if state and state.strip():
        q = q.filter(KnowledgeEvidence.state.ilike(f"%{state.strip()}%"))
        has_filter = True
    if district and district.strip():
        q = q.filter(KnowledgeEvidence.district.ilike(f"%{district.strip()}%"))
        has_filter = True
    if category and category.strip():
        q = q.filter(KnowledgeEvidence.category == category.strip())
        has_filter = True

    if not has_filter and query_text and query_text.strip():
        q = q.filter(KnowledgeEvidence.content.ilike(f"%{query_text.strip()}%"))

    total = q.count()
    items = q.order_by(
        KnowledgeEvidence.state.asc(),
        KnowledgeEvidence.district.asc(),
        KnowledgeEvidence.evidence_id.asc(),
    ).limit(top_k).all()

    return items, total
