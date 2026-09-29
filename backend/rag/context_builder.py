from collections.abc import Mapping, Sequence
from typing import Any


def _value(source: Any, key: str, default: Any = None) -> Any:
    if isinstance(source, Mapping):
        return source.get(key, default)
    return getattr(source, key, default)


def build_rag_context(request: Any, evidence: Sequence[Any]) -> dict[str, Any]:
    request_data = {
        "reference_id": _value(request, "reference_id"),
        "citizen_request": _value(request, "citizen_request", ""),
        "category": _value(request, "category"),
        "state": _value(request, "state"),
        "district": _value(request, "district"),
        "locality": _value(request, "locality"),
    }
    evidence_data = []
    for item in evidence:
        evidence_data.append({
            "evidence_id": _value(item, "evidence_id", _value(item, "evidence_identifier")),
            "title": _value(item, "title"),
            "location": {
                "state": _value(item, "state"),
                "district": _value(item, "district"),
                "locality": _value(item, "locality"),
                "geographic_level": _value(item, "geographic_level"),
            },
            "category": _value(item, "category"),
            "metric_name": _value(item, "metric_name"),
            "metric_value": _value(item, "metric_value"),
            "unit": _value(item, "unit"),
            "year": _value(item, "year"),
            "period": _value(item, "period"),
            "source_name": _value(item, "source_name"),
            "source_reference": _value(item, "source_reference"),
            "source_url": _value(item, "source_url"),
            "publisher": _value(item, "publisher"),
            "license": _value(item, "license"),
            "last_updated": _value(item, "last_updated"),
            "content": _value(item, "content", _value(item, "description")),
        })
    return {"untrusted_citizen_request": request_data, "verified_public_evidence": evidence_data}