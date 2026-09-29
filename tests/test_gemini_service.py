from unittest.mock import patch, MagicMock
from backend.gemini_service import extract_request_intelligence
from backend.schemas import GeminiExtractionResult
from backend.config import settings


def test_gemini_missing_api_key(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "")
    result = extract_request_intelligence("Pothole on Main Street", "Maharashtra", "Dharashiv", "Ward 4", "Roads")
    assert result is None


def test_gemini_placeholder_api_key(monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "your_gemini_api_key_here")
    result = extract_request_intelligence("Water leakage in sector 2", "Maharashtra", "Dharashiv", "Ward 4", "Water")
    assert result is None


@patch("backend.gemini_service.genai.Client")
def test_gemini_valid_structured_response(mock_genai_client, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test_valid_key")
    
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"category": "Water", "severity": "High", "problem_summary": "Borewell motor failure at PHC.", "affected_group": "Patients and staff", "location_hint": "Ward 4 PHC", "language": "English"}'
    mock_instance.models.generate_content.return_value = mock_response
    mock_genai_client.return_value = mock_instance

    result = extract_request_intelligence("Borewell motor is broken", "Maharashtra", "Dharashiv", "Ward 4", "Water")
    assert result is not None
    assert isinstance(result, GeminiExtractionResult)
    assert result.category == "Water"
    assert result.severity == "High"
    assert "Borewell motor failure" in result.problem_summary


@patch("backend.gemini_service.genai.Client")
def test_gemini_invalid_json_response(mock_genai_client, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test_valid_key")
    
    mock_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = 'NOT_JSON_CONTENT'
    mock_instance.models.generate_content.return_value = mock_response
    mock_genai_client.return_value = mock_instance

    result = extract_request_intelligence("Invalid JSON test", "Maharashtra", "Dharashiv", "Ward 4", "Water")
    assert result is None


@patch("backend.gemini_service.genai.Client")
def test_gemini_api_exception(mock_genai_client, monkeypatch):
    monkeypatch.setattr(settings, "gemini_api_key", "test_valid_key")
    
    mock_instance = MagicMock()
    mock_instance.models.generate_content.side_effect = Exception("API rate limit exceeded")
    mock_genai_client.return_value = mock_instance

    result = extract_request_intelligence("API exception test", "Maharashtra", "Dharashiv", "Ward 4", "Water")
    assert result is None


def test_gemini_category_validation():
    valid = GeminiExtractionResult(category="Water", severity="Medium")
    assert valid.category == "Water"


def test_gemini_severity_validation():
    valid = GeminiExtractionResult(category="Roads", severity="Critical")
    assert valid.severity == "Critical"
