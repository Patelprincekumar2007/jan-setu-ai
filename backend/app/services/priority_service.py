import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class PriorityService:
    """
    Deterministic analytical priority engine.
    Calculates priority signals transparently with explicit factor breakdown.
    Does NOT use generative AI to guess numerical scores.
    """
    SEVERITY_WEIGHT = 0.30
    VULNERABILITY_WEIGHT = 0.30
    INFRASTRUCTURE_GAP_WEIGHT = 0.25
    EVIDENCE_COVERAGE_WEIGHT = 0.15

    SEVERITY_MAPPING = {
        "low": 0.25,
        "medium": 0.50,
        "high": 0.75,
        "critical": 1.00
    }

    COVERAGE_MAPPING = {
        "STRONG": 1.00,
        "PARTIAL": 0.50,
        "INSUFFICIENT": 0.00
    }

    def calculate_priority(
        self,
        severity: str,
        evidence_coverage: str,
        retrieved_evidences: List[Dict[str, Any]],
        vulnerability_index: Optional[float] = None
    ) -> Dict[str, Any]:
        
        factors = []
        supported_weight = 0.0
        weighted_score_sum = 0.0

        # 1. Reported Severity (30%)
        sev_key = (severity or "medium").lower()
        sev_val = self.SEVERITY_MAPPING.get(sev_key, 0.50)
        factors.append({
            "name": "Reported Severity",
            "status": "supported",
            "value": round(sev_val * 100, 1),
            "weight": self.SEVERITY_WEIGHT
        })
        weighted_score_sum += (sev_val * 100) * self.SEVERITY_WEIGHT
        supported_weight += self.SEVERITY_WEIGHT

        # 2. Evidence Coverage (15%)
        cov_key = (evidence_coverage or "INSUFFICIENT").upper()
        cov_val = self.COVERAGE_MAPPING.get(cov_key, 0.0)
        cov_status = "supported" if cov_key in ("STRONG", "PARTIAL") else "insufficient_evidence"
        factors.append({
            "name": "Evidence Coverage",
            "status": cov_status,
            "value": round(cov_val * 100, 1) if cov_status == "supported" else None,
            "weight": self.EVIDENCE_COVERAGE_WEIGHT
        })
        if cov_status == "supported":
            weighted_score_sum += (cov_val * 100) * self.EVIDENCE_COVERAGE_WEIGHT
            supported_weight += self.EVIDENCE_COVERAGE_WEIGHT

        # 3. Infrastructure Gap (25%)
        gap_val = None
        gap_status = "insufficient_evidence"
        if retrieved_evidences:
            # Calculate gap based on metric values in retrieved evidence if present
            gap_scores = []
            for ev in retrieved_evidences:
                raw = (ev.get("raw_text") or "").lower()
                metric = str(ev.get("metric_value", "")).lower()
                if "critical" in raw or "deficit" in raw or "damaged" in raw or "high" in metric:
                    gap_scores.append(0.85)
                elif "moderate" in raw or "partial" in raw:
                    gap_scores.append(0.55)
                elif "normal" in raw or "good" in raw:
                    gap_scores.append(0.25)

            if gap_scores:
                gap_val = sum(gap_scores) / len(gap_scores)
                gap_status = "supported"

        factors.append({
            "name": "Infrastructure Deficit Gap",
            "status": gap_status,
            "value": round(gap_val * 100, 1) if gap_val is not None else None,
            "weight": self.INFRASTRUCTURE_GAP_WEIGHT
        })
        if gap_status == "supported" and gap_val is not None:
            weighted_score_sum += (gap_val * 100) * self.INFRASTRUCTURE_GAP_WEIGHT
            supported_weight += self.INFRASTRUCTURE_GAP_WEIGHT

        # 4. Socio-Economic Vulnerability Index (30%)
        vuln_status = "missing_vulnerability_data"
        if vulnerability_index is not None:
            vuln_status = "supported"
            factors.append({
                "name": "Socio-Economic Vulnerability",
                "status": "supported",
                "value": round(vulnerability_index * 100, 1),
                "weight": self.VULNERABILITY_WEIGHT
            })
            weighted_score_sum += (vulnerability_index * 100) * self.VULNERABILITY_WEIGHT
            supported_weight += self.VULNERABILITY_WEIGHT
        else:
            factors.append({
                "name": "Socio-Economic Vulnerability",
                "status": "missing_vulnerability_data",
                "value": None,
                "weight": self.VULNERABILITY_WEIGHT
            })

        # Calculate final normalized priority score
        if supported_weight > 0:
            final_score = round(weighted_score_sum / supported_weight, 1)
        else:
            final_score = None

        if cov_key == "INSUFFICIENT" or supported_weight < 0.4:
            signal_status = "insufficient_evidence"
            explanation = "Priority signal is unverified due to insufficient public evidence matching the report parameters."
        else:
            signal_status = "supported"
            explanation = f"Priority signal evaluated at {final_score}/100 based on {round(supported_weight*100)}% verifiable factor coverage."

        return {
            "score": final_score if signal_status == "supported" else None,
            "status": signal_status,
            "factors": factors,
            "explanation": explanation
        }

priority_service = PriorityService()
