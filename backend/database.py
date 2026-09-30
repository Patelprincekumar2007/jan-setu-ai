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
    import backend.prioritization.models
    import backend.hotspots.models
    
    Base.metadata.create_all(bind=engine)


    if settings.database_url.startswith("sqlite"):
        with engine.connect() as conn:
            # 1. requests table migrations
            cursor = conn.execute(text("PRAGMA table_info(requests)"))
            columns = [row[1] for row in cursor.fetchall()]

            if columns:  # Table exists, ensure all columns exist
                new_request_columns = {
                    "affected_household_count": "INTEGER",
                    "ai_extraction_status": "VARCHAR(30) DEFAULT 'NOT_PROCESSED' NOT NULL",
                    "language": "VARCHAR(50)",
                    "problem_summary": "TEXT",
                    "severity": "VARCHAR(20)",
                    "affected_group": "VARCHAR(200)",
                    "location_hint": "VARCHAR(200)",
                    "retrieval_status": "VARCHAR(30) DEFAULT 'NOT_RUN' NOT NULL",
                }

                for col_name, col_type in new_request_columns.items():
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE requests ADD COLUMN {col_name} {col_type}"))

            # 2. datasets table migrations
            cursor = conn.execute(text("PRAGMA table_info(datasets)"))
            dataset_cols = [row[1] for row in cursor.fetchall()]
            if dataset_cols:
                new_dataset_columns = {
                    "geographic_level": "VARCHAR(50) DEFAULT 'District'",
                    "category": "VARCHAR(100) DEFAULT 'Other'",
                    "year": "INTEGER",
                    "period": "VARCHAR(50)",
                    "retrieval_method": "VARCHAR(50) DEFAULT 'official_download'",
                    "source_format": "VARCHAR(50) DEFAULT 'CSV'",
                    "notes": "TEXT",
                    "updated_at": "DATETIME",
                }
                for col_name, col_type in new_dataset_columns.items():
                    if col_name not in dataset_cols:
                        conn.execute(text(f"ALTER TABLE datasets ADD COLUMN {col_name} {col_type}"))

            conn.commit()

