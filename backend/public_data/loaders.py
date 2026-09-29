import csv
import json
import os
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional
from pathlib import Path
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate
from backend.public_data.normalizer import (
    normalize_geographic_name,
    normalize_numeric_metric,
    normalize_category,
    normalize_integer,
)

class BaseDatasetLoader(ABC):
    """Abstract interface for civic dataset loaders."""

    @abstractmethod
    def load(self) -> Tuple[DatasetCreate, List[PublicDataRecordCreate]]:
        pass

class JJMWaterCoverageLoader(BaseDatasetLoader):
    """
    Deterministic loader for Jal Jeevan Mission District-level Water Coverage dataset.
    Raw source: data/raw/jjm_district_water_coverage_2024.csv
    Metadata source: data/raw/jjm_district_water_coverage_2024.meta.json
    """

    def __init__(self, raw_data_dir: Optional[str] = None):
        if raw_data_dir:
            self.base_dir = Path(raw_data_dir)
        else:
            self.base_dir = Path(__file__).resolve().parent.parent.parent / "data" / "raw"

        self.csv_path = self.base_dir / "jjm_district_water_coverage_2024.csv"
        self.meta_path = self.base_dir / "jjm_district_water_coverage_2024.meta.json"

    def load(self) -> Tuple[DatasetCreate, List[PublicDataRecordCreate]]:
        if not self.meta_path.exists():
            raise FileNotFoundError(f"Metadata file not found: {self.meta_path}")
        if not self.csv_path.exists():
            raise FileNotFoundError(f"Raw CSV file not found: {self.csv_path}")

        with open(self.meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)

        dataset = DatasetCreate(
            dataset_id=meta["dataset_id"],
            title=meta["title"],
            description=meta.get("description"),
            source_name=meta["source_name"],
            source_url=meta.get("source_url"),
            publisher=meta.get("publisher"),
            data_type=meta.get("data_type", "tabular"),
            geographic_scope=meta.get("geographic_scope", "National"),
            update_frequency=meta.get("update_frequency", "Annual"),
            last_updated=meta.get("last_updated"),
            license=meta.get("license", "Open Government Data License - India"),
            ingestion_status="NOT_INGESTED",
        )

        records: List[PublicDataRecordCreate] = []
        with open(self.csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=1):
                state_norm = normalize_geographic_name(row.get("state") or row.get("State"))
                district_norm = normalize_geographic_name(row.get("district") or row.get("District"))
                if not state_norm or not district_norm:
                    continue

                val_norm = normalize_numeric_metric(
                    row.get("tap_water_coverage_pct") or row.get("coverage_pct") or row.get("metric_value")
                )
                year_norm = normalize_integer(row.get("year") or row.get("Year") or 2024)
                src_ref = (row.get("source_reference") or row.get("source_id") or f"OGD-JJM-2024-{state_norm[:2].upper()}-{i:02d}").strip()

                record = PublicDataRecordCreate(
                    record_id=f"{dataset.dataset_id}-REC-{i:04d}",
                    dataset_id=dataset.dataset_id,
                    state=state_norm,
                    district=district_norm,
                    locality=normalize_geographic_name(row.get("locality")),
                    category="Water",
                    metric_name=row.get("metric_name", "Rural Household Tap Water Coverage (%)").strip(),
                    metric_value=val_norm,
                    unit=row.get("unit", "%").strip(),
                    year=year_norm,
                    period=row.get("period", "2024-Q3").strip() if row.get("period") else "2024-Q3",
                    geographic_level="District",
                    source_reference=src_ref,
                    notes=row.get("notes", "").strip() or None,
                )
                records.append(record)

        return dataset, records
