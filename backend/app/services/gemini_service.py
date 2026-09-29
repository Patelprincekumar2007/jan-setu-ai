import json
import logging
from typing import Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self._client = None
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info("Google GenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")

    def is_configured(self) -> bool:
        return self._client is not None

    def generate_grounded_analysis_json(self, system_instruction: str, user_data: Dict[str, Any]) -> str:
        if not self._client:
            raise RuntimeError("Gemini is not configured")
        try:
            from google.genai import types

            response = self._client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=json.dumps(user_data, ensure_ascii=False),
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                ),
            )
            if not response.text:
                raise ValueError("Gemini returned an empty response")
            return response.text
        except Exception as error:
            logger.warning("Grounded Gemini analysis failed.")
            raise RuntimeError("Grounded analysis could not be generated") from error

    def understand_complaint(self, original_narrative: str, category: str, state: str, district: str, locality: str = None) -> Dict[str, Any]:
        result, _ = self.understand_complaint_with_status(
            original_narrative, category, state, district, locality
        )
        return result

    def understand_complaint_with_status(
        self, original_narrative: str, category: str, state: str, district: str, locality: str = None
    ) -> tuple[Dict[str, Any], str]:
        def fallback() -> Dict[str, Any]:
            return {
                "problem_summary": original_narrative[:200] + ("..." if len(original_narrative) > 200 else ""),
                "category": category,
                "problem_type": f"{category} Infrastructure Issue",
                "severity": "medium",
                "affected_group": "Local Residents",
                "reported_impact": original_narrative,
                "location_mentions": [loc for loc in [locality, district, state] if loc],
                "key_entities": [category, district, state],
                "evidence_requirements": [f"Public data regarding {category} in {district}, {state}"]
            }

        if not self._client:
            return fallback(), "FALLBACK"

        prompt = f"""
        You are a civic intelligence AI assistant for NagrikLens AI.
        Analyze the following citizen infrastructure complaint and return a STRICT JSON object (no markdown, no code blocks):

        Citizen Narrative: "{original_narrative}"
        Selected Category: "{category}"
        Location: Locality={locality or 'N/A'}, District={district}, State={state}

        Return JSON matching this schema:
        {{
          "problem_summary": "Concise 1-2 sentence summary of the issue",
          "category": "Standard category name",
          "problem_type": "Specific sub-type of problem",
          "severity": "low | medium | high | critical",
          "affected_group": "Who is impacted",
          "reported_impact": "Detailed impact statement",
          "location_mentions": ["list of locations mentioned"],
          "key_entities": ["key infrastructure or government programs mentioned"],
          "evidence_requirements": ["what official public data points would verify this report"]
        }}
        """
        try:
            response = self._client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            result = json.loads(text.strip())
            if not isinstance(result, dict):
                raise ValueError("Gemini extraction must be a JSON object")
            return result, "COMPLETED"
        except Exception:
            logger.warning("Gemini structured extraction failed; using local fallback.")
            return fallback(), "FAILED"

    def generate_grounded_analysis(self, report_narrative: str, structured_report: Dict[str, Any], retrieved_evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Grounds Gemini analysis strictly on supplied public evidence records.
        Does NOT invent missing data, costs, or statistics.
        """
        if not retrieved_evidence:
            return {
                "summary": "No verified public evidence was retrieved matching the specific district and category parameters.",
                "observations": [],
                "evidence_used": [],
                "limitations": [
                    "Public evidence search returned zero records for the specified location/category filter.",
                    "Grounding cannot verify citizen claims against public database records without matching dataset entries."
                ],
                "evidence_coverage": "INSUFFICIENT"
            }

        if not self._client:
            evidence_ids = [e.get("evidence_identifier", e.get("id")) for e in retrieved_evidence]
            obs = []
            for ev in retrieved_evidence[:3]:
                obs.append({
                    "observation": f"Verified public record '{ev.get('title')}' from {ev.get('source_organization')} records metric: {ev.get('metric_name', 'Value')} = {ev.get('metric_value', 'N/A')}.",
                    "evidence_id": ev.get("evidence_identifier")
                })
            return {
                "summary": f"Retrieved {len(retrieved_evidence)} public evidence record(s) relevant to {structured_report.get('category')} in {structured_report.get('location_mentions', ['this area'])}.",
                "observations": obs,
                "evidence_used": evidence_ids,
                "limitations": [
                    "Analysis grounded using rule-based local evidence matching (Gemini API key not configured)."
                ],
                "evidence_coverage": "STRONG" if len(retrieved_evidence) >= 2 else "PARTIAL"
            }

        evidence_formatted = []
        for idx, ev in enumerate(retrieved_evidence):
            evidence_formatted.append(
                f"--- EVIDENCE RECORD [{ev.get('evidence_identifier')}] ---\n"
                f"Title: {ev.get('title')}\n"
                f"Source: {ev.get('source_name')} ({ev.get('source_organization')})\n"
                f"Location: {ev.get('district')}, {ev.get('state')}\n"
                f"Metric: {ev.get('metric_name')} = {ev.get('metric_value')}\n"
                f"Details: {ev.get('description')}\n"
                f"Raw Text: {ev.get('raw_text', '')}\n"
            )

        prompt = f"""
        You are NagrikLens AI RAG Engine. Analyze this citizen complaint using ONLY the provided verified public evidence below.

        CRITICAL GROUNDING RULES:
        1. Only use supplied evidence records for factual external claims.
        2. Never invent statistics, datasets, sources, government costs, or infrastructure conditions not present in the evidence.
        3. If evidence is insufficient to verify an aspect of the complaint, state "Insufficient evidence".
        4. Reference the exact evidence identifier (e.g. [EVD-000123]) for every observation.

        Citizen Report Narrative: "{report_narrative}"
        Structured Problem: {json.dumps(structured_report)}

        Retrieved Public Evidence Records:
        {"\n".join(evidence_formatted)}

        Return a STRICT JSON object (no markdown format wrapper):
        {{
          "summary": "High-level evidence-grounded summary",
          "observations": [
             {{ "observation": "Factual statement referencing evidence", "evidence_id": "EVD-XXXXXX" }}
          ],
          "evidence_used": ["list of evidence_identifiers used"],
          "limitations": ["list of facts that could NOT be verified due to missing evidence"],
          "evidence_coverage": "STRONG | PARTIAL | INSUFFICIENT"
        }}
        """
        try:
            response = self._client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt
            )
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            return json.loads(text.strip())
        except Exception as e:
            logger.error(f"Gemini grounded analysis failed: {e}")
            evidence_ids = [e.get("evidence_identifier") for e in retrieved_evidence]
            return {
                "summary": "Public evidence was retrieved, but Gemini RAG generation encountered an error.",
                "observations": [],
                "evidence_used": evidence_ids,
                "limitations": ["AI analysis service error"],
                "evidence_coverage": "PARTIAL"
            }

gemini_service = GeminiService()
