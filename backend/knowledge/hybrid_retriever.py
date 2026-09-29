import logging
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session

from backend.knowledge.schemas import (
    HybridKnowledgeEvidenceResponse,
    HybridKnowledgeSearchResponse,
    HybridKnowledgeSearchFilters,
)
from backend.knowledge.retriever import (
    BaseKnowledgeRetriever,
    DeterministicMetadataRetriever,
    SemanticFAISSRetriever,
)
from backend.knowledge.embedding_service import BaseEmbeddingService

logger = logging.getLogger("nagriklens.knowledge.hybrid_retriever")


def calculate_metadata_match_level(
    record_state: Optional[str],
    record_district: Optional[str],
    record_category: Optional[str],
    filter_state: Optional[str],
    filter_district: Optional[str],
    filter_category: Optional[str],
) -> int:
    """
    Computes deterministic metadata match strength level:
    3 = state + district + category match
    2 = district + category match (or state + district if category not provided)
    1 = category match (or district match)
    0 = semantic-only / no structured match
    """
    state_match = bool(
        filter_state
        and record_state
        and filter_state.strip().lower() in record_state.strip().lower()
    )
    district_match = bool(
        filter_district
        and record_district
        and filter_district.strip().lower() in record_district.strip().lower()
    )
    category_match = bool(
        filter_category
        and record_category
        and filter_category.strip().lower() == record_category.strip().lower()
    )

    if state_match and district_match and category_match:
        return 3
    if district_match and category_match:
        return 2
    if state_match and district_match:
        return 2
    if category_match or district_match or state_match:
        return 1
    return 0


