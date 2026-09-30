import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.public_data.models import Dataset, PublicDataRecord
from backend.public_data.schemas import (
    DatasetCreate,
    PublicDataRecordCreate,
    DatasetQualityReport,
)
from backend.public_data import repository as pub_repo
from backend.public_data.loaders import (
    BaseDatasetLoader,
    JJMWaterCoverageLoader,
    NHMHealthInfrastructureLoader,
    SBMSanitationCoverageLoader,
    PMGSYRoadConnectivityLoader,
    get_loader_for_dataset,
)

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
            # Update metadata fields
            dataset = existing
            dataset.title = dataset_meta.title
            dataset.description = dataset_meta.description
            dataset.source_name = dataset_meta.source_name
            dataset.source_url = dataset_meta.source_url
            dataset.publisher = dataset_meta.publisher
            dataset.category = dataset_meta.category
            dataset.year = dataset_meta.year
            dataset.period = dataset_meta.period
            dataset.geographic_scope = dataset_meta.geographic_scope
            dataset.geographic_level = dataset_meta.geographic_level
            dataset.license = dataset_meta.license
            dataset.notes = dataset_meta.notes
            db.commit()

        count = pub_repo.bulk_create_public_records(db, records)
        updated_dataset = pub_repo.update_dataset_status(
            db, dataset.dataset_id, status="VERIFIED", record_count=count
        )

        # Log ingestion run
        pub_repo.log_ingestion_run(
            db=db,
            dataset_id=dataset.dataset_id,
            status="SUCCESS",
            raw_records=len(records),
            normalized_records=count,
            inserted_records=count,
            skipped_records=0,
            duplicate_records=0,
            error_count=0,
            warning_count=0,
            message=f"Successfully ingested and verified {count} records.",
        )

        logger.info(f"Successfully ingested dataset '{dataset.dataset_id}' with {count} records.")
        return updated_dataset or dataset, count

    @staticmethod
    def seed_default_datasets(db: Session):
        """Idempotently seeds all default verified civic datasets across 4 categories."""
        loaders = [
            JJMWaterCoverageLoader(),
            NHMHealthInfrastructureLoader(),
            SBMSanitationCoverageLoader(),
            PMGSYRoadConnectivityLoader(),
        ]
        for loader in loaders:
            try:
                PublicDataService.ingest_dataset(db, loader)
            except Exception as e:
                logger.error(f"Error seeding dataset with loader {loader.__class__.__name__}: {e}")

    @staticmethod
    def list_datasets(
        db: Session,
        category: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Dataset], int]:
        return pub_repo.list_datasets(db, category=category, status=status, skip=skip, limit=limit)

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
        year: Optional[int] = None,
        geographic_level: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[PublicDataRecord], int]:
        return pub_repo.list_public_records(
            db,
            dataset_id=dataset_id,
            state=state,
            district=district,
            category=category,
            year=year,
            geographic_level=geographic_level,
            skip=skip,
            limit=limit,
        )

    @staticmethod
    def get_quality_report(db: Session, dataset_id: str) -> Optional[DatasetQualityReport]:
        return pub_repo.get_dataset_quality_report(db, dataset_id)

