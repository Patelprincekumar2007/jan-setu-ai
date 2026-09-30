# ==============================================================================
# NagrikLens AI: Backend Production Dockerfile (Phase 3K)
# ==============================================================================
# Linux-compatible, Python 3.11 slim container optimized for Google Cloud Run
# ==============================================================================

FROM python:3.11-slim

# Security & runtime environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    HOST=0.0.0.0 \
    ENVIRONMENT=production \
    PYTHONPATH=/app

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies deterministically
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application code and verified public data artifacts
COPY backend /app/backend
COPY data /app/data

# Non-root user for security hardening
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Health check configuration (probes lightweight /health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE 8080

# Execute FastAPI via Uvicorn with dynamic Cloud Run PORT binding
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
