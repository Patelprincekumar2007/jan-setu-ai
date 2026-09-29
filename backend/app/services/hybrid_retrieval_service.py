from typing import Any, Optional

import numpy as np
from sqlalchemy.orm import Session

from app.models.evidence import Evidence
from app.services.embedding_service import embedding_service


class HybridRetrievalService:
    def search(
        self,
        db: Session,
        query: str,
        top_k: int = 5,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
    ) -> dict[str, Any]:
        if not query or not query.strip():
            raise ValueError("query must be a non-empty string.")
        if top_k < 1 or top_k > 20:
            raise ValueError("top_k must be an integer between 1 and 20.")

        normalized_query = query.strip()
        evidence_records = db.query(Evidence).all()
        query_vector = self._normalize(embedding_service.embed_text(normalized_query))
        semantic_results = []
        for evidence in evidence_records:
            searchable_text = " ".join(
                part for part in (evidence.title, evidence.description, evidence.raw_text or "") if part
            )
            evidence_vector = self._normalize(embedding_service.embed_text(searchable_text))
            score = float(np.dot(query_vector, evidence_vector))
            semantic_results.append((evidence, score))
        semantic_results.sort(key=lambda item: (-item[1], item[0].evidence_identifier))
        semantic_by_id = {
            evidence.evidence_identifier: score
            for evidence, score in semantic_results[:top_k]
        }

        metadata_query = db.query(Evidence)
        has_filters = any(value and value.strip() for value in (state, district, category))
        if state and state.strip():
            metadata_query = metadata_query.filter(Evidence.state.ilike(f"%{state.strip()}%"))
        if district and district.strip():
            metadata_query = metadata_query.filter(Evidence.district.ilike(f"%{district.strip()}%"))
        if category and category.strip():
            metadata_query = metadata_query.filter(Evidence.category.ilike(f"%{category.strip()}%"))
        metadata_records = metadata_query.all() if has_filters else []
        metadata_by_id = {item.evidence_identifier: item for item in metadata_records}

        merged: dict[str, Any] = {
            evidence.evidence_identifier: evidence
            for evidence, _ in semantic_results[:top_k]
        }
        merged.update(metadata_by_id)

        ranked = []
        for evidence_id, evidence in merged.items():
            match_level = self._metadata_match_level(evidence, state, district, category)
            is_semantic = evidence_id in semantic_by_id
            is_metadata = evidence_id in metadata_by_id
            retrieval_method = "hybrid" if is_semantic and is_metadata else (
                "semantic" if is_semantic else "metadata"
            )
            ranked.append((
                evidence,
                match_level,
                semantic_by_id.get(evidence_id),
                retrieval_method,
            ))

        ranked.sort(key=lambda item: (
            -item[1],
            -(item[2] if item[2] is not None else float("-inf")),
            item[0].evidence_identifier,
        ))
        results = [self._serialize(*item) for item in ranked[:top_k]]
        return {
            "query": normalized_query,
            "retriever": "hybrid",
            "top_k": top_k,
            "result_count": len(results),
            "filters": {"state": state, "district": district, "category": category},
            "results": results,
        }

    @staticmethod
    def _normalize(vector: np.ndarray) -> np.ndarray:
        vector = np.asarray(vector, dtype="float32").reshape(-1)
        norm = float(np.linalg.norm(vector))
        return vector / norm if norm else vector

    @staticmethod
    def _metadata_match_level(
        evidence: Evidence,
        state: Optional[str],
        district: Optional[str],
        category: Optional[str],
    ) -> int:
        exact_state = bool(state and evidence.state.casefold() == state.strip().casefold())
        exact_district = bool(district and evidence.district.casefold() == district.strip().casefold())
        exact_category = bool(category and evidence.category.casefold() == category.strip().casefold())
        if exact_state and exact_district and exact_category:
            return 3
        if exact_district and exact_category:
            return 2
        if exact_category:
            return 1
        return 0

    @staticmethod
    def _serialize(
        evidence: Evidence,
        metadata_match_level: int,
        similarity_score: Optional[float],
        retrieval_method: str,
    ) -> dict[str, Any]:
        return {
            "evidence_id": evidence.evidence_identifier,
            "dataset_id": evidence.dataset_id,
            "title": evidence.title,
            "content": evidence.description,
            "state": evidence.state,
            "district": evidence.district,
            "locality": evidence.locality,
            "category": evidence.category,
            "metric_name": evidence.metric_name,
            "metric_value": evidence.metric_value,
            "period": evidence.reporting_period,
            "source_name": evidence.source_name,
            "source_url": evidence.source_url,
            "publisher": evidence.source_organization,
            "notes": evidence.raw_text,
            "similarity_score": similarity_score,
            "metadata_match_level": metadata_match_level,
            "retrieval_method": retrieval_method,
        }


hybrid_retrieval_service = HybridRetrievalService()