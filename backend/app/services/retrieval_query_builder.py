from collections.abc import Mapping
from typing import Any, Optional


def build_retrieval_query(
    extraction: Optional[Mapping[str, Any]] = None,
    *,
    original_request: str,
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    locality: Optional[str] = None,
) -> str:
    extracted = extraction or {}
    candidates = [
        extracted.get("problem_summary") or original_request,
        extracted.get("category") or category,
        extracted.get("state") or state,
        extracted.get("district") or district,
        extracted.get("locality") or locality,
        extracted.get("affected_group"),
        extracted.get("severity"),
        extracted.get("location_hint"),
    ]

    parts = []
    seen = set()
    for candidate in candidates:
        if not isinstance(candidate, str):
            continue
        value = " ".join(candidate.split())
        normalized = value.casefold()
        if value and normalized not in seen:
            parts.append(value)
            seen.add(normalized)
    return ", ".join(parts)