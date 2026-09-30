from backend.public_data.ingestion.base import BaseDatasetIngestionAdapter
from backend.public_data.loaders import PMGSYRoadConnectivityLoader, BaseDatasetLoader

class RoadsDatasetIngestionAdapter(BaseDatasetIngestionAdapter):
    def get_loader(self) -> BaseDatasetLoader:
        return PMGSYRoadConnectivityLoader()
