# NagrikLens AI Project Plan

## Phase 2 Continuation

| Step | Scope | Status |
| --- | --- | --- |
| 3C-2C | Hybrid metadata + FAISS retrieval, provenance, deterministic ranking, API | LOCKED |
| 3C-3 | Citizen request extraction, query building, hybrid retrieval, evidence links/status | LOCKED |
| 3C-4 | Evidence context, guarded Gemini analysis, structured validation, persistence/API | LOCKED |

## System Flow

```text
Citizen Request -> Extraction -> Retrieval Query -> Hybrid Retrieval -> Evidence
Citizen Request + Evidence -> RAG Context -> Gemini -> Grounded Analysis
```

Retrieval finds and returns evidence. RAG generates analysis from only the request and that evidence. The request remains `RECEIVED` independently of AI processing.

## Boundaries and Limitations

- This is a decision-support prototype, not an official government portal or government decision system.
- Public dataset coverage is limited; locality-level and current evidence may be unavailable.
- FAISS is a local prototype index, and similarity scores are not confidence estimates.
- Retrieved evidence does not prove complete real-world conditions; RAG cannot compensate for missing evidence.
- The new request flow does not implement prioritisation, hotspot detection, scheme matching, recommendations, or government decision automation.
- Pre-existing reports and priority modules are separate from these locked request/retrieval/analysis steps.

No work beyond Step 3C-4 is included in this continuation.