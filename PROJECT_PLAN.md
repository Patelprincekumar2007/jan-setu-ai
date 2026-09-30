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
| Phase 2 Step 3D | Real Public Dataset Expansion | Multi-sector Datasets (Water, Healthcare, Sanitation, Roads), Reusable Ingestion, Quality Reports | COMPLETE & LOCKED |
| Phase 2 Step 3E | Evidence-Based Prioritisation | Deterministic Engine, 5 Factors, Re-normalized Denominator, priority-v1 | COMPLETE & LOCKED |
| Phase 2 Step 3F | Demand Aggregation & Hotspots | Deterministic Clustering on Actual Requests, hotspot-v1 | COMPLETE & LOCKED |
| Phase 2 Step 3G | Decision-Support Dashboard | Real-time Metric Aggregates, Multi-section Analytics, Zero Fake Maps | COMPLETE & LOCKED |
| Phase 2 Step 3H | Request Analytics | Category, Geographic, Timeline, Severity, Evidence Coverage APIs | COMPLETE & LOCKED |
| Phase 2 Step 3I | Multilingual + Voice | English, Hindi, Gujarati Intake, Google Speech Integration & Safe Fallback | COMPLETE & LOCKED |
| Phase 2 Step 3J | Security & Production Hardening | Security Headers, Rate Limiting, Sanitized Errors, Explicit CORS | COMPLETE & LOCKED |

---

## Detailed Completed Stages (3E through 3J)

### Stage 3E: Evidence-Based Prioritisation
- **Objective:** Transform Citizen Request + Verified Public Evidence into a deterministic, auditable priority assessment.
- **Engine (`priority-v1`):** Mathematical re-normalization across available factors (Reported Severity, Affected Households, Infrastructure Deficit, Vulnerability Evidence, Geographic Evidence Coverage).
- **Non-Generative Invariant:** Gemini never computes mathematical scores.
- **Endpoints:** `POST /api/requests/{reference_id}/priority`, `GET /api/requests/{reference_id}/priority`.

### Stage 3F: Demand Aggregation and Hotspots
- **Objective:** Aggregate actual stored citizen requests into geographic demand clusters without synthetic data or arbitrary ML clustering.
- **Engine (`hotspot-v1`):** Groups by (State, District, Locality, Category) with factor metrics (request count, households, high severity count, evidence coverage, category concentration).
- **Endpoints:** `GET /api/hotspots`, `GET /api/hotspots/{hotspot_id}`, `GET /api/analytics/overview`.

### Stage 3G: Decision-Support Dashboard
- **Objective:** Production-ready decision-support dashboard connected to real backend APIs.
- **Institutional Design:** Deep navy, slate, institutional green, neutral surfaces. Zero purple gradients, zero emojis, zero fake heatmaps.
- **Sections:** Overview KPIs, Demand by Category, Geographic Demand, Evidence Coverage, Severity Distribution, Hotspot Clusters, Dataset Inventory.

### Stage 3H: Request Analytics
- **Objective:** Reusable analytics APIs based strictly on verified stored requests.
- **Endpoints:** `GET /api/analytics/categories`, `/geography`, `/timeline`, `/evidence-coverage`, `/severity`.
- **Validation:** Date range parsing, filter sanitization, honest null/zero representation.

### Stage 3I: Multilingual + Voice
- **Objective:** Intake support for English, Hindi (`hi`), and Gujarati (`gu`) while preserving original citizen input text.
- **Voice Transcription:** `POST /api/voice/transcribe` with security validation and honest 503 fallback if unconfigured. Zero fake transcripts.

### Stage 3J: Security and Production Hardening
- **Security Controls:**
  - `SecurityHeadersMiddleware`: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`.
  - `RateLimitMiddleware`: 60 requests/minute on compute-heavy routes.
  - Explicit CORS allowlist (`FRONTEND_ORIGIN`).
  - Global sanitized error handlers preventing stack trace and credential leakages.
  - SQL injection and path traversal resistance.
  - Zero secrets in repository; `.env.example` audited.

---

## Verification and Test Quality Matrix

The platform includes a 100% deterministic Pytest test suite covering all modules (130/130 passing tests):

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
| `tests/test_multi_dataset.py` | Multi-sector public datasets (JJM, NHM, SBM, PMGSY) | PASSED |
| `tests/test_prioritization.py` | Stage 3E priority-v1 deterministic mathematical evaluation | PASSED |
| `tests/test_hotspots.py` | Stage 3F hotspot-v1 deterministic demand clusters | PASSED |
| `tests/test_analytics.py` | Stage 3H category, geo, timeline, evidence analytics | PASSED |
| `tests/test_multilingual.py` | Stage 3I multilingual intake & voice transcription | PASSED |
| `tests/test_security.py` | Stage 3J security middleware, rate limit, CORS, sanitization | PASSED |
