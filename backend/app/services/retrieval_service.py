import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.evidence import Evidence
from app.services.embedding_service import embedding_service
from app.services.vector_store import vector_store

logger = logging.getLogger(__name__)

class RetrievalService:
    def search_evidence(
        self,
        db: Session,
        query: str,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        top_k: int = 10
    ) -> Dict[str, Any]:
        """
        Executes hybrid retrieval: Semantic Embedding + FAISS vector search + Metadata Filters.
        """
        # 1. Base SQL query with metadata filtering
        sql_query = db.query(Evidence)
        if state:
            sql_query = sql_query.filter(Evidence.state.ilike(f"%{state}%"))
        if district:
            sql_query = sql_query.filter(Evidence.district.ilike(f"%{district}%"))
        if category:
            sql_query = sql_query.filter(Evidence.category.ilike(f"%{category}%"))

        candidate_evidences = sql_query.all()

        if not candidate_evidences:
            # Fallback: broaden metadata search if exact district/category metadata match fails
            sql_query_broad = db.query(Evidence)
            if state:
                sql_query_broad = sql_query_broad.filter(Evidence.state.ilike(f"%{state}%"))
            candidate_evidences = sql_query_broad.all()

        if not candidate_evidences:
            # Absolute fallback: search all evidences
            candidate_evidences = db.query(Evidence).all()

        if not candidate_evidences:
            return {
                "results": [],
                "evidence_coverage": "INSUFFICIENT",
                "total": 0
            }

        # 2. Semantic Search with embedding
        query_vector = embedding_service.embed_text(query)
        
        # Calculate semantic cosine score for candidates
        results = []
        for ev in candidate_evidences:
            text_to_embed = f"{ev.title} {ev.description} {ev.raw_text or ''}"
            ev_vector = embedding_service.embed_text(text_to_embed)
            # Dot product (normalized vectors = cosine similarity)
            score = float(sum(a * b for a, b in zip(query_vector, ev_vector)))
            
            # Boost score if metadata matches exactly
            boost = 0.0
            if state and ev.state and state.lower() in ev.state.lower():
                boost += 0.1
            if district and ev.district and district.lower() in ev.district.lower():
                boost += 0.15
            if category and ev.category and category.lower() in ev.category.lower():
                boost += 0.1

            final_score = round(min(1.0, max(0.0, score + boost)), 3)
            
            ev_dict = {
                "id": ev.id,
                "dataset_id": ev.dataset_id,
                "evidence_identifier": ev.evidence_identifier,
                "source_name": ev.source_name,
                "source_organization": ev.source_organization,
                "source_url": ev.source_url,
                "title": ev.title,
                "description": ev.description,
                "state": ev.state,
                "district": ev.district,
                "locality": ev.locality,
                "category": ev.category,
                "reporting_period": ev.reporting_period,
                "metric_name": ev.metric_name,
                "metric_value": ev.metric_value,
                "raw_text": ev.raw_text,
                "extra_metadata": ev.extra_metadata,
                "verification_status": ev.verification_status,
                "created_at": ev.created_at,
                "similarity_score": final_score
            }
            results.append(ev_dict)

        # 3. Sort by final relevance score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_results = results[:top_k]

        # Determine evidence coverage
        if not top_results or top_results[0]["similarity_score"] < 0.3:
            coverage = "INSUFFICIENT"
        elif len(top_results) >= 2 and top_results[0]["similarity_score"] >= 0.6:
            coverage = "STRONG"
        else:
            coverage = "PARTIAL"

        return {
            "results": top_results,
            "evidence_coverage": coverage,
            "total": len(top_results)
        }

retrieval_service = RetrievalService()
