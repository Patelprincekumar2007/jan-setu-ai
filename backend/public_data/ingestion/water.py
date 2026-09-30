from backend.public_data.ingestion.base import BaseDatasetIngestionAdapter
from backend.public_data.loaders import JJMWaterCoverageLoader, BaseDatasetLoader

class WaterDatasetIngestionAdapter(BaseDatasetIngestionAdapter):
    def get_loader(self) -> BaseDatasetLoader:
        return JJMWaterCoverageLoader()
