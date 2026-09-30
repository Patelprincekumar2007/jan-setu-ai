import csv
import json
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Dict, Any
from pathlib import Path
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate
from backend.public_data.normalizer import (
    normalize_geographic_name,
    normalize_numeric_metric,
    normalize_category,
    normalize_integer,
    normalize_unit,
)

class BaseDatasetLoader(ABC):
    """Abstract interface for civic dataset loaders."""

    @abstractmethod
    def load(self) -> Tuple[DatasetCreate, List[PublicDataRecordCreate]]:
        pass

class GenericCSVDatasetLoader(BaseDatasetLoader):
    """
    Standard deterministic loader for tabular civic datasets.
    """

    def __init__(
        self,
        csv_path: Path,
        meta_path: Path,
        default_category: str = "Other",
    ):
        self.csv_path = csv_path
        self.meta_path = meta_path
        self.default_category = default_category

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
            geographic_level=meta.get("geographic_level", "District"),
            category=meta.get("category", self.default_category),
            year=meta.get("year", 2024),
            period=meta.get("period"),
            last_updated=meta.get("last_updated"),
            license=meta.get("license", "Government Open Data License - India (GODL)"),
            ingestion_status="NOT_INGESTED",
            retrieval_method=meta.get("retrieval_method", "official_download"),
            source_format=meta.get("source_format", "CSV"),
            notes=meta.get("notes"),
        )

        records: List[PublicDataRecordCreate] = []
        with open(self.csv_path, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, start=1):
                state_norm = normalize_geographic_name(row.get("state") or row.get("State"))
                district_norm = normalize_geographic_name(row.get("district") or row.get("District"))
                if not state_norm or not district_norm:
                    continue

                # Locate metric column
                metric_val = None
                for col in [
                    "tap_water_coverage_pct",
                    "coverage_pct",
                    "functional_phc_readiness_pct",
                    "odf_plus_village_coverage_pct",
                    "habitations_connected_pct",
                    "metric_value",
                    "value",
                ]:
                    if col in row and row[col] is not None:
                        metric_val = row[col]
                        break

                val_norm = normalize_numeric_metric(metric_val)
                year_norm = normalize_integer(row.get("year") or row.get("Year") or dataset.year or 2024)
                cat_norm = normalize_category(row.get("category") or dataset.category or self.default_category)
                unit_norm = normalize_unit(row.get("unit") or "%")

                src_ref = (
                    row.get("source_reference")
                    or row.get("source_id")
                    or f"OGD-{dataset.dataset_id[:8].upper()}-{state_norm[:2].upper()}-{i:02d}"
                ).strip()

                record = PublicDataRecordCreate(
                    record_id=f"{dataset.dataset_id}-REC-{i:04d}",
                    dataset_id=dataset.dataset_id,
                    state=state_norm,
                    district=district_norm,
                    locality=normalize_geographic_name(row.get("locality")),
                    category=cat_norm,  # type: ignore
                    metric_name=row.get("metric_name", f"{dataset.title} Metric").strip(),
                    metric_value=val_norm,
                    unit=unit_norm,
                    year=year_norm,
                    period=row.get("period", dataset.period or "2024").strip() if row.get("period") else dataset.period,
                    geographic_level=row.get("geographic_level", dataset.geographic_level or "District").strip(),
                    source_reference=src_ref,
                    notes=row.get("notes", "").strip() or None,
                )
                records.append(record)

        return dataset, records

class JJMWaterCoverageLoader(GenericCSVDatasetLoader):
    def __init__(self, raw_data_dir: Optional[str] = None):
        base = Path(raw_data_dir) if raw_data_dir else Path(__file__).resolve().parent.parent.parent / "data" / "raw"
        super().__init__(
            csv_path=base / "jjm_district_water_coverage_2024.csv",
            meta_path=base / "jjm_district_water_coverage_2024.meta.json",
            default_category="Water",
        )

class NHMHealthInfrastructureLoader(GenericCSVDatasetLoader):
    def __init__(self, raw_data_dir: Optional[str] = None):
        base = Path(raw_data_dir) if raw_data_dir else Path(__file__).resolve().parent.parent.parent / "data" / "raw"
        super().__init__(
            csv_path=base / "nhm_district_health_infrastructure_2024.csv",
            meta_path=base / "nhm_district_health_infrastructure_2024.meta.json",
            default_category="Healthcare",
        )

class SBMSanitationCoverageLoader(GenericCSVDatasetLoader):
    def __init__(self, raw_data_dir: Optional[str] = None):
        base = Path(raw_data_dir) if raw_data_dir else Path(__file__).resolve().parent.parent.parent / "data" / "raw"
        super().__init__(
            csv_path=base / "sbm_district_sanitation_coverage_2024.csv",
            meta_path=base / "sbm_district_sanitation_coverage_2024.meta.json",
            default_category="Sanitation",
        )

class PMGSYRoadConnectivityLoader(GenericCSVDatasetLoader):
    def __init__(self, raw_data_dir: Optional[str] = None):
        base = Path(raw_data_dir) if raw_data_dir else Path(__file__).resolve().parent.parent.parent / "data" / "raw"
        super().__init__(
            csv_path=base / "pmgsy_district_road_connectivity_2024.csv",
            meta_path=base / "pmgsy_district_road_connectivity_2024.meta.json",
            default_category="Roads",
        )

def get_loader_for_dataset(dataset_id: str, raw_data_dir: Optional[str] = None) -> BaseDatasetLoader:
    """Factory returning the appropriate loader for a registered dataset ID."""
    loaders: Dict[str, Any] = {
        "ds-jjm-water-coverage-2024": JJMWaterCoverageLoader,
        "ds-nhm-health-facilities-2024": NHMHealthInfrastructureLoader,
        "ds-sbm-sanitation-coverage-2024": SBMSanitationCoverageLoader,
        "ds-pmgsy-road-connectivity-2024": PMGSYRoadConnectivityLoader,
    }

    loader_cls = loaders.get(dataset_id)
    if loader_cls:
        return loader_cls(raw_data_dir=raw_data_dir)

    # Generic fallback
    base = Path(raw_data_dir) if raw_data_dir else Path(__file__).resolve().parent.parent.parent / "data" / "raw"
    csv_candidates = list(base.glob(f"*{dataset_id.replace('ds-', '')}*.csv"))
    meta_candidates = list(base.glob(f"*{dataset_id.replace('ds-', '')}*.meta.json"))
    if csv_candidates and meta_candidates:
        return GenericCSVDatasetLoader(csv_path=csv_candidates[0], meta_path=meta_candidates[0])

    raise ValueError(f"No loader configured for dataset ID: {dataset_id}")
