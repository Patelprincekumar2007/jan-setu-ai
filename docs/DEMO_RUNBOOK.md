# NagrikLens AI: Hackathon Demonstration Runbook

## 1. Demo Objective
Demonstrate the end-to-end civic intelligence pipeline of NagrikLens AI in a deterministic, auditable 3 to 5 minute walkthrough:
1. Citizen Grievance Intake in regional language (Gujarati / English).
2. Automated Entity Structuring and Geocoding.
3. Vector and Metadata Evidence Retrieval against official open government data (`ds-jjm-water-coverage-2024`).
4. Evidence-Grounded Analysis with explicit provenance and gap declaration.
5. Deterministic Priority Assessment (Methodology: `priority-v1`).
6. Executive Decision Dashboard and Dataset Ingestion Verification.

---

## 2. Demo Scenario
- **Category:** Water
- **State:** Gujarat
- **District:** Rajkot
- **Locality:** Rajkot Rural (Ward 4)
- **Affected Households:** 85
- **Dataset Targeted:** `ds-jjm-water-coverage-2024` (Jal Jeevan Mission Rural Household Tap Water Coverage)

---

## 3. Exact Input Data

### Gujarati Citizen Request (Primary Demonstration)
```text
અમારા ગામમાં પીવાના પાણીની સુવિધા અનિયમિત છે. સ્થાનિક પાણી પુરવઠો અપૂરતો છે અને ઘણા પરિવારોને પીવાનું શુદ્ધ પાણી મેળવવામાં મુશ્કેલી પડી રહી છે.
```

### English Citizen Request (Alternative)
```text
Our village has unreliable drinking water access. The local water supply is insufficient and several households are struggling to get dependable clean drinking water.
```

### Form Parameters
- **Category:** Water
- **State:** Gujarat
- **District:** Rajkot
- **Ward / Locality:** Rajkot Rural
- **Households Affected:** 85

---

## 4. Exact Navigation Sequence and Timing (Total: 3 to 5 Minutes)

| Step | View / Route | Key Action | Target Duration |
| :--- | :--- | :--- | :--- |
| **1. Overview** | `/` or `/dashboard` | Introduce platform tagline and core mission | 30 seconds |
| **2. Intake** | `/submit` | Paste citizen request in Gujarati, select Gujarat/Rajkot/Water/85 households, click Submit | 45 seconds |
| **3. Tracking** | `/track` | View newly generated Reference ID (`NL-...`) with status `RECEIVED` | 30 seconds |
| **4. Evidence** | `/track` or Evidence tab | Inspect retrieved record from Jal Jeevan Mission (`OGD-JJM-2024-GJ-02`) | 45 seconds |
| **5. Analysis** | `/track` (Generate Analysis) | Review structured observations, evidence citations, and declared evidence gaps | 45 seconds |
| **6. Priority** | `/track` (Calculate Priority) | Inspect deterministic tripartite score breakdown (Score: ~47.15 / Moderate Band) | 30 seconds |
| **7. Analytics** | `/dashboard` | Show live update to category demand, geographic counts, and coverage ratios | 30 seconds |
| **8. Datasets** | `/datasets` | Show public dataset provenance, license, record counts, and quality metrics | 30 seconds |

---

## 5. Expected Application States

1. **Intake Stage (`/submit`):**
   - Form accepts regional Gujarati text without overwriting or translating away the citizen's original prose.
   - Status badge displays `Embedding Retrieval Ready` and `AI classification available`.

2. **Submission Response:**
   - Returns HTTP 201 with JSON payload containing:
     - `reference_id`: Unique tracking string (e.g. `NL-20260930-C69101`)
     - `status`: `RECEIVED`
     - `message`: `Citizen request submitted and processed successfully.`

3. **Tracking Stage (`/track`):**
   - Displays original request narrative in Gujarati verbatim.
   - Location: Gujarat / Rajkot / Rajkot Rural.
   - Category: Water.
   - Affected Households: 85.
   - Evidence Count: 1.

---

## 6. Expected Evidence Retrieval

When inspecting the retrieved evidence for the Rajkot Water request:

