import logging
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from backend.public_data.models import Dataset, PublicDataRecord
from backend.public_data import repository as pub_repo
from backend.knowledge.models import KnowledgeEvidence
from backend.knowledge.schemas import KnowledgeEvidenceCreate, KnowledgeDatasetSummaryResponse
from backend.knowledge.builders import build_knowledge_evidence_from_public_record
from backend.knowledge import repository as knowledge_repo

logger = logging.getLogger(__name__)

class KnowledgeService:
    @staticmethod
    def ingest_dataset_to_knowledge(db: Session, dataset_id: str) -> int:
        """
        Loads all PublicDataRecords for dataset_id, transforms them into KnowledgeEvidence,
        and persists them into the knowledge repository.
        """
        dataset = pub_repo.get_dataset(db, dataset_id)
        if not dataset:
            raise ValueError(f"Dataset with ID '{dataset_id}' not found.")

        records = db.query(PublicDataRecord).filter(PublicDataRecord.dataset_id == dataset_id).all()
        if not records:
            logger.warning(f"No records found for dataset '{dataset_id}' to ingest into knowledge.")
            return 0

        evidence_items = [
            build_knowledge_evidence_from_public_record(rec, dataset)
            for rec in records
        ]

        count = knowledge_repo.bulk_save_knowledge_evidence(db, evidence_items)
        logger.info(f"Ingested {count} evidence items for dataset '{dataset_id}' into knowledge repository.")
        return count

    @staticmethod
    def seed_default_knowledge(db: Session):
        """Idempotently seeds all default public datasets into knowledge repository."""
        datasets, _ = pub_repo.list_datasets(db)
        for ds in datasets:
            KnowledgeService.ingest_dataset_to_knowledge(db, ds.dataset_id)

    @staticmethod
    def get_dataset_summary(db: Session, dataset_id: str) -> Optional[KnowledgeDatasetSummaryResponse]:
        """Returns dataset metadata along with knowledge evidence count."""
        dataset = pub_repo.get_dataset(db, dataset_id)
        if not dataset:
            return None

        evidence_count = db.query(KnowledgeEvidence).filter(KnowledgeEvidence.dataset_id == dataset_id).count()

        return KnowledgeDatasetSummaryResponse(
            dataset_id=dataset.dataset_id,
            title=dataset.title,
            source_name=dataset.source_name,
            source_url=dataset.source_url,
            publisher=dataset.publisher,
            license=dataset.license,
            ingestion_status=dataset.ingestion_status,
            evidence_count=evidence_count,
            last_updated=dataset.last_updated,
        )
