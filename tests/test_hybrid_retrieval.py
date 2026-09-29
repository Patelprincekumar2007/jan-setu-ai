from types import SimpleNamespace
from unittest.mock import Mock

import numpy as np
import pytest

from app.services import hybrid_retrieval_service as hybrid_module
from app.services.hybrid_retrieval_service import HybridRetrievalService


class FakeQuery:
    def __init__(self, records):
        self.records = records

    def filter(self, _expression):
        return self

    def all(self):
        return self.records


def evidence(evidence_id, title, district="Dharashiv", category="Water"):
    return SimpleNamespace(
        evidence_identifier=evidence_id,
        dataset_id="ds-water",
        title=title,
        description=f"{title} evidence content",
        state="Maharashtra",
        district=district,
        locality="Ward 4",
        category=category,
        metric_name="coverage",
        metric_value="50.76%",
        reporting_period="2024",
        source_name="Open Government Data Platform India",
        source_url="https://example.test/source",
        source_organization="Government of India",
        raw_text="Source reference: OGD-JJM-2024-MH-01",
    )


def configure_service(monkeypatch, semantic_records, metadata_records, semantic_scores):
    monkeypatch.setattr(hybrid_module.embedding_service, "embed_text", lambda _text: np.array([1.0, 0.0]))
    monkeypatch.setattr(
        hybrid_module.vector_store,
        "search",
        lambda _query, top_k: semantic_scores[:top_k],
    )
    db = Mock()
    db.query.side_effect = [FakeQuery(semantic_records), FakeQuery(metadata_records)]
    return HybridRetrievalService(), db


def test_hybrid_search_merges_duplicate_and_preserves_provenance(monkeypatch):
    item = evidence("ke-001", "Dharashiv rural tap water coverage")
    service, db = configure_service(
        monkeypatch,
        [item],
        [item],
        [("ke-001", 0.8)],
    )

    result = service.search(
        db, "water problem in Dharashiv", state="Maharashtra", district="Dharashiv", category="Water"
    )

    assert result["result_count"] == 1
    item_result = result["results"][0]
    assert item_result["evidence_id"] == "ke-001"
    assert item_result["retrieval_method"] == "hybrid"
    assert item_result["metadata_match_level"] == 3
    assert item_result["similarity_score"] == pytest.approx(0.8)
    assert item_result["source_name"] == "Open Government Data Platform India"
    assert item_result["source_url"] == "https://example.test/source"
    assert item_result["publisher"] == "Government of India"
    assert item_result["period"] == "2024"


def test_metadata_match_strength_precedes_similarity(monkeypatch):
    semantic = evidence("ke-001", "Highly similar", district="Other District")
    second_semantic = evidence("ke-003", "Moderately similar", district="Other District")
    metadata = evidence("ke-002", "Exact metadata match")
    service, db = configure_service(
        monkeypatch,
        [semantic, second_semantic],
        [metadata],
        [("ke-001", 0.99), ("ke-003", 0.9)],
    )

    result = service.search(db, "water query", district="Dharashiv", category="Water", top_k=2)

    assert [item["evidence_id"] for item in result["results"]] == ["ke-002", "ke-001"]
    assert result["results"][0]["metadata_match_level"] == 2
    assert result["results"][0]["retrieval_method"] == "metadata"


def test_ties_are_deterministic_and_top_k_is_applied(monkeypatch):
    records = [evidence("ke-002", "Equal score"), evidence("ke-001", "Equal score")]
    service, db = configure_service(
        monkeypatch,
        records,
        [],
        [("ke-002", 0.8), ("ke-001", 0.8)],
    )

    result = service.search(db, "query", top_k=1)

    assert result["result_count"] == 1
    assert result["results"][0]["evidence_id"] == "ke-001"
    assert result["results"][0]["retrieval_method"] == "semantic"


@pytest.mark.parametrize("query,top_k", [("", 5), ("   ", 5), ("query", 0), ("query", 21)])
def test_invalid_query_or_top_k_is_rejected(query, top_k):
    with pytest.raises(ValueError):
        HybridRetrievalService().search(Mock(), query, top_k=top_k)


def test_no_results_returns_empty_result(monkeypatch):
    service, db = configure_service(monkeypatch, [], [], [])

    result = service.search(db, "query")

    assert result["result_count"] == 0
    assert result["results"] == []