class HybridKnowledgeRetriever(BaseKnowledgeRetriever):
    """
    Hybrid Knowledge Retriever combining Deterministic Metadata Filtering and Semantic FAISS Search.
    
    Ranking Logic:
    1. metadata_match_level descending (3: State+District+Category, 2: District+Category, 1: Category, 0: Semantic-only)
    2. similarity_score descending (Cosine similarity from FAISS embeddings)
    3. evidence_id ascending (Deterministic tie-breaker)
    """

    def __init__(
        self,
        db: Session,
        embedding_service: Optional[BaseEmbeddingService] = None,
        vector_dir: Optional[str] = None,
    ):
        self.db = db
        self.embedding_service = embedding_service
        self.vector_dir = vector_dir
        self.metadata_retriever = DeterministicMetadataRetriever(db=db)
        self.semantic_retriever = SemanticFAISSRetriever(
            db=db,
            embedding_service=embedding_service,
            vector_dir=vector_dir,
        )

    def retrieve(
        self,
        query: Optional[str] = None,
        *,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> Tuple[List[HybridKnowledgeEvidenceResponse], int]:
        if not query or not query.strip():
            raise ValueError("query must be a non-empty string.")

        if top_k < 1 or top_k > 20:
            raise ValueError("top_k must be an integer between 1 and 20.")

        clean_query = query.strip()
        has_metadata_filters = bool(
            (state and state.strip())
            or (district and district.strip())
            or (category and category.strip())
        )

        # 1. Semantic Retrieval (run on semantic FAISS index)
        # Fetch candidate pool for hybrid merging
        fetch_pool_k = min(20, max(top_k * 2, 10))
        semantic_results = []
        try:
            semantic_results, _ = self.semantic_retriever.retrieve(
                query=clean_query,
                state=state,
                district=district,
                category=category,
                top_k=fetch_pool_k,
            )
        except Exception as e:
            logger.warning(f"Semantic retrieval in hybrid search failed or unavailable: {e}")
            semantic_results = []

        # 2. Metadata Retrieval (run when metadata filters or structured query is present)
        metadata_results = []
        if has_metadata_filters:
            try:
                metadata_results, _ = self.metadata_retriever.retrieve(
                    query=clean_query,
                    state=state,
                    district=district,
                    category=category,
                    top_k=fetch_pool_k,
                )
            except Exception as e:
                logger.warning(f"Metadata retrieval in hybrid search failed: {e}")
                metadata_results = []

        # 3. Merge & Deduplicate by evidence_id
        merged: Dict[str, Dict[str, Any]] = {}

        # Process semantic results
        for item in semantic_results:
            match_level = calculate_metadata_match_level(
                record_state=item.state,
                record_district=item.district,
                record_category=item.category,
                filter_state=state,
                filter_district=district,
                filter_category=category,
            )
            merged[item.evidence_id] = {
                "evidence": item,
                "similarity_score": float(item.similarity_score),
                "metadata_match_level": match_level,
                "retrieval_method": "semantic",
            }

        # Process metadata results
        for item in metadata_results:
            match_level = calculate_metadata_match_level(
                record_state=item.state,
                record_district=item.district,
                record_category=item.category,
                filter_state=state,
                filter_district=district,
                filter_category=category,
            )
            if item.evidence_id in merged:
                # Exists in both: mark as hybrid and ensure match level is set
                merged[item.evidence_id]["retrieval_method"] = "hybrid"
                merged[item.evidence_id]["metadata_match_level"] = max(
                    merged[item.evidence_id]["metadata_match_level"], match_level
                )
            else:
                # Metadata only
                merged[item.evidence_id] = {
                    "evidence": item,
                    "similarity_score": 0.0,
                    "metadata_match_level": match_level,
                    "retrieval_method": "metadata",
                }

        # 4. Rank deterministically:
        # First: metadata_match_level descending
        # Then: similarity_score descending
        # Then: evidence_id ascending
        sorted_items = sorted(
            merged.values(),
            key=lambda x: (
                -x["metadata_match_level"],
                -x["similarity_score"],
                x["evidence"].evidence_id,
            ),
        )

        total_count = len(sorted_items)
        top_items = sorted_items[:top_k]

        results: List[HybridKnowledgeEvidenceResponse] = []
        for item in top_items:
            ev = item["evidence"]
            results.append(
                HybridKnowledgeEvidenceResponse(
                    evidence_id=ev.evidence_id,
                    dataset_id=ev.dataset_id,
                    record_id=ev.record_id,
                    title=ev.title,
                    content=ev.content,
                    state=ev.state,
                    district=ev.district,
                    locality=ev.locality,
                    category=ev.category,  # type: ignore
                    metric_name=ev.metric_name,
                    metric_value=ev.metric_value,
                    unit=ev.unit,
                    year=ev.year,
                    period=ev.period,
                    geographic_level=ev.geographic_level,
                    source_name=ev.source_name,
                    source_url=ev.source_url,
                    source_reference=ev.source_reference,
                    publisher=ev.publisher,
                    license=ev.license,
                    last_updated=ev.last_updated,
                    notes=ev.notes,
                    created_at=ev.created_at,
                    similarity_score=float(item["similarity_score"]),
                    metadata_match_level=int(item["metadata_match_level"]),
                    retrieval_method=item["retrieval_method"],
                )
            )

        return results, total_count


def hybrid_search(
    db: Session,
    query: str,
    top_k: int = 5,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    embedding_service: Optional[BaseEmbeddingService] = None,
    vector_dir: Optional[str] = None,
) -> HybridKnowledgeSearchResponse:
    """
    High-level interface for hybrid knowledge search.
    Validates input, runs HybridKnowledgeRetriever, and formats the response.
    """
    retriever = HybridKnowledgeRetriever(
        db=db,
        embedding_service=embedding_service,
        vector_dir=vector_dir,
    )

    results, _ = retriever.retrieve(
        query=query,
        state=state,
        district=district,
        category=category,
        top_k=top_k,
    )

    return HybridKnowledgeSearchResponse(
        query=query.strip(),
        retriever="hybrid",
        top_k=top_k,
        result_count=len(results),
        filters=HybridKnowledgeSearchFilters(
            state=state,
            district=district,
            category=category,
        ),
        results=results,
    )
