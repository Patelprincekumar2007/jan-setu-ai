import io
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import init_db, SessionLocal
from backend.models import CitizenRequest
from backend.schemas import CitizenRequestCreate

init_db()
client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_multilingual_request_intake_preserves_original_text(db_session):
    # 1. English Request
    en_payload = {
        "citizen_request": "Drinking water pipeline leakage near Primary Health Centre.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
        "affected_household_count": 55,
    }
    res_en = client.post("/api/requests", json=en_payload)
    assert res_en.status_code == 201
    data_en = res_en.json()
    ref_en = data_en["reference_id"]

    # 2. Hindi Request
    hi_payload = {
        "citizen_request": "धाराशिव वॉर्ड 4 में पीने के पानी की गंभीर समस्या है और बोरवेल खराब है।",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
        "affected_household_count": 80,
    }
    res_hi = client.post("/api/requests", json=hi_payload)
    assert res_hi.status_code == 201
    data_hi = res_hi.json()
    ref_hi = data_hi["reference_id"]

    # 3. Gujarati Request
    gu_payload = {
        "citizen_request": "ધારાશિવ વોર્ડ 4 માં પીવાના પાણીની સમસ્યા છે અને મોટર બળી ગઈ છે.",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "locality": "Ward 4",
        "category": "Water",
        "affected_household_count": 65,
    }
    res_gu = client.post("/api/requests", json=gu_payload)
    assert res_gu.status_code == 201
    data_gu = res_gu.json()
    ref_gu = data_gu["reference_id"]

    try:
        # Verify persistence in DB
        db_en = db_session.query(CitizenRequest).filter(CitizenRequest.reference_id == ref_en).first()
        assert db_en is not None
        assert db_en.citizen_request == en_payload["citizen_request"]

        db_hi = db_session.query(CitizenRequest).filter(CitizenRequest.reference_id == ref_hi).first()
        assert db_hi is not None
        assert db_hi.citizen_request == hi_payload["citizen_request"]

        db_gu = db_session.query(CitizenRequest).filter(CitizenRequest.reference_id == ref_gu).first()
        assert db_gu is not None
        assert db_gu.citizen_request == gu_payload["citizen_request"]

        # Verify evidence lookup succeeds for Hindi & Gujarati requests
        res_ev_hi = client.get(f"/api/requests/{ref_hi}/evidence")
        assert res_ev_hi.status_code == 200
        ev_hi_data = res_ev_hi.json()
        assert ev_hi_data["evidence_count"] >= 1

        res_ev_gu = client.get(f"/api/requests/{ref_gu}/evidence")
        assert res_ev_gu.status_code == 200
        ev_gu_data = res_ev_gu.json()
        assert ev_gu_data["evidence_count"] >= 1
    finally:
        db_session.query(CitizenRequest).filter(CitizenRequest.reference_id.in_([ref_en, ref_hi, ref_gu])).delete()
        db_session.commit()

def test_voice_transcribe_unconfigured_safe_failure():
    # When Google Cloud Speech credentials are not present in environment,
    # the API must return 503 without crashing or returning fake transcription.
    audio_content = b"RIFF....WAVEfmt ...."
    files = {"file": ("test_audio.wav", io.BytesIO(audio_content), "audio/wav")}
    
    response = client.post("/api/voice/transcribe", files=files, data={"language_code": "hi-IN"})
    assert response.status_code in [503, 400]
    if response.status_code == 503:
        assert "Voice input is not configured" in response.json()["detail"]

def test_voice_transcribe_unsupported_format():
    files = {"file": ("malicious.exe", io.BytesIO(b"executable data"), "application/x-msdownload")}
    response = client.post("/api/voice/transcribe", files=files)
    assert response.status_code == 400
    assert "Unsupported audio format" in response.json()["detail"]

def test_voice_transcribe_empty_file():
    files = {"file": ("empty.wav", io.BytesIO(b""), "audio/wav")}
    response = client.post("/api/voice/transcribe", files=files)
    assert response.status_code == 400
    assert "Empty audio payload" in response.json()["detail"]
