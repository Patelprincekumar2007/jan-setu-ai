from app.services.retrieval_query_builder import build_retrieval_query


def test_build_retrieval_query_uses_extracted_and_location_fields():
    result = build_retrieval_query(
        {
            "problem_summary": "Primary health centre lacks clean drinking water facility",
            "category": "Water",
            "affected_group": "Patients and staff",
            "severity": "high",
        },
        original_request="Original citizen request",
        category="Water",
        state="Maharashtra",
        district="Dharashiv",
        locality="Ward 4",
    )

    assert result == (
        "Primary health centre lacks clean drinking water facility, Water, "
        "Maharashtra, Dharashiv, Ward 4, Patients and staff, high"
    )


def test_build_retrieval_query_falls_back_to_original_request():
    result = build_retrieval_query(
        None,
        original_request="Borewell is non-functional",
        category="Water",
        state="Maharashtra",
        district="Dharashiv",
    )

    assert result == "Borewell is non-functional, Water, Maharashtra, Dharashiv"


def test_build_retrieval_query_normalizes_and_deduplicates_fields():
    result = build_retrieval_query(
        {"problem_summary": "  Drinking water issue  ", "category": "water"},
        original_request="unused",
        category="Water",
    )

    assert result == "Drinking water issue, water"