import { apiFetchRoot } from './client';

export interface CitizenRequestInput {
  citizen_request: string;
  category: string;
  state: string;
  district: string;
  locality?: string;
  affected_households?: number;
}

export interface CitizenRequestRecord extends CitizenRequestInput {
  reference_id: string;
  status: string;
  ai_extraction_status: string;
  extracted_data?: Record<string, unknown> | null;
  retrieval_status: string;
  retrieval_query?: string | null;
  evidence_count: number;
  created_at: string;
}

export interface RequestEvidence {
  evidence: {
    evidence_id: string;
    title: string;
    content: string;
    state: string;
    district: string;
    locality?: string | null;
    category: string;
    metric_name?: string | null;
    metric_value?: string | number | null;
    unit?: string | null;
    year?: number | null;
    period?: string | null;
    source_name: string;
    source_url?: string | null;
    source_reference?: string | null;
  };
  retrieval_method: string;
  rank: number;
  similarity_score?: number | null;
  metadata_match_level: number;
  source: {
    source_name: string;
    source_url?: string | null;
    source_reference?: string | null;
    publisher?: string | null;
  };
}

export interface RequestEvidenceResponse {
  reference_id: string;
  retrieval_status: string;
  evidence_count: number;
  results: RequestEvidence[];
}

export interface GroundedObservation {
  statement: string;
  evidence_ids: string[];
}

export interface GroundedAnalysis {
  summary: string;
  observations: GroundedObservation[];
  evidence_used: string[];
  evidence_gaps: string[];
  source_references: string[];
  limitations: string[];
}

export interface RequestAnalysisResponse {
  reference_id: string;
  status: string;
  model_name: string;
  analysis: GroundedAnalysis;
}

export interface PriorityFactorDetail {
  factor: string;
  raw_value?: number | null;
  normalized_value?: number | null;
  weight: number;
  available: boolean;
  contribution?: number | null;
  source?: string | null;
  evidence_ids: string[];
  explanation: string;
}

export interface PriorityAssessmentResponse {
  id?: number | null;
  request_reference_id: string;
  overall_priority: number;
  priority_band: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  methodology_version: string;
  evidence_count: number;
  factors: PriorityFactorDetail[];
  limitations: string[];
  generated_at: string;
}

export function createCitizenRequestApi(input: CitizenRequestInput): Promise<CitizenRequestRecord> {
  return apiFetchRoot('/api/requests', { method: 'POST', body: JSON.stringify(input) });
}

export function fetchCitizenRequestApi(referenceId: string): Promise<CitizenRequestRecord> {
  return apiFetchRoot(`/api/requests/${encodeURIComponent(referenceId)}`);
}

export function fetchRequestEvidenceApi(referenceId: string): Promise<RequestEvidenceResponse> {
  return apiFetchRoot(`/api/requests/${encodeURIComponent(referenceId)}/evidence`);
}

export function createRequestAnalysisApi(referenceId: string): Promise<RequestAnalysisResponse> {
  return apiFetchRoot(`/api/requests/${encodeURIComponent(referenceId)}/analysis`, { method: 'POST' });
}

export function fetchRequestPriorityApi(referenceId: string): Promise<PriorityAssessmentResponse> {
  return apiFetchRoot(`/api/requests/${encodeURIComponent(referenceId)}/priority`);
}

export function createRequestPriorityApi(referenceId: string): Promise<PriorityAssessmentResponse> {
  return apiFetchRoot(`/api/requests/${encodeURIComponent(referenceId)}/priority`, { method: 'POST' });
}