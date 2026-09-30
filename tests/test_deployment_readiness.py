import os
import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.config import Settings
from backend.public_data.loaders import (
    JJMWaterCoverageLoader,
    NHMHealthInfrastructureLoader,
    SBMSanitationCoverageLoader,
    PMGSYRoadConnectivityLoader,
)
from backend.knowledge.vector_index import get_index_file_paths

client = TestClient(app)


def test_health_endpoints():
    """Verify both /health and /api/v1/health return lightweight 200 responses."""
    # 1. Root health check probe
    res1 = client.get("/health")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "ok"
    assert data1["service"] == "nagriklens-ai-api"

    # 2. Versioned health check probe
    res2 = client.get("/api/v1/health")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "ok"
    assert data2["service"] == "nagriklens-ai-api"


def test_settings_configuration():
    """Verify Settings object parses environment variables cleanly."""
    settings = Settings()
    assert settings.service_name == "nagriklens-ai-api"
    assert isinstance(settings.port, int)
    assert settings.database_url.startswith("sqlite")
    assert "MiniLM" in settings.embedding_model


def test_security_headers_present():
    """Verify security headers are applied to API responses."""
    res = client.get("/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


def test_cors_preflight_handling():
    """Verify CORS preflight OPTIONS request returns configured allow headers."""
    res = client.options(
        "/api/requests",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert res.status_code == 200
    assert "access-control-allow-origin" in res.headers


def test_public_data_loaders_relative_paths():
    """Verify all 4 dataset loaders locate raw files using project-relative paths."""
    loaders = [
        JJMWaterCoverageLoader(),
        NHMHealthInfrastructureLoader(),
        SBMSanitationCoverageLoader(),
        PMGSYRoadConnectivityLoader(),
    ]
    for loader in loaders:
        assert loader.csv_path.exists(), f"Missing CSV for {loader.__class__.__name__} at {loader.csv_path}"
        assert loader.meta_path.exists(), f"Missing meta for {loader.__class__.__name__} at {loader.meta_path}"
        dataset, records = loader.load()
        assert dataset is not None
        assert len(records) > 0


def test_faiss_vector_index_artifacts_exist():
    """Verify FAISS vector index files are available in data/vector."""
    index_path, meta_path = get_index_file_paths()
    assert index_path.exists(), f"Missing FAISS index at {index_path}"
    assert meta_path.exists(), f"Missing FAISS metadata at {meta_path}"

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta.get("dimension") == 384
    assert meta.get("evidence_count") > 0


def test_deployment_configuration_files_exist():
    """Verify all Phase 3K deployment preparation files exist with valid content."""
    repo_root = Path(__file__).resolve().parent.parent

    expected_files = [
        repo_root / "backend" / "Dockerfile",
        repo_root / "backend" / ".dockerignore",
        repo_root / "backend" / ".env.example",
        repo_root / "frontend" / "Dockerfile",
        repo_root / "frontend" / "nginx.conf",
        repo_root / "frontend" / ".dockerignore",
        repo_root / "frontend" / ".env.example",
        repo_root / "docker-compose.yml",
        repo_root / "cloudbuild.yaml",
        repo_root / "docs" / "DEPLOYMENT.md",
    ]

    for file_path in expected_files:
        assert file_path.exists(), f"Missing required deployment file: {file_path}"
        content = file_path.read_text(encoding="utf-8")
        assert len(content.strip()) > 0, f"File {file_path} is empty"


def test_sanitized_error_handling_no_leaks():
    """Verify error responses do not leak stack traces or secret details."""
    res = client.get("/api/requests/NON-EXISTENT-REF-999999")
    assert res.status_code == 404
    data = res.json()
    assert "detail" in data
    # Ensure no python traceback keywords in user-facing message
    assert "Traceback" not in data["detail"]
    assert "File \"" not in data["detail"]
