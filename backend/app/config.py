import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file if available
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "NagrikLens AI - Civic Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nagriklens.db")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "nagriklens-ai-hackathon-secret-key-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "./data/faiss/index.bin")
    DATASET_PATH: str = os.getenv("DATASET_PATH", "./data/datasets")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./data/uploads")

    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Multilingual embedding model
    EMBEDDING_MODEL_NAME: str = "paraphrase-multilingual-MiniLM-L12-v2"

settings = Settings()
