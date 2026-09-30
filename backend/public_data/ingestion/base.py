from abc import ABC, abstractmethod
from typing import Tuple, List, Dict, Any
from sqlalchemy.orm import Session
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate
from backend.public_data.loaders import BaseDatasetLoader
from backend.public_data.validators import DataRecordValidator

class BaseDatasetIngestionAdapter(ABC):
    """
    Lifecycle adapter for public dataset ingestion:
    RAW -> LOAD -> VALIDATE -> NORMALIZE -> DEDUPLICATE -> PERSIST -> KNOWLEDGE EVIDENCE -> VECTOR INDEX -> RETRIEVAL
    """

    @abstractmethod
    def get_loader(self) -> BaseDatasetLoader:
        pass

    def validate(self, dataset: DatasetCreate, records: List[PublicDataRecordCreate]) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        for rec in records:
            flags.extend(DataRecordValidator.validate_record(rec))
        return flags
