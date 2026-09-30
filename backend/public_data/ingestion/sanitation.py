from backend.public_data.ingestion.base import BaseDatasetIngestionAdapter
from backend.public_data.loaders import SBMSanitationCoverageLoader, BaseDatasetLoader

class SanitationDatasetIngestionAdapter(BaseDatasetIngestionAdapter):
    def get_loader(self) -> BaseDatasetLoader:
        return SBMSanitationCoverageLoader()
