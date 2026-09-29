import datetime
import secrets
from sqlalchemy.orm import Session
from backend.models import CitizenRequest

def generate_reference_id() -> str:
    """Generate a human-readable reference code formatted as NL-YYYYMMDD-XXXXXX."""
    date_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d")
    random_suffix = secrets.token_hex(3).upper()
    return f"NL-{date_str}-{random_suffix}"

def generate_unique_reference_id(db: Session) -> str:
    """Generate a reference ID and ensure uniqueness against the database."""
    for _ in range(10):
        ref_id = generate_reference_id()
        existing = db.query(CitizenRequest).filter(CitizenRequest.reference_id == ref_id).first()
        if not existing:
            return ref_id
    raise RuntimeError("Failed to generate a unique reference ID after multiple attempts.")
