import re
from typing import Optional, Any

STATE_NAME_MAPPINGS = {
    "MAHARASHTRA": "Maharashtra",
    "GUJARAT": "Gujarat",
    "KARNATAKA": "Karnataka",
    "TAMIL NADU": "Tamil Nadu",
    "UTTAR PRADESH": "Uttar Pradesh",
    "BIHAR": "Bihar",
    "WEST BENGAL": "West Bengal",
    "MADHYA PRADESH": "Madhya Pradesh",
    "RAJASTHAN": "Rajasthan",
    "ANDHRA PRADESH": "Andhra Pradesh",
    "TELANGANA": "Telangana",
    "KERALA": "Kerala",
    "ODISHA": "Odisha",
    "PUNJAB": "Punjab",
    "HARYANA": "Haryana",
    "ASSAM": "Assam",
    "JHARKHAND": "Jharkhand",
    "CHHATTISGARH": "Chhattisgarh",
    "DELHI": "Delhi",
}

VALID_CATEGORIES = {"Water", "Roads", "Healthcare", "Sanitation", "Other"}

def normalize_geographic_name(name: Optional[str]) -> Optional[str]:
    """
    Deterministically cleans and standardises geographic string (State, District, Locality).
    Strips leading/trailing whitespace, collapses internal whitespace, and applies standard casing.
    """
    if not name or not isinstance(name, str):
        return None
    cleaned = re.sub(r"\s+", " ", name.strip())
    if not cleaned:
        return None

    upper = cleaned.upper()
    if upper in STATE_NAME_MAPPINGS:
        return STATE_NAME_MAPPINGS[upper]

    # Title-case for districts and localities
    return cleaned.title()

def normalize_numeric_metric(val: Any) -> Optional[float]:
    """
    Deterministically parses numeric metric value.
    Returns float or None if missing/unavailable. Does NOT invent zeroes or averages.
    """
    if val is None:
        return None
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        cleaned = val.strip().replace(",", "").replace("%", "")
        if cleaned in ("", "NA", "N/A", "null", "None", "-", "ND"):
            return None
        try:
            return float(cleaned)
        except ValueError:
            return None
    return None

def normalize_category(category_input: Optional[str]) -> str:
    """
    Normalizes sector category string to one of: Water, Roads, Healthcare, Sanitation, Other.
    Defaults to 'Other' if unknown or ambiguous.
    """
    if not category_input or not isinstance(category_input, str):
        return "Other"
    cleaned = category_input.strip().capitalize()
    if cleaned in VALID_CATEGORIES:
        return cleaned
    lower = category_input.lower()
    if any(w in lower for w in ["water", "drinking", "jal", "pipe", "tap", "borewell"]):
        return "Water"
    if any(w in lower for w in ["road", "highway", "pothole", "street", "bridge"]):
        return "Roads"
    if any(w in lower for w in ["health", "hospital", "clinic", "phc", "doctor", "medical"]):
        return "Healthcare"
    if any(w in lower for w in ["sanitation", "drain", "sewage", "toilet", "waste", "garbage"]):
        return "Sanitation"
    return "Other"

def normalize_integer(val: Any) -> Optional[int]:
    """Parses integer value (e.g. year, count) or returns None if missing."""
    if val is None:
        return None
    if isinstance(val, int):
        return val
    if isinstance(val, float):
        return int(val)
    if isinstance(val, str):
        cleaned = val.strip().replace(",", "")
        if cleaned in ("", "NA", "N/A", "null", "None", "-"):
            return None
        try:
            return int(float(cleaned))
        except ValueError:
            return None
    return None
