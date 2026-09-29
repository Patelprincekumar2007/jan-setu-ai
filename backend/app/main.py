import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.routers import (
    health,
    auth,
    reports,
    evidence,
    datasets,
    analytics,
    priority,
    notifications,
    admin,
    knowledge,
    requests,
)
from app.seed import seed_database

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Auditable, evidence-grounded civic intelligence platform converting citizen complaints into transparent priority signals.",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup
origins = [
    settings.FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure upload directory exists
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")

# Include Routers with API V1 prefix
app.include_router(health.router, prefix=settings.API_V1_STR)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(evidence.router, prefix=settings.API_V1_STR)
app.include_router(datasets.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(priority.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(knowledge.router)
app.include_router(requests.router)

@app.on_event("startup")
def on_startup():
    print("Initializing NagrikLens AI Backend...")
    try:
        seed_database()
    except Exception as e:
        print(f"Seed database warning: {e}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

@app.get("/")
def root():
    return {
        "message": "Welcome to NagrikLens AI API",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
