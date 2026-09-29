from typing import List, Any
from backend.models import CitizenRequest
from backend.knowledge.models import KnowledgeEvidence


def build_rag_context(request: CitizenRequest, evidence_items: List[KnowledgeEvidence]) -> str:
    """
    Builds a formatted text context for Gemini containing the citizen request
    and all retrieved factual KnowledgeEvidence items.
    """
    lines = []
    lines.append("=== CITIZEN REQUEST CONTEXT ===")
    lines.append(f"Reference ID: {request.reference_id}")
    lines.append(f"Location: {request.locality}, {request.district}, {request.state}")
    lines.append(f"Category: {request.category}")
    if request.affected_household_count is not None:
        lines.append(f"Affected Households: {request.affected_household_count}")
    if request.problem_summary:
        lines.append(f"Extracted Problem Summary: {request.problem_summary}")
    if request.severity:
        lines.append(f"Severity Assessment: {request.severity}")
    if request.affected_group:
        lines.append(f"Affected Group: {request.affected_group}")
    lines.append("")

    lines.append("=== RETRIEVED PUBLIC DATA EVIDENCE ===")
    if not evidence_items:
        lines.append("[NO EVIDENCE AVAILABLE]")
    else:
        for idx, ev in enumerate(evidence_items, start=1):
            val_str = f"{ev.metric_value}{ev.unit or ''}" if ev.metric_value is not None else "N/A"
            loc_str = f"{ev.district}, {ev.state}" + (f" ({ev.locality})" if ev.locality else "")
            lines.append(f"[EVIDENCE: {ev.evidence_id}]")
            lines.append(f"Title: {ev.title}")
            lines.append(f"Location: {loc_str}")
            lines.append(f"Category: {ev.category}")
            lines.append(f"Metric: {ev.metric_name}")
            lines.append(f"Value: {val_str}")
            lines.append(f"Year: {ev.year or 'N/A'}")
            lines.append(f"Source: {ev.source_name}")
            lines.append(f"Reference: {ev.source_reference}")
            lines.append(f"Factual Content: {ev.content}")
            lines.append("")

    return "\n".join(lines)
