# NagrikLens AI - Evidence-Based Prioritisation Engine (Stage 3E)

## 1. Executive Summary

NagrikLens AI prioritises citizen requests through a transparent, deterministic mathematical engine (`priority-v1`). The priority score is **strictly non-generative**: Google Gemini AI is never permitted to determine numerical scores or factor contributions.

The assessment produces a decision-support heuristic normalized between 0.0 and 100.0, accompanied by factual provenance and methodological limitations.

---

## 2. Priority Factors and Mathematical Formulation

The engine evaluates exactly five conceptual factors:

| Factor | Description | Base Weight | Range | Source |
| :--- | :--- | :--- | :--- | :--- |
| **Reported Severity** | Urgency extracted from citizen intake | 30% | 0 to 100 | Citizen Request / Structured Intake |
| **Affected Households** | Estimated population impact | 25% | 0 to 100 | Citizen-reported household count |
| **Infrastructure Deficit** | Verifiable public service coverage gap | 25% | 0 to 100 | Open Government Datasets (e.g. JJM, PMGSY) |
| **Vulnerability Evidence** | Published socioeconomic vulnerability indicators | 10% | 0 to 100 | Official public indices (if available) |
| **Geographic Evidence Coverage** | Degree of public baseline verification in location | 10% | 0 to 100 | Knowledge Retrieval Engine |

---

## 3. Weight Re-Normalization Across Available Factors

When an underlying indicator is missing (e.g., when no vulnerability index exists or household count was omitted), **NagrikLens AI never substitutes zero or fabricates estimates**.

Instead, the factor is marked `available: false` and its weight is removed from the denominator. The score is re-normalized dynamically across only the available factors:

$$\text{Overall Priority} = \frac{\sum_{i \in \text{Available}} (\text{Normalized Value}_i \times \text{Weight}_i)}{\sum_{i \in \text{Available}} \text{Weight}_i}$$

Factor contributions are calculated proportionally so that:

$$\sum_{i \in \text{Available}} \text{Contribution}_i = \text{Overall Priority}$$

---

## 4. Decision-Support Bands

The numerical score is categorized into standard decision-support bands:

- **0.0 to 24.9:** LOW
- **25.0 to 49.9:** MODERATE
- **50.0 to 74.9:** HIGH
- **75.0 to 100.0:** VERY HIGH

> **Important Notice:** Decision-support bands represent heuristic triaging guidance for municipal analysts. They do not constitute official government ratings, statutory allocations, or algorithmic determinations.

---

## 5. Persistence and Idempotency

- Assessments are generated on demand via `POST /api/requests/{reference_id}/priority`.
- Read operations via `GET /api/requests/{reference_id}/priority` retrieve persisted records without regenerating or triggering mutations.
- Repeated executions update existing records idempotently without duplicate row accumulation.
