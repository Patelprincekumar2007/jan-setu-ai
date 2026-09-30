import re
import unicodedata
from typing import Optional, Any, Tuple

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
    "UTTARAKHAND": "Uttarakhand",
    "HIMACHAL PRADESH": "Himachal Pradesh",
    "JAMMU AND KASHMIR": "Jammu and Kashmir",
    "GOA": "Goa",
    "TRIPURA": "Tripura",
    "MEGHALAYA": "Meghalaya",
    "MANIPUR": "Manipur",
    "NAGALAND": "Nagaland",
    "MIZORAM": "Mizoram",
    "SIKKIM": "Sikkim",
    "ARUNACHAL PRADESH": "Arunachal Pradesh",
}

# Known verified administrative district aliases (documented mappings only)
DISTRICT_VERIFIED_ALIASES = {
    "OSMANABAD": "Dharashiv",
    "DHARASHIV": "Dharashiv",
    "AHMADABAD": "Ahmedabad",
    "AHMEDABAD": "Ahmedabad",
    "BELGAUM": "Belagavi",
    "BELAGAVI": "Belagavi",
    "GULBARGA": "Kalaburagi",
    "KALABURAGI": "Kalaburagi",
    "KHORDHA": "Khordha",
    "KURDHA": "Khordha",
    "CUTTACK": "Cuttack",
    "PUNE": "Pune",
    "POONA": "Pune",
}

NULL_STRING_VALUES = {
    "", "na", "n/a", "null", "none", "-", "--", "nd", "not available", "unknown", "\u2014", "nil", "n.a."
}


VALID_CATEGORIES = {"Water", "Roads", "Healthcare", "Sanitation", "Other"}

def normalize_text_unicode(text: Optional[str]) -> Optional[str]:
    """Normalizes Unicode text and collapses redundant whitespace."""
    if text is None:
        return None
    if not isinstance(text, str):
        text = str(text)
    norm = unicodedata.normalize("NFKC", text)
    cleaned = re.sub(r"\s+", " ", norm).strip()
    return cleaned if cleaned else None

def normalize_geographic_name(name: Optional[str]) -> Optional[str]:
    """
    Deterministically cleans and standardises geographic string (State, District, Locality).
    Strips leading/trailing whitespace, collapses internal whitespace, and applies standard casing.
    """
    cleaned = normalize_text_unicode(name)
    if not cleaned:
        return None

    upper = cleaned.upper()
    if upper in STATE_NAME_MAPPINGS:
        return STATE_NAME_MAPPINGS[upper]

    if upper in DISTRICT_VERIFIED_ALIASES:
        return DISTRICT_VERIFIED_ALIASES[upper]

    # Standard Title Case for districts and localities
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
        cleaned = normalize_text_unicode(val)
        if not cleaned:
            return None
        cleaned_lower = cleaned.lower()
        if cleaned_lower in NULL_STRING_VALUES:
            return None
        # Remove commas and percentage signs
        sanitized = cleaned.replace(",", "").replace("%", "").strip()
        try:
            return float(sanitized)
        except ValueError:
            return None
    return None

def normalize_percentage(val: Any) -> Tuple[Optional[float], Optional[str]]:
    """
    Parses a percentage value, returning (value, unit).
    Ensures unit is '%' and does not invent defaults.
    """
    num = normalize_numeric_metric(val)
    if num is None:
        return None, None
    return num, "%"

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
    if any(w in lower for w in ["water", "drinking", "jal", "pipe", "tap", "borewell", "supply"]):
        return "Water"
    if any(w in lower for w in ["road", "highway", "pothole", "street", "bridge", "pmgsy", "connectivity"]):
        return "Roads"
    if any(w in lower for w in ["health", "hospital", "clinic", "phc", "doctor", "medical", "sub-centre"]):
        return "Healthcare"
    if any(w in lower for w in ["sanitation", "drain", "sewage", "toilet", "waste", "garbage", "odf", "swachh"]):
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
        cleaned = normalize_text_unicode(val)
        if not cleaned or cleaned.lower() in NULL_STRING_VALUES:
            return None
        sanitized = cleaned.replace(",", "").strip()
        try:
            return int(float(sanitized))
        except ValueError:
            return None
    return None

def normalize_unit(unit_raw: Optional[str]) -> Optional[str]:
    """Standardises unit string."""
    cleaned = normalize_text_unicode(unit_raw)
    if not cleaned or cleaned.lower() in NULL_STRING_VALUES:
        return None
    if cleaned in ("%", "pct", "percent", "percentage"):
        return "%"
    if cleaned.lower() in ("km", "kilometer", "kilometres"):
        return "km"
    return cleaned
