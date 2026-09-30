import json
from pathlib import Path
from typing import List, Dict, Optional, Any
from backend.public_data.schemas import DatasetCreate

class DatasetRegistry:
    """
    Central registry for managing official Indian public datasets.
    Loads and validates metadata manifests from data/sources/dataset_registry.json.
    """

    DEFAULT_REGISTRY_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "sources" / "dataset_registry.json"

    def __init__(self, registry_file: Optional[str] = None):
        if registry_file:
            self.registry_path = Path(registry_file)
        else:
            self.registry_path = self.DEFAULT_REGISTRY_PATH

    @classmethod
    def load_manifest(cls, registry_path: Optional[Path] = None) -> List[Dict[str, Any]]:
        path = registry_path or cls.DEFAULT_REGISTRY_PATH
        if not path.exists():
            return []
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return []

    @classmethod
    def get_registered_datasets(cls, registry_path: Optional[Path] = None) -> List[DatasetCreate]:
        manifest = cls.load_manifest(registry_path=registry_path)
        datasets: List[DatasetCreate] = []
        for item in manifest:
            try:
                ds = DatasetCreate(
                    dataset_id=item["dataset_id"],
                    title=item["title"],
                    description=item.get("description"),
                    source_name=item["source_name"],
                    source_url=item.get("source_url"),
                    publisher=item.get("publisher"),
                    data_type=item.get("data_type", "tabular"),
                    geographic_scope=item.get("geographic_scope", "National"),
                    geographic_level=item.get("geographic_level", "District"),
                    category=item.get("category", "Other"),
                    year=item.get("year"),
                    period=item.get("period"),
                    last_updated=item.get("last_updated"),
                    license=item.get("license", "Government Open Data License - India (GODL)"),
                    ingestion_status=item.get("status", "VERIFIED"),
                    retrieval_method=item.get("retrieval_method", "official_download"),
                    source_format=item.get("source_format", "CSV"),
                    notes=item.get("notes"),
                )
                datasets.append(ds)
            except Exception as e:
                print(f"[WARN] Failed to parse registered dataset {item.get('dataset_id')}: {e}")
        return datasets

    @classmethod
    def get_dataset_by_id(cls, dataset_id: str, registry_path: Optional[Path] = None) -> Optional[DatasetCreate]:
        for ds in cls.get_registered_datasets(registry_path=registry_path):
            if ds.dataset_id == dataset_id:
                return ds
        return None

