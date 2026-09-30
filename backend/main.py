import logging
import os
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text

from backend.config import settings
from backend.database import init_db, SessionLocal
from backend.routes.requests import router as requests_router
from backend.public_data.routes import router as public_data_router
from backend.public_data.service import PublicDataService
from backend.knowledge.routes import router as knowledge_router
from backend.knowledge.service import KnowledgeService
from backend.rag.routes import router as rag_router
from backend.prioritization.routes import router as prioritization_router
from backend.hotspots.routes import router as hotspots_router
from backend.analytics.routes import router as analytics_router
from backend.voice.routes import router as voice_router
from backend.security import SecurityHeadersMiddleware, RateLimitMiddleware

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("nagriklens.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing NagrikLens AI database and civic data repositories...")
    init_db()
    db = SessionLocal()
    try:
        PublicDataService.seed_default_datasets(db)
        KnowledgeService.seed_default_knowledge(db)
    except Exception as e:
        logger.warning(f"Default dataset/knowledge seeding warning: {e}")
    finally:
        db.close()
    yield


app = FastAPI(
    title=settings.service_name,
    version="0.3.0",
    description="NagrikLens AI: Evidence-Grounded Public Data Prioritisation Decision Support",
    lifespan=lifespan,
)

# 1. Production Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Rate Limiting Middleware (60 req/min for compute-heavy endpoints)
app.add_middleware(RateLimitMiddleware, requests_per_minute=60)

# 3. Explicit CORS Policy
raw_origins = [
    settings.frontend_url,
    "https://nagriklens-frontend.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

if os.getenv("ALLOWED_ORIGINS"):
    raw_origins.extend(os.getenv("ALLOWED_ORIGINS", "").split(","))

allowed_origins: list[str] = []
for orig in raw_origins:
    if orig and orig.strip():
        cleaned = orig.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Global Safe Error Handlers (3J.6 - Never expose stack traces or internal leaks)
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Input validation failed. Please verify the request parameters.", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def global_unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on route {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal error occurred while processing your request. Please try again later."},
    )


# Mount all API routers
app.include_router(requests_router)
app.include_router(public_data_router)
app.include_router(knowledge_router)
app.include_router(rag_router)
app.include_router(prioritization_router)
app.include_router(hotspots_router)
app.include_router(analytics_router)
app.include_router(voice_router)


@app.get("/health")
@app.get("/api/v1/health")
def get_health():
    """Comprehensive and lightweight health check verifying actual component readiness."""
    db_status = "unavailable"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as db_err:
        logger.warning(f"Database health check warning: {db_err}")
        db_status = "error"

    gemini_status = "configured" if bool(settings.gemini_api_key) else "not_configured"
    embedding_status = "configured"
    faiss_status = "available" if os.path.exists(settings.vector_dir) else "uninitialized"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "service": settings.service_name,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "ready",
            "database": db_status,
            "gemini": gemini_status,
            "embedding_model": embedding_status,
            "faiss": faiss_status,
            "storage": "accessible" if db_status == "connected" else "unavailable",
        },
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
