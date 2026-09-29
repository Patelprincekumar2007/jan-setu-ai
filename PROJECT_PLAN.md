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

### Phase 2 Step 3C-2C: Hybrid Retrieval
- **Objective:** Combine deterministic metadata retrieval with semantic FAISS retrieval into a unified hybrid retriever.
- **Service:** `backend/knowledge/hybrid_retriever.py`
- **Ranking Scheme:** 
  1. `metadata_match_level` (3 = State+District+Category, 2 = District+Category, 1 = Category, 0 = Semantic Only)
  2. `similarity_score` (Cosine similarity over L2-normalized vectors)
  3. `evidence_id` ascending (Deterministic tie-breaker)
- **Deduplication:** Merges duplicates by `evidence_id` and records `retrieval_method` (`hybrid`, `semantic`, or `metadata`).
- **Endpoint:** `GET /api/knowledge/hybrid-search`

### Phase 2 Step 3C-3: Citizen Request to Retrieval Pipeline
- **Objective:** Automatically ground submitted citizen requests against public evidence upon submission.
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

## Known Limitations

1. **Public Dataset Coverage:** Currently limited to the Jal Jeevan Mission 2024 district-level rural drinking water baseline.
2. **Local Prototype Index:** FAISS index is stored locally and rebuilt on dataset updates.
3. **Similarity Score:** Vector similarity represents semantic proximity, not statistical confidence or empirical truth.
4. **Evidence Gaps:** Missing public records do not disprove citizen claims; gaps are explicitly noted.
5. **No Decision Automation:** System is purely decision-support; priority scoring, hotspot detection, and automated dispatch are out of scope for this stage.
