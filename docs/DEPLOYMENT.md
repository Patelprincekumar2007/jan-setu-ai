# NagrikLens AI: Production Deployment and Cloud Readiness Specification

> **Phase Status:** Phase 3K Preparation (Deployment Preparation Only)  
> **Actual Deployment:** Scheduled for Phase 3N  
> **Scope:** Decision-support prototype for public administration. Not an official government deployment.

---

## 1. Executive Summary

This document specifies the deployment architecture, container configuration, environment variables, security controls, and operational readiness for deploying **NagrikLens AI** to Google Cloud Platform (GCP).

---

## 2. Local Development Execution

### 2.1 Backend Local Execution
```bash
# Navigate to backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run FastAPI backend via Uvicorn
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2.2 Frontend Local Execution
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 3. Production Build and Packaging

### 3.1 Backend Packaging
The backend is packaged as a lightweight Linux container based on `python:3.11-slim`:
- Non-root user execution (`appuser:appuser`) for security compliance.
- Dynamic `PORT` binding (defaults to `8080` on Cloud Run).
- Health check configured to query `/health`.

```bash
# Build backend container locally (requires Docker daemon)
docker build -t nagriklens-backend -f backend/Dockerfile .

# Run backend container locally
docker run -p 8080:8080 -e PORT=8080 nagriklens-backend
```

### 3.2 Frontend Packaging
The frontend uses a multi-stage Docker build:
1. **Build Stage:** `node:20-alpine` runs `npm ci` and `npm run build`.
2. **Serving Stage:** `nginx:alpine` serves static assets with SPA route fallback and security headers.

```bash
# Build frontend container locally (requires Docker daemon)
docker build -t nagriklens-frontend \
  --build-arg VITE_API_BASE_URL=http://localhost:8000 \
  -f frontend/Dockerfile .

# Run frontend container locally
docker run -p 3000:80 nagriklens-frontend
```

---

## 4. Environment Variables Reference

| Variable | Scope | Type | Default | Required in Production | Description |
|---|---|---|---|---|---|
| `ENVIRONMENT` | Backend | String | `production` | Yes | Controls environment mode and CORS policies. |
| `HOST` | Backend | String | `0.0.0.0` | Yes | Network interface to bind. |
| `PORT` | Backend | Integer | `8080` | Yes | Listening port assigned by Google Cloud Run. |
| `LOG_LEVEL` | Backend | String | `INFO` | No | Logging verbosity (`DEBUG`, `INFO`, `WARNING`, `ERROR`). |
| `FRONTEND_URL` | Backend | String | `http://localhost:5173` | Yes | Allowed origin for CORS validation. |
| `DATABASE_URL` | Backend | String | `sqlite:///./nagriklens.db` | Yes | SQLAlchemy database connection URI. |
| `GEMINI_API_KEY` | Backend | String | `""` | Optional | Google Gemini API key. System degrades safely if unset. |
| `GEMINI_MODEL` | Backend | String | `gemini-2.5-flash` | No | Gemini model variant for RAG and extraction. |
| `EMBEDDING_MODEL` | Backend | String | `sentence-transformers/...` | No | Multilingual sentence transformer model name. |
| `VECTOR_DIR` | Backend | String | `./data/vector` | No | Path to FAISS vector index and metadata artifacts. |
| `VITE_API_BASE_URL` | Frontend | String | `""` | Yes (at build) | Base URL of deployed backend service. |

---

## 5. Google Cloud Readiness (Phase 3K)

### 5.1 Cloud Run Architecture
- **Backend Service:** Stateless container instance running FastAPI with Uvicorn.
- **Frontend Service:** Static web server container or Firebase/Cloud Storage hosting.
- **Auto-scaling:** Min instances = 0 (scale to zero for cost optimization), Max instances = 10.

### 5.2 Required GCP APIs (for Phase 3N Deployment)
To deploy in Phase 3N, the following Google Cloud APIs must be enabled on the target project:
1. `run.googleapis.com` (Cloud Run Admin API)
2. `cloudbuild.googleapis.com` (Cloud Build API)
3. `artifactregistry.googleapis.com` (Artifact Registry API)
4. `secretmanager.googleapis.com` (Secret Manager API for `GEMINI_API_KEY`)

### 5.3 Secret Handling Protocol
- Secrets (`GEMINI_API_KEY`) must never be baked into container images or checked into source control.
- In Phase 3N, secrets will be injected at runtime using Google Cloud Secret Manager or Cloud Run environment variables.

---

## 6. Health Checks and Operational Monitoring

The backend exposes dual lightweight health check endpoints:
- `GET /health` (standard root probe for GCP Load Balancers and Cloud Run)
- `GET /api/v1/health` (versioned alias for API client checks)

Both endpoints execute instantly in memory without querying external AI APIs or triggering vector rebuilds:
```json
{
  "status": "ok",
  "service": "nagriklens-ai-api",
  "environment": "production"
}
```

---

## 7. Known Prototype Limitations

1. **SQLite Ephemeral Storage on Cloud Run:**  
   In this hackathon prototype, SQLite (`nagriklens.db`) is stored in the local container filesystem. Cloud Run container filesystems are ephemeral; data resets across container restarts or new revisions. For long-term production persistence, migration to Google Cloud SQL (PostgreSQL) is the recommended path for future phases.
2. **FAISS Local Vector Artifacts:**  
   FAISS vector index files (`knowledge.index` and `knowledge_metadata.json`) are bundled inside the container image under `./data/vector`. Re-indexing in production requires rebuilding the vector index artifact or deploying updated container revisions.
3. **Single-Instance Prototype Scope:**  
   Deterministic priority calculations and hotspot grouping operate over the local database instance.
