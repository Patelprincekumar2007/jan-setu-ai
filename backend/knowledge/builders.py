from typing import Optional, Any
from backend.public_data.models import PublicDataRecord, Dataset
from backend.knowledge.schemas import KnowledgeEvidenceCreate

def build_evidence_content(
    state: str,
    district: str,
    locality: Optional[str],
    metric_name: str,
    metric_value: Optional[float],
    unit: Optional[str],
    dataset_title: str,
    year: Optional[int] = None,
    notes: Optional[str] = None,
) -> str:
    """
    Builds deterministic factual content for KnowledgeEvidence.
    """
    loc_part = f", Locality {locality}" if locality else ""
    val_str = f"{metric_value}{unit}" if metric_value is not None else "data unavailable"
    yr_str = f" in {year}" if year else ""
    notes_str = f" Notes: {notes}." if notes else ""

    return (
        f"District {district} ({state}{loc_part}) records {metric_name} of {val_str}{yr_str} "
        f"according to {dataset_title}.{notes_str}"
    )

def build_knowledge_evidence_from_public_record(
    record: PublicDataRecord, dataset: Any
) -> KnowledgeEvidenceCreate:
    """
    Transforms a normalized PublicDataRecord into a KnowledgeEvidenceCreate item.
    """
    if isinstance(dataset, dict):
        dataset_id = dataset.get("dataset_id")
        title = dataset.get("title")
        source_name = dataset.get("source_name")
        source_url = dataset.get("source_url")
        publisher = dataset.get("publisher")
        license_str = dataset.get("license")
        last_updated = dataset.get("last_updated")
    else:
        dataset_id = dataset.dataset_id
        title = dataset.title
        source_name = dataset.source_name
        source_url = dataset.source_url
        publisher = dataset.publisher
        license_str = dataset.license
        last_updated = dataset.last_updated

    evidence_id = f"EVID-{record.dataset_id}-{record.source_reference}"
    title_str = f"{record.district} ({record.state}) - {record.metric_name}"
    content = build_evidence_content(
        state=record.state,
        district=record.district,
        locality=record.locality,
        metric_name=record.metric_name,
        metric_value=record.metric_value,
        unit=record.unit,
        dataset_title=title,
        year=record.year,
        notes=record.notes,
    )

    return KnowledgeEvidenceCreate(
        evidence_id=evidence_id,
        dataset_id=dataset_id,
        record_id=record.record_id,
        title=title_str,
        content=content,
        state=record.state,
        district=record.district,
        locality=record.locality,
        category=record.category,  # type: ignore
        metric_name=record.metric_name,
        metric_value=record.metric_value,
        unit=record.unit,
        year=record.year,
        period=record.period,
        geographic_level=record.geographic_level,
        source_name=source_name,
        source_url=source_url,
        source_reference=record.source_reference,
        publisher=publisher,
        license=license_str,
        last_updated=last_updated,
        notes=record.notes,
    )
