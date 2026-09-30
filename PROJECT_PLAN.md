# NagrikLens AI: Project Execution Plan

> **Product Mission:** Citizen Needs. Public Data. Better Decisions.
> **Scope:** Decision-support prototype for public administration. Not an official government portal.

---

## Phase Status Summary

| Phase | Milestone | Focus Area | Status |
|---|---|---|---|
| Phase 1 | Foundation UI & Mock Workflows | Institutional Design, Multi-tab Navigation, Reports Explorer | COMPLETE & LOCKED |
| Phase 2 Step 1 | Citizen Request Submission | FastAPI Validation, SQLite Storage, Reference ID Tracking | COMPLETE & LOCKED |
| Phase 2 Step 2 | Gemini Request Understanding | Google GenAI SDK, Structured Problem Extraction, Safe Fallback | COMPLETE & LOCKED |
| Phase 2 Step 3A | Public Data Foundation | OGD Jal Jeevan Mission Baseline Dataset, Raw CSV/JSON Ingestion | COMPLETE & LOCKED |
| Phase 2 Step 3B | Public Data Normalization | Clean District Names, Category Standardisation, Provenance | COMPLETE & LOCKED |
| Phase 2 Step 3C-1 | Knowledge Layer & Baseline Retrieval | Deterministic Evidence Builder, Metadata Filtering Retrieval | COMPLETE & LOCKED |
| Phase 2 Step 3C-2A | Vector Embedding & FAISS Index | Multilingual MiniLM Embeddings, L2 Normalization, Index Persistence | COMPLETE & LOCKED |
| Phase 2 Step 3C-2B | Semantic Retrieval API & Evaluation | Fast Vector Search, Stale Detection, Intent Matching | COMPLETE & LOCKED |
| Phase 2 Step 3C-2C | Hybrid Retrieval System | Metadata Match Level + FAISS Vector Scoring, Deduplication | COMPLETE & LOCKED |
| Phase 2 Step 3C-3 | Citizen Request to Retrieval Pipeline | Natural Language Query Builder, Automated Evidence Linkage | COMPLETE & LOCKED |
| Phase 2 Step 3C-4 | RAG Grounded Analysis | Gemini Context Grounding, Injection Defense, Evidence Provenance | COMPLETE & LOCKED |

---

## Completed Phases Detail

### Phase 1: Foundation UI & Institutional Interface
- **Objective:** Establish the civic design system, multilingual UI shell, navigation tabs, and institutional decision-support dashboards.
- **Components:** Responsive layout, tab navigation (Intake, Request Tracking, Dataset Browser, Institutional Analysis), Lucide icons, Civic tokens.

### Phase 2 Step 1: Citizen Request Submission & Persistence
- **Objective:** Provide a structured submission pipeline for citizens to submit localized civic concerns.
- **Service:** `backend/routes/requests.py` & `backend/models.py`
- **Features:** Input validation with Pydantic, auto-generated unique reference IDs (`NL-YYYYMMDD-XXXXXX`), and SQLite transactional persistence.

### Phase 2 Step 2: Gemini Multilingual Request Understanding
- **Objective:** Extract structured parameters from freeform citizen text across diverse Indian languages.
- **Service:** `backend/gemini_service.py`
- **Extracted Fields:** Primary language, problem category, severity score, locality, district, state, and executive summary with safe fallback logic.

### Phase 2 Step 3A & 3B: Public Data Foundation & Normalization
- **Objective:** Ingest, clean, standardise, and persist official open government datasets with complete provenance tracking.
- **Service:** `backend/public_data/` (loaders, normalizer, repository)
- **Baseline:** Jal Jeevan Mission (JJM) 2024 district-level rural drinking water coverage from Open Government Data (OGD) India.

### Phase 2 Step 3C-1: Knowledge Layer & Baseline Retrieval
- **Objective:** Transform raw normalized records into standardized, citable `KnowledgeEvidence` objects.
- **Service:** `backend/knowledge/builders.py` & `backend/knowledge/retriever.py`
- **Features:** Deterministic metadata filtering by administrative attributes (`state`, `district`, `category`).

