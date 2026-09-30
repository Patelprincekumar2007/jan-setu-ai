from backend.public_data.ingestion.base import BaseDatasetIngestionAdapter
from backend.public_data.loaders import NHMHealthInfrastructureLoader, BaseDatasetLoader

class HealthcareDatasetIngestionAdapter(BaseDatasetIngestionAdapter):
    def get_loader(self) -> BaseDatasetLoader:
        return NHMHealthInfrastructureLoader()
