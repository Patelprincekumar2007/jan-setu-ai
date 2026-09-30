# NagrikLens AI - Demand Aggregation & Analytics Architecture (Stages 3F & 3H)

## 1. Overview

NagrikLens AI provides real-time demand aggregation and civic analytics derived solely from verified stored database records. 

### Core Architectural Principles
1. **Zero Fabricated Demand:** Demand aggregates are formed only from actual citizen submissions. Public dataset deficits do not artificially generate citizen requests.
2. **Deterministic Clustering (`hotspot-v1`):** Demand clusters are grouped deterministically by (State, District, Locality, Category). No arbitrary ML clustering is applied.
3. **Honest Empty States:** When zero requests or records exist for a metric or filter, the system returns `0` or `null`.

---

## 2. API Reference

### 2.1 Overview Metrics
- `GET /api/analytics/overview`
  - Returns total requests, requests with linked evidence, requests without evidence, priority assessments generated, hotspot groups count, verified datasets count, and evidence records count.

### 2.2 Category Demand
- `GET /api/analytics/categories`
  - Parameters: `start_date`, `end_date`, `state`, `district`.
  - Returns request counts, aggregate households, and proportional share per category.

### 2.3 Geographic Demand
- `GET /api/analytics/geography`
  - Parameters: `start_date`, `end_date`, `category`.
  - Returns request counts and affected households per administrative level (State, District, Locality).

### 2.4 Evidence Coverage
- `GET /api/analytics/evidence-coverage`
  - Parameters: `category`, `district`.
  - Returns verifiable coverage percentage of citizen submissions corroborated by open datasets.

### 2.5 Severity Distribution
- `GET /api/analytics/severity`
  - Parameters: `category`, `district`.
  - Returns breakdown of requests across LOW, MEDIUM, HIGH, CRITICAL, and UNSPECIFIED urgency tiers.

### 2.6 Demand Hotspots (`hotspot-v1`)
- `GET /api/hotspots`
  - Parameters: `state`, `district`, `locality`, `category`.
- `GET /api/hotspots/{hotspot_id}`
  - Returns individual cluster factor metrics, severity distributions, and methodological limitations.
