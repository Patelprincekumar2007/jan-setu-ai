import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    service_name: str = "nagriklens-ai-api"
    environment: str = os.getenv("ENVIRONMENT", "development")
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", 8000))
    frontend_url: str = os.getenv("FRONTEND_URL", "https://nagriklens-frontend.onrender.com")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./nagriklens.db")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    vector_dir: str = os.getenv("VECTOR_DIR", "./data/vector")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
