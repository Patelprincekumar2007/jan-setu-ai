import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database import init_db, SessionLocal
from backend.routes.requests import router as requests_router
from backend.public_data.routes import router as public_data_router
from backend.public_data.service import PublicDataService
from backend.knowledge.routes import router as knowledge_router
from backend.knowledge.service import KnowledgeService
from backend.rag.routes import router as rag_router

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.environment == "development" else [settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(requests_router)
app.include_router(public_data_router)
app.include_router(knowledge_router)
app.include_router(rag_router)


@app.get("/health")
def get_health():
    """Basic health check endpoint for monitoring service readiness."""
    return {
        "status": "ok",
        "service": settings.service_name,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
