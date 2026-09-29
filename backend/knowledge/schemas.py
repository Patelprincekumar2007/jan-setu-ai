from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

CategoryType = Literal["Water", "Roads", "Healthcare", "Sanitation", "Other"]


class KnowledgeEvidenceBase(BaseModel):
    evidence_id: str = Field(..., min_length=2, max_length=120)
    dataset_id: str = Field(..., min_length=2, max_length=100)
    record_id: str = Field(..., min_length=2, max_length=100)
    title: str = Field(..., min_length=2, max_length=255)
    content: str = Field(..., min_length=5, description="Deterministic human-readable factual evidence text")
    state: str = Field(..., min_length=1, max_length=100)
    district: str = Field(..., min_length=1, max_length=100)
    locality: Optional[str] = None
    category: CategoryType
    metric_name: str = Field(..., min_length=1, max_length=150)
    metric_value: Optional[float] = None
    unit: Optional[str] = None
    year: Optional[int] = None
    period: Optional[str] = None
    geographic_level: str = "District"
    source_name: str = Field(..., min_length=1, max_length=200)
    source_url: Optional[str] = None
    source_reference: str = Field(..., min_length=1, max_length=150)
    publisher: Optional[str] = None
    license: Optional[str] = None
    last_updated: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("evidence_id", "dataset_id", "record_id", "title", "content", "state", "district", "source_reference", mode="before")
    @classmethod
    def check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                raise ValueError("Field cannot be empty or whitespace only.")
            return cleaned
        raise ValueError("Field must be a valid string.")


class KnowledgeEvidenceCreate(KnowledgeEvidenceBase):
    pass


class KnowledgeEvidenceResponse(KnowledgeEvidenceBase):
    created_at: Optional[datetime] = None


class KnowledgeSearchResponse(BaseModel):
    query: Optional[str] = None
    retriever: str = "baseline_metadata"
    total: int
    results: List[KnowledgeEvidenceResponse]


class SemanticKnowledgeEvidenceResponse(KnowledgeEvidenceResponse):
    similarity_score: float


class SemanticKnowledgeSearchFilters(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    category: Optional[str] = None


class SemanticKnowledgeSearchResponse(BaseModel):
    query: str
    retriever: str = "semantic_faiss"
    top_k: int
    result_count: int
    filters: SemanticKnowledgeSearchFilters
    results: List[SemanticKnowledgeEvidenceResponse]


class KnowledgeDatasetSummaryResponse(BaseModel):
    dataset_id: str
    title: str
    source_name: str
    source_url: Optional[str] = None
    publisher: Optional[str] = None
    license: Optional[str] = None
    ingestion_status: str
    evidence_count: int
    last_updated: Optional[str] = None
