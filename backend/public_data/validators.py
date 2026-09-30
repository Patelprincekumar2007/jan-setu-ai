from typing import List, Dict, Any, Optional
from backend.public_data.schemas import DatasetCreate, PublicDataRecordCreate

QUALITY_FLAG_MISSING_GEOGRAPHY = "MISSING_GEOGRAPHY"
QUALITY_FLAG_MISSING_METRIC = "MISSING_METRIC"
QUALITY_FLAG_INVALID_NUMERIC = "INVALID_NUMERIC"
QUALITY_FLAG_INVALID_PERCENTAGE = "INVALID_PERCENTAGE"
QUALITY_FLAG_MISSING_SOURCE_REF = "MISSING_SOURCE_REFERENCE"
QUALITY_FLAG_UNKNOWN_CATEGORY = "UNKNOWN_CATEGORY"
QUALITY_FLAG_UNKNOWN_UNIT = "UNKNOWN_UNIT"

class DataRecordValidator:
    """Validates raw and normalized public data records, extracting quality flags without mutating data."""

    @staticmethod
    def validate_record(record: PublicDataRecordCreate) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []

        if not record.state or not record.district:
            flags.append({
                "flag": QUALITY_FLAG_MISSING_GEOGRAPHY,
                "record_id": record.record_id,
                "details": f"Missing state or district (state='{record.state}', district='{record.district}')"
            })

        if not record.source_reference:
            flags.append({
                "flag": QUALITY_FLAG_MISSING_SOURCE_REF,
                "record_id": record.record_id,
                "details": "Missing official source row reference."
            })

        if record.metric_value is None:
            flags.append({
                "flag": QUALITY_FLAG_MISSING_METRIC,
                "record_id": record.record_id,
                "details": f"Metric value is null for '{record.metric_name}' (preserved as null)."
            })
        else:
            if record.metric_value < 0:
                flags.append({
                    "flag": QUALITY_FLAG_INVALID_NUMERIC,
                    "record_id": record.record_id,
                    "details": f"Negative metric value: {record.metric_value}"
                })
            if record.unit == "%" and (record.metric_value < 0.0 or record.metric_value > 100.0):
                flags.append({
                    "flag": QUALITY_FLAG_INVALID_PERCENTAGE,
                    "record_id": record.record_id,
                    "details": f"Percentage metric out of bounds (0-100): {record.metric_value}%"
                })

        if record.category not in {"Water", "Roads", "Healthcare", "Sanitation", "Other"}:
            flags.append({
                "flag": QUALITY_FLAG_UNKNOWN_CATEGORY,
                "record_id": record.record_id,
                "details": f"Unrecognized category '{record.category}'."
            })

        return flags

    @staticmethod
    def validate_water_dataset(records: List[PublicDataRecordCreate]) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        for r in records:
            flags.extend(DataRecordValidator.validate_record(r))
        return flags

    @staticmethod
    def validate_healthcare_dataset(records: List[PublicDataRecordCreate]) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        for r in records:
            flags.extend(DataRecordValidator.validate_record(r))
        return flags

    @staticmethod
    def validate_sanitation_dataset(records: List[PublicDataRecordCreate]) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        for r in records:
            flags.extend(DataRecordValidator.validate_record(r))
        return flags

    @staticmethod
    def validate_roads_dataset(records: List[PublicDataRecordCreate]) -> List[Dict[str, Any]]:
        flags: List[Dict[str, Any]] = []
        for r in records:
            flags.extend(DataRecordValidator.validate_record(r))
        return flags
