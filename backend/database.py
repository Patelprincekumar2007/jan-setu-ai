from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency yield for database session with automatic lifecycle cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables and ensure all model columns exist."""
    import backend.models
    import backend.public_data.models
    import backend.knowledge.models
    import backend.rag.models
    
    Base.metadata.create_all(bind=engine)

    if settings.database_url.startswith("sqlite"):
        with engine.connect() as conn:
            cursor = conn.execute(text("PRAGMA table_info(requests)"))
            columns = [row[1] for row in cursor.fetchall()]

            if columns:  # Table exists, ensure all columns exist
                new_columns = {
                    "affected_household_count": "INTEGER",
                    "ai_extraction_status": "VARCHAR(30) DEFAULT 'NOT_PROCESSED' NOT NULL",
                    "language": "VARCHAR(50)",
                    "problem_summary": "TEXT",
                    "severity": "VARCHAR(20)",
                    "affected_group": "VARCHAR(200)",
                    "location_hint": "VARCHAR(200)",
                    "retrieval_status": "VARCHAR(30) DEFAULT 'NOT_RUN' NOT NULL",
                }

                for col_name, col_type in new_columns.items():
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE requests ADD COLUMN {col_name} {col_type}"))
                conn.commit()
