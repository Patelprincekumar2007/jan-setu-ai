# NagrikLens AI: Verified Public Civic Datasets Catalog

This document provides complete documentation of verified open government datasets ingested, normalized, and indexed within NagrikLens AI for institutional decision support.

All public datasets are governed by absolute data integrity principles:
1. Grounded in authoritative official portals (data.gov.in / ministerial baselines).
2. Immutable raw storage with SHA-256 metadata tracking.
3. Deterministic normalization with strict numeric and geographic validators.
4. Preserved missing values (never converted to zero or interpolated).
5. Direct row-level provenance and deterministic knowledge evidence generation.
6. Open government licensing (Government Open Data License - India / GODL).

---

## 1. Verified Datasets Overview

| Sector | Dataset ID | Dataset Title | Publisher / Source | Scope & Level | Year | Verified Records |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Water** | `ds-jjm-water-coverage-2024` | District-wise Rural Household Tap Water Coverage | Ministry of Jal Shakti / JJM | National (District) | 2024 | 25 |
| **Healthcare** | `ds-nhm-health-facilities-2024` | District-wise Primary Healthcare Infrastructure & PHC Readiness | Ministry of Health and Family Welfare / RHS | National (District) | 2024 | 25 |
| **Sanitation** | `ds-sbm-sanitation-coverage-2024` | District-wise Solid & Liquid Waste Management (ODF Plus) Coverage | Ministry of Jal Shakti / SBM-G | National (District) | 2024 | 25 |
| **Roads** | `ds-pmgsy-road-connectivity-2024` | District-wise Rural Habitation Road Connectivity Coverage | Ministry of Rural Development / PMGSY OMMAS | National (District) | 2024 | 25 |

---

## 2. Dataset Specific Profiles

### A. Water Sector: Jal Jeevan Mission (JJM) Baseline
- **Dataset ID:** `ds-jjm-water-coverage-2024`
- **Title:** District-wise Rural Household Tap Water Coverage (JJM Baseline)
- **Official Source URL:** `https://data.gov.in/resource/district-wise-rural-drinking-water-supply-and-tap-connections`
- **Publisher:** Department of Drinking Water and Sanitation, Ministry of Jal Shakti, Government of India
- **License:** Government Open Data License - India (GODL)
- **Geographic Granularity:** District level across multiple states (e.g. Maharashtra, Bihar, Gujarat, Karnataka, Odisha)
- **Primary Metric:** `Rural Household Tap Water Coverage (%)`
- **Representative Provenance Reference:** `OGD-JJM-2024-MH-01` (Dharashiv, Maharashtra: 50.76%)
- **Normalization Rules:**
  - Geographic names standardized (whitespace trim, Title Case).
  - Percentages parsed to float (`50.76%` -> `50.76`), validated in range [0.0, 100.0].
  - Missing coverage preserved as `null`.

### B. Healthcare Sector: Rural Health Statistics (RHS / NHM)
- **Dataset ID:** `ds-nhm-health-facilities-2024`
- **Title:** District-wise Primary Healthcare Infrastructure & Functional PHC Availability
- **Official Source URL:** `https://data.gov.in/resource/rural-health-statistics-district-wise-health-infrastructure`
- **Publisher:** Ministry of Health and Family Welfare (MoHFW), Government of India
- **License:** Government Open Data License - India (GODL)
- **Geographic Granularity:** District level across states
- **Primary Metric:** `Functional PHC Readiness Index (%)`
- **Representative Provenance Reference:** `OGD-MoHFW-RHS-2024-MH-01` (Dharashiv, Maharashtra: 48.20%)
- **Normalization Rules:**
  - Facility operational readiness normalized as percentage float.
  - Zero synthetic inflation; unrecorded facilities left null.

### C. Sanitation Sector: Swachh Bharat Mission Gramin (SBM-G Phase II)
- **Dataset ID:** `ds-sbm-sanitation-coverage-2024`
- **Title:** District-wise Solid & Liquid Waste Management and ODF Plus Coverage
- **Official Source URL:** `https://data.gov.in/resource/swachh-bharat-mission-gramin-district-wise-odf-plus-progress`
- **Publisher:** Department of Drinking Water and Sanitation, Ministry of Jal Shakti, Government of India
- **License:** Government Open Data License - India (GODL)
- **Geographic Granularity:** District level across states
- **Primary Metric:** `ODF Plus Model Village Coverage (%)`
- **Representative Provenance Reference:** `OGD-SBMG-2024-MH-01` (Dharashiv, Maharashtra: 42.10%)
- **Normalization Rules:**
  - ODF Plus verification ratios parsed to float percentages.
  - Distinct tracking of solid/liquid waste management parameters.

### D. Roads / Connectivity Sector: Pradhan Mantri Gram Sadak Yojana (PMGSY)
- **Dataset ID:** `ds-pmgsy-road-connectivity-2024`
- **Title:** District-wise Rural Habitation All-Weather Road Connectivity Coverage
- **Official Source URL:** `https://data.gov.in/resource/pmgsy-district-wise-habitation-connectivity-status`
- **Publisher:** National Rural Infrastructure Development Agency (NRIDA), Ministry of Rural Development, Government of India
- **License:** Government Open Data License - India (GODL)
- **Geographic Granularity:** District level across states
- **Primary Metric:** `Connected Eligible Habitations (%)`
- **Representative Provenance Reference:** `OGD-PMGSY-2024-MH-01` (Dharashiv, Maharashtra: 58.40%)
- **Normalization Rules:**
  - Connectivity percentage computed over eligible PMGSY habitation baselines.
  - Unconnected habitations and non-PMGSY tracks preserved in original form.

---

## 3. Rejected Dataset Candidates & Exclusions

During dataset discovery and audit, candidate datasets were vetted against strict hackathon integrity guidelines. The following candidate types were rejected:

| Candidate Category | Reason for Rejection | Action Taken |
| :--- | :--- | :--- |
| **Kaggle Synthetic Datasets** | Unofficial provenance; synthetic demographic extrapolations without official ministry backing. | Rejected; replaced with official data.gov.in ministerial baselines. |
| **Unofficial Web Scrapings** | Inconsistent update frequencies and lack of identifiable open data license (GODL). | Excluded to maintain complete institutional defensibility. |
| **State-Level Only Aggregates** | Insufficient district granularity for localized citizen request grounding. | Excluded until official district-level breakdowns are published. |
| **Aggregator Blogs & Wikipedia Tables** | Secondary derivative sources lacking verifiable raw source URLs and data dictionaries. | Excluded; direct ministerial open portals used exclusively. |

---

## 4. Reusable Ingestion Architecture

Every dataset passes through a uniform deterministic lifecycle:

```
RAW CSV & METADATA
       |
       v
LOADER (Validation of headers & schema)
       |
       v
NORMALIZER (Unicode, geographic casing, float percentages, null preservation)
       |
       v
SQLITE REPOSITORY (Idempotent transactional storage in public_data_records)
       |
       v
KNOWLEDGE EVIDENCE BUILDER (Deterministic factual grounding text)
       |
       v
FAISS VECTOR INDEX (paraphrase-multilingual-MiniLM-L12-v2, 384d Cosine similarity)
       |
       v
HYBRID RETRIEVAL & RAG (Grounding evidence for citizen request analysis)
```

- **Idempotency Guarantee:** Ingesting a dataset multiple times replaces only that dataset's records in SQLite within a single transaction, preventing duplication.
- **Evidence Formatting:** Text templates are strictly deterministic and factual without interpretive bias.
