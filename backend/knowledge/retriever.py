import logging
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session

from backend.knowledge.schemas import (
    KnowledgeEvidenceResponse,
    SemanticKnowledgeEvidenceResponse,
    SemanticKnowledgeSearchResponse,
    SemanticKnowledgeSearchFilters,
)
from backend.knowledge.embedding_service import BaseEmbeddingService, get_embedding_service
from backend.knowledge.vector_index import (
    search_vector_index,
    get_vector_index_status,
    VectorIndexUnavailableException,
)
from backend.knowledge import repository as knowledge_repo

logger = logging.getLogger("nagriklens.knowledge.retriever")


class BaseKnowledgeRetriever(ABC):
    """
    Abstract Retrieval Contract for NagrikLens AI.
    All retrieval strategies (Metadata, Semantic FAISS, Hybrid) implement this interface.
    """

    @abstractmethod
    def retrieve(
        self,
        query: Optional[str] = None,
        *,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> Tuple[List[Any], int]:
        pass


class DeterministicMetadataRetriever(BaseKnowledgeRetriever):
    """
    Baseline deterministic metadata-driven retriever.
    Performs deterministic filtering over structured public knowledge records.
    """

    def __init__(self, db: Session):
        self.db = db

    def retrieve(
        self,
        query: Optional[str] = None,
        *,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> Tuple[List[KnowledgeEvidenceResponse], int]:
        if top_k < 1 or top_k > 20:
            raise ValueError("top_k must be an integer between 1 and 20.")

        records, total = knowledge_repo.query_knowledge_evidence_deterministic(
            db=self.db,
            query_text=query,
            state=state,
            district=district,
            category=category,
            top_k=top_k,
        )

        results = [
            KnowledgeEvidenceResponse(
                evidence_id=r.evidence_id,
                dataset_id=r.dataset_id,
                record_id=r.record_id,
                title=r.title,
                content=r.content,
                state=r.state,
                district=r.district,
                locality=r.locality,
                category=r.category,  # type: ignore
                metric_name=r.metric_name,
                metric_value=r.metric_value,
                unit=r.unit,
                year=r.year,
                period=r.period,
                geographic_level=r.geographic_level,
                source_name=r.source_name,
                source_url=r.source_url,
                source_reference=r.source_reference,
                publisher=r.publisher,
                license=r.license,
                last_updated=r.last_updated,
                notes=r.notes,
                created_at=r.created_at,
            )
            for r in records
        ]

        return results, total


class SemanticFAISSRetriever(BaseKnowledgeRetriever):
    """
    Semantic Vector Retriever using SentenceTransformers + FAISS IndexFlatIP.
    Executes cosine similarity retrieval over normalized vector embeddings.
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

    def retrieve(
        self,
        query: Optional[str] = None,
        *,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> Tuple[List[SemanticKnowledgeEvidenceResponse], int]:
        if not query or not query.strip():
            raise ValueError("query must be a non-empty string.")

        if top_k < 1 or top_k > 20:
            raise ValueError("top_k must be an integer between 1 and 20.")

        ranked_items, total_matched = search_vector_index(
            db=self.db,
            query_text=query.strip(),
            top_k=top_k,
            state=state,
            district=district,
            category=category,
            embedding_service=self.embedding_service,
            vector_dir=self.vector_dir,
        )

        results = []
        for rec, score in ranked_items:
            results.append(
                SemanticKnowledgeEvidenceResponse(
                    evidence_id=rec.evidence_id,
                    dataset_id=rec.dataset_id,
                    record_id=rec.record_id,
                    title=rec.title,
                    content=rec.content,
                    state=rec.state,
                    district=rec.district,
                    locality=rec.locality,
                    category=rec.category,  # type: ignore
                    metric_name=rec.metric_name,
                    metric_value=rec.metric_value,
                    unit=rec.unit,
                    year=rec.year,
                    period=rec.period,
                    geographic_level=rec.geographic_level,
                    source_name=rec.source_name,
                    source_url=rec.source_url,
                    source_reference=rec.source_reference,
                    publisher=rec.publisher,
                    license=rec.license,
                    last_updated=rec.last_updated,
                    notes=rec.notes,
                    created_at=rec.created_at,
                    similarity_score=float(score),
                )
            )

        return results, total_matched


def semantic_search(
    db: Session,
    query: str,
    top_k: int = 5,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    embedding_service: Optional[BaseEmbeddingService] = None,
    vector_dir: Optional[str] = None,
) -> SemanticKnowledgeSearchResponse:
    """
    High-level service interface for semantic vector retrieval.
    Validates query and filters, invokes SemanticFAISSRetriever, and formats the response.
    """
    retriever = SemanticFAISSRetriever(
        db=db,
        embedding_service=embedding_service,
        vector_dir=vector_dir,
    )

    results, total = retriever.retrieve(
        query=query,
        state=state,
        district=district,
        category=category,
        top_k=top_k,
    )

    return SemanticKnowledgeSearchResponse(
        query=query.strip(),
        retriever="semantic_faiss",
        top_k=top_k,
        result_count=len(results),
        filters=SemanticKnowledgeSearchFilters(
            state=state,
            district=district,
            category=category,
        ),
        results=results,
    )