- **Dataset Identifier:** `ds-jjm-water-coverage-2024`
- **Dataset Title:** District-wise Rural Household Tap Water Coverage
- **State:** Gujarat
- **District:** Rajkot
- **Metric Name:** Rural Household Tap Water Coverage (%)
- **Metric Value:** 98.5%
- **Unit:** %
- **Year:** 2024
- **Source Reference:** `OGD-JJM-2024-GJ-02`
- **Publisher:** Ministry of Jal Shakti / Open Government Data Platform India
- **Source URL:** https://jaljeevanmission.gov.in / https://data.gov.in

---

## 7. Expected Priority Behavior

- **Methodology Version:** `priority-v1`
- **Calculation Mechanism:** Deterministic weighted formula (Gemini does not assign numerical priority scores).
- **Formula Weights:**
  - Reported Severity: 30%
  - Affected Households: 25% (85 households evaluated against log scale)
  - Infrastructure Deficit: 25% (98.5% tap coverage leaves 1.5% deficit gap)
  - Vulnerability Evidence: 10%
  - Geographic Evidence Coverage: 10%
- **Expected Outcome:**
  - Overall Priority: ~47.15 / 100
  - Priority Band: `MODERATE`
  - All factor contributions and limitations are explicitly articulated.

---

## 8. Expected Fallback Behavior if Gemini is Unavailable

If the external Gemini AI service is unreachable, rate limited, or returns an error:
1. The request submission and SQLite storage still succeed completely.
2. Evidence retrieval via FAISS and SQL metadata filtering continues uninterrupted.
3. Analysis endpoint returns HTTP 200 with `status: "FAILED"`.
4. The UI displays an honest message: `Analysis could not be generated at this time. AI analysis service was temporarily unavailable.`
5. All retrieved public evidence records (`OGD-JJM-2024-GJ-02`) remain fully accessible in the evidence drawer.
6. Deterministic priority assessment continues to calculate accurately using stored open data.

---

## 9. Expected Evidence-Gap Behavior

NagrikLens AI strictly enforces transparency regarding what public data proves vs. what it does not:
- **Corroborated:** The administrative baseline for Rajkot district tap water coverage is 98.5% under Jal Jeevan Mission.
- **Declared Gap:** District-level open datasets do not provide real-time village pipe pressure telemetry.
- **Result:** The system declares that ground-level pipeline maintenance logs require municipal engineer verification.

---

## 10. What Must NOT Be Claimed During the Demo

- Do NOT claim that NagrikLens AI is an official government portal or deployed by the Government of India.
- Do NOT claim "zero hallucinations" (use "Evidence-Grounded Generation").
- Do NOT claim that AI autonomously dispatches repair crews or allocates municipal budgets.
- Do NOT claim unverified real-time sensor integration when data originates from ministerial gazettes.
- Do NOT invent fake SLA resolution times (such as "48h guaranteed repair").

---

## 11. Backup Path if External AI Service is Unavailable

If live network access to generative models is interrupted during the presentation:
1. Point out the deterministic FAISS vector retrieval and SQL grounding, which run completely locally.
2. Highlight that the priority score is calculated through deterministic mathematics rather than black-box LLM output.
3. Review the raw public dataset records and quality report on the `/datasets` inspection page.

---

## 12. Production Deployment URLs

- **Live Frontend:** https://nagriklens-frontend.onrender.com
- **Live Backend:** https://nagriklens-backend.onrender.com
- **API Documentation (Swagger):** https://nagriklens-backend.onrender.com/docs
- **Health Check:** https://nagriklens-backend.onrender.com/api/health

---

## 13. Presentation Script Summary

1. **Introduction (0:00 to 0:30):**
   "NagrikLens AI connects citizen development grievances with verified public open data to support evidence-grounded municipal decision making."
2. **Submission (0:30 to 1:15):**
   "A citizen files an observation in Gujarati regarding water supply irregularity in Rajkot district for 85 households."
3. **Retrieval and Grounding (1:15 to 2:30):**
   "Our pipeline matches the complaint against official Jal Jeevan Mission records, showing 98.5% baseline coverage and flagging localized infrastructure pressure gaps."
4. **Prioritisation and Decision Support (2:30 to 3:30):**
   "Using an auditable tripartite mathematical model, NagrikLens computes a moderate priority score (47/100) based on verified household impact and infrastructure baseline."
5. **Dashboard and Provenance (3:30 to 4:30):**
   "District officers view aggregated demand trends and inspect raw dataset provenance with full cryptographic transparency."
