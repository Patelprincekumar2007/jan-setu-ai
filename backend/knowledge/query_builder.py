from typing import Optional


def build_retrieval_query(
    problem_summary: Optional[str] = None,
    citizen_request: Optional[str] = None,
    category: Optional[str] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    locality: Optional[str] = None,
    affected_group: Optional[str] = None,
    severity: Optional[str] = None,
    location_hint: Optional[str] = None,
) -> str:
    """
    Constructs a concise, natural-language retrieval query from citizen request data
    and extracted structured AI intelligence fields.
    """
    parts = []

    # 1. Primary problem core
    if problem_summary and problem_summary.strip():
        parts.append(problem_summary.strip())
    elif citizen_request and citizen_request.strip():
        # Fallback to citizen request text (truncated if very long)
        text = citizen_request.strip()
        if len(text) > 200:
            parts.append(text[:200].strip())
        else:
            parts.append(text)

    # 2. Add category context if not already mentioned
    if category and category.strip() and category.lower() != "other":
        cat_str = category.strip()
        if cat_str.lower() not in " ".join(parts).lower():
            parts.append(f"{cat_str} issue")

    # 3. Add specific location context
    location_parts = []
    if locality and locality.strip():
        location_parts.append(locality.strip())
    if location_hint and location_hint.strip() and location_hint.strip().lower() != (locality or "").strip().lower():
        location_parts.append(location_hint.strip())
    if district and district.strip():
        location_parts.append(district.strip())
    if state and state.strip():
        location_parts.append(state.strip())

    if location_parts:
        parts.append(", ".join(location_parts))

    # 4. Add affected group if specific
    if affected_group and affected_group.strip():
        parts.append(f"affecting {affected_group.strip()}")

    query = ", ".join([p for p in parts if p]).strip()
    return query if query else (citizen_request or "civic infrastructure issue").strip()
