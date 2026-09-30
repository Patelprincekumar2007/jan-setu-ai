import os
import json
import hashlib
import datetime
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

from sqlalchemy.orm import Session
from backend.knowledge.models import KnowledgeEvidence
from backend.knowledge.embedding_service import BaseEmbeddingService, get_embedding_service
from backend.config import settings

logger = logging.getLogger("nagriklens.knowledge.vector_index")


class VectorIndexUnavailableException(Exception):
    """Raised when semantic vector index is missing, corrupted, or stale."""
    def __init__(self, reason: str = "unavailable", message: Optional[str] = None):
        self.reason = reason
        self.message = message or "Semantic knowledge index is unavailable. Build or rebuild the vector index first."
        super().__init__(self.message)


def compute_evidence_content_hash(evidence_items: List[KnowledgeEvidence]) -> str:
    """
    Computes a deterministic SHA-256 hash across sorted evidence records.
    The hash depends strictly on evidence_id and content.
    """
    hasher = hashlib.sha256()
    for item in sorted(evidence_items, key=lambda x: x.evidence_id):
        entry = f"{item.evidence_id}:{item.content}"
        hasher.update(entry.encode("utf-8"))
    return hasher.hexdigest()


def get_index_file_paths(vector_dir: Optional[str] = None) -> Tuple[Path, Path]:
    """Returns paths to knowledge.index and knowledge_metadata.json."""
    base_dir = Path(vector_dir or settings.vector_dir)
    return base_dir / "knowledge.index", base_dir / "knowledge_metadata.json"


