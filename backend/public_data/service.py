import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.public_data.models import Dataset, PublicDataRecord
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate
from backend.public_data import repository as pub_repo
from backend.public_data.loaders import BaseDatasetLoader, JJMWaterCoverageLoader

logger = logging.getLogger(__name__)

class PublicDataService:
    @staticmethod
    def ingest_dataset(db: Session, loader: BaseDatasetLoader) -> Tuple[Dataset, int]:
        """Loads and deterministically ingests a public dataset into SQLite."""
        dataset_meta, records = loader.load()
        existing = pub_repo.get_dataset(db, dataset_meta.dataset_id)
        if not existing:
            dataset = pub_repo.create_dataset(db, dataset_meta)
        else:
            dataset = existing

        count = pub_repo.bulk_create_public_records(db, records)
        updated_dataset = pub_repo.update_dataset_status(
            db, dataset.dataset_id, status="INGESTED", record_count=count
        )
        logger.info(f"Successfully ingested dataset '{dataset.dataset_id}' with {count} records.")
        return updated_dataset or dataset, count

    @staticmethod
    def seed_default_datasets(db: Session):
        """Idempotently seeds all default civic datasets."""
        jjm_loader = JJMWaterCoverageLoader()
        PublicDataService.ingest_dataset(db, jjm_loader)

    @staticmethod
    def list_datasets(db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Dataset], int]:
        return pub_repo.list_datasets(db, skip=skip, limit=limit)

    @staticmethod
    def get_dataset(db: Session, dataset_id: str) -> Optional[Dataset]:
        return pub_repo.get_dataset(db, dataset_id)

    @staticmethod
    def list_records(
        db: Session,
        dataset_id: Optional[str] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[PublicDataRecord], int]:
        return pub_repo.list_public_records(
            db,
            dataset_id=dataset_id,
            state=state,
            district=district,
            category=category,
            skip=skip,
            limit=limit,
        )