### Phase 2 Step 3C-2A & 3C-2B: Vector Embeddings & Semantic Search
- **Objective:** Enable semantic understanding of civic issues via high-dimensional multilingual embeddings.
- **Service:** `backend/knowledge/embedding_service.py` & `backend/knowledge/vector_index.py`
- **Vector Model:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` with FAISS IndexFlatIP (cosine similarity over L2-normalized 384-dim vectors).

### Phase 2 Step 3C-2C: Hybrid Retrieval System
- **Objective:** Combine deterministic administrative filtering with multilingual vector search into a unified hybrid retriever.
- **Service:** `backend/knowledge/hybrid_retriever.py`
- **Ranking Scheme:** 
  1. `metadata_match_level` (3 = State+District+Category, 2 = District+Category, 1 = Category, 0 = Semantic Only)
  2. `similarity_score` (Cosine similarity over L2-normalized vectors)
  3. `evidence_id` ascending (Deterministic tie-breaker)
- **Deduplication:** Merges duplicates by canonical `evidence_id` and records `retrieval_method` (`hybrid`, `semantic`, or `metadata`).
- **Endpoint:** `GET /api/knowledge/hybrid-search`

### Phase 2 Step 3C-3: Citizen Request to Retrieval Pipeline
- **Objective:** Automatically ground citizen requests against public evidence upon submission.
- **Query Builder:** `backend/knowledge/query_builder.py` constructs a natural language query using problem summary, category, state, district, and locality.
- **Persistence:** `request_evidence_matches` table links `request_id` to canonical `evidence_id` with rank, scores, and match level.
- **Resilience:** If Gemini extraction fails or is unavailable, retrieval runs safely on raw user narrative without breaking request creation.
- **Endpoints:**
  - `GET /api/requests/{reference_id}` (includes `ai_extraction_status`, `retrieval_status`, `evidence_count`)
  - `GET /api/requests/{reference_id}/evidence` (returns linked public evidence with full provenance)

### Phase 2 Step 3C-4: RAG Grounded Analysis
- **Objective:** Synthesize structured public data analysis grounded strictly on retrieved evidence.
- **Context Builder:** `backend/rag/context_builder.py` formats citizen input in an isolated user-data block with injection protection rules.
- **Structured Schema:** `GroundedAnalysis` (Summary, Observations with `evidence_ids`, Evidence Gaps, Sources, Limitations).
- **Persistence:** `request_analyses` table persists analysis runs without exposing secrets.
- **Endpoint:** `POST /api/requests/{reference_id}/analysis`

---

## Verification & Test Quality Matrix

The platform includes a 100% deterministic Pytest test suite covering all modules:

| Test Module | Scope | Status |
|---|---|---|
| `tests/test_health.py` | API health check & service status | PASSED |
| `tests/test_requests.py` | Citizen request intake & tracking validation | PASSED |
| `tests/test_gemini_service.py` | Structured extraction & fallback resilience | PASSED |
| `tests/test_public_data.py` | Ingestion, normalization, & metadata verification | PASSED |
| `tests/test_knowledge.py` | Deterministic knowledge evidence building | PASSED |
| `tests/test_vector_index.py` | FAISS index build, persistence, & querying | PASSED |
| `tests/test_semantic_retrieval.py` | Vector search & semantic relevance | PASSED |
| `tests/test_hybrid_retrieval.py` | Hybrid ranking, metadata match levels, deduplication | PASSED |
| `tests/test_request_retrieval.py` | Automatic query building & evidence matching | PASSED |
| `tests/test_rag.py` | Anti-injection context & grounded Gemini synthesis | PASSED |

---

## Future Roadmap

- **Phase 3A: Expanded Data Ingestion:** Ingest additional civic sector datasets (Pradhan Mantri Gram Sadak Yojana for roads, National Health Mission for healthcare facilities).
- **Phase 3B: Spatial Visualizations:** Integrate district and block-level choropleth map overlays for public metric indicators.
- **Phase 3C: Batch Trend Synthesis:** Multi-request thematic clustering to detect recurring systemic issues across administrative sub-divisions.

---

## Known Limitations

1. **Public Dataset Coverage:** Currently limited to the Jal Jeevan Mission 2024 district-level rural drinking water baseline.
2. **Local Prototype Index:** FAISS index is stored locally and rebuilt on dataset updates.
3. **Similarity Score:** Vector similarity represents semantic proximity, not statistical confidence or empirical truth.
4. **Evidence Gaps:** Missing public records do not disprove citizen claims; gaps are explicitly noted.
5. **No Decision Automation:** System is purely decision-support; priority scoring, hotspot detection, and automated dispatch are out of scope for this stage.