def get_vector_index_status(
    db: Session,
    embedding_service: Optional[BaseEmbeddingService] = None,
    vector_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Evaluates current status, freshness, and compatibility of the vector index.
    """
    index_path, meta_path = get_index_file_paths(vector_dir)

    if not index_path.exists():
        return {"available": False, "reason": "index_not_found"}
    if not meta_path.exists():
        return {"available": False, "reason": "metadata_not_found"}

    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
    except Exception as e:
        logger.warning(f"Error reading vector metadata: {e}")
        return {"available": False, "reason": "invalid_metadata"}

    service = embedding_service or get_embedding_service()
    if meta.get("embedding_model") != service.model_name:
        return {
            "available": False,
            "stale": True,
            "reason": "model_mismatch",
            "index_model": meta.get("embedding_model"),
            "current_model": service.model_name,
        }

    # Verify evidence consistency against SQLite
    all_evidence = db.query(KnowledgeEvidence).order_by(KnowledgeEvidence.evidence_id.asc()).all()
    current_count = len(all_evidence)
    if meta.get("evidence_count") != current_count:
        return {
            "available": False,
            "stale": True,
            "reason": "evidence_mismatch",
            "index_count": meta.get("evidence_count"),
            "current_count": current_count,
        }

    current_hash = compute_evidence_content_hash(all_evidence)
    if meta.get("content_hash") != current_hash:
        return {
            "available": False,
            "stale": True,
            "reason": "stale_index",
        }

    return {
        "available": True,
        "stale": False,
        "embedding_model": meta.get("embedding_model"),
        "dimension": meta.get("dimension"),
        "evidence_count": meta.get("evidence_count"),
        "metric": meta.get("metric", "cosine_via_inner_product"),
        "created_at": meta.get("created_at"),
    }


def build_vector_index(
    db: Session,
    embedding_service: Optional[BaseEmbeddingService] = None,
    vector_dir: Optional[str] = None,
    dataset_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Loads KnowledgeEvidence records from SQLite, generates normalized embeddings,
    and constructs a persistent FAISS IndexFlatIP index with companion metadata.
    """
    import faiss

    service = embedding_service or get_embedding_service()
    index_path, meta_path = get_index_file_paths(vector_dir)
    os.makedirs(index_path.parent, exist_ok=True)

    query = db.query(KnowledgeEvidence)
    if dataset_id:
        query = query.filter(KnowledgeEvidence.dataset_id == dataset_id)
    
    evidence_items = query.order_by(KnowledgeEvidence.evidence_id.asc()).all()
    if not evidence_items:
        raise ValueError("No knowledge evidence records found to build vector index.")

    contents = [e.content for e in evidence_items]
    evidence_ids = [e.evidence_id for e in evidence_items]

    logger.info(f"Generating embeddings for {len(contents)} evidence items using '{service.model_name}'...")
    embeddings = service.encode_documents(contents)

    dim = service.dimension
    if embeddings.shape[1] != dim:
        raise ValueError(f"Embedding shape mismatch: expected dim {dim}, got {embeddings.shape[1]}")

    # Build FAISS IndexFlatIP (Inner Product over L2-normalized vectors represents Cosine Similarity)
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    # Persist FAISS index file
    faiss.write_index(index, str(index_path))

    # Persist companion index metadata
    content_hash = compute_evidence_content_hash(evidence_items)
    metadata = {
        "index_version": 1,
        "embedding_model": service.model_name,
        "metric": "cosine_via_inner_product",
        "dimension": dim,
        "evidence_count": len(evidence_items),
        "evidence_ids": evidence_ids,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "content_hash": content_hash,
        "dataset_filter": dataset_id,
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Successfully built and persisted FAISS vector index with {len(evidence_items)} records.")

    return {
        "status": "built",
        "embedding_model": service.model_name,
        "dimension": dim,
        "evidence_count": len(evidence_items),
        "index_path": str(index_path),
        "content_hash": content_hash,
    }


def search_vector_index(
    db: Session,
    query_text: str,
    top_k: int = 5,
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    embedding_service: Optional[BaseEmbeddingService] = None,
    vector_dir: Optional[str] = None,
) -> Tuple[List[Tuple[KnowledgeEvidence, float]], int]:
    """
    Performs cosine similarity vector search over the FAISS index with candidate oversampling
    and post-filtering by geographic / category criteria.
    """
    import faiss

    if not query_text or not query_text.strip():
        raise ValueError("query must be non-empty.")

    if top_k < 1 or top_k > 20:
        raise ValueError("top_k must be an integer between 1 and 20.")

    service = embedding_service or get_embedding_service()
    status = get_vector_index_status(db, embedding_service=service, vector_dir=vector_dir)
    if not status.get("available"):
        raise VectorIndexUnavailableException(reason=status.get("reason", "unknown"))

    index_path, meta_path = get_index_file_paths(vector_dir)
    index = faiss.read_index(str(index_path))

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    evidence_ids: List[str] = meta.get("evidence_ids", [])
    total_indexed = len(evidence_ids)
    if total_indexed == 0:
        return [], 0

    # Candidate search pool covering all indexed records to guarantee post-filtering recall
    pool_size = total_indexed

    query_vec = service.encode_query(query_text).reshape(1, -1)
    scores, indices = index.search(query_vec, pool_size)


    candidate_scores: List[Tuple[str, float]] = []
    for score, idx in zip(scores[0], indices[0]):
        if idx >= 0 and idx < total_indexed:
            candidate_scores.append((evidence_ids[idx], float(score)))

    if not candidate_scores:
        return [], 0

    # Fetch evidence records by candidate IDs
    candidate_id_list = [cid for cid, _ in candidate_scores]
    score_map = {cid: sc for cid, sc in candidate_scores}

    records_query = db.query(KnowledgeEvidence).filter(KnowledgeEvidence.evidence_id.in_(candidate_id_list))
    if state and state.strip():
        records_query = records_query.filter(KnowledgeEvidence.state.ilike(f"%{state.strip()}%"))
    if district and district.strip():
        records_query = records_query.filter(KnowledgeEvidence.district.ilike(f"%{district.strip()}%"))
    if category and category.strip():
        records_query = records_query.filter(KnowledgeEvidence.category == category.strip())

    filtered_records = records_query.all()
    total_matched = len(filtered_records)

    # Sort filtered candidates strictly by similarity score descending, then evidence_id ascending
    ranked_results = [
        (rec, score_map[rec.evidence_id])
        for rec in filtered_records
    ]
    ranked_results.sort(key=lambda item: (-item[1], item[0].evidence_id))

    return ranked_results[:top_k], total_matched
