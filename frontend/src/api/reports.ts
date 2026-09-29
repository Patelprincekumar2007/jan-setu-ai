import { apiFetch } from './client';

export interface ReportCreateInput {
  title: string;
  original_narrative: string;
  category: string;
  subcategory?: string;
  state: string;
  district: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  severity?: string;
  language?: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  original_narrative: string;
  ai_structured_report?: any;
  language: string;
  category: string;
  subcategory?: string;
  state: string;
  district: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  is_demo: string;
  created_at: string;
  updated_at: string;
}

export interface CitizenRequestInput {
  citizen_request: string;
  state: string;
  district: string;
  locality: string;
  category: string;
  affected_household_count?: number;
}

export interface CitizenRequestDetail {
  reference_id: string;
  citizen_request: string;
  location: {
    state: string;
    district: string;
    locality: string;
  };
  category: string;
  affected_household_count?: number;
  status: string;
  ai_extraction_status: string;
  language?: string;
  problem_summary?: string;
  severity?: string;
  affected_group?: string;
  location_hint?: string;
  retrieval_status: string;
  evidence_count: number;
  created_at: string;
}

export interface KnowledgeEvidenceDetail {
  evidence_id: string;
  dataset_id: string;
  record_id: string;
  title: string;
  content: string;
  state: string;
  district: string;
  locality?: string;
  category: string;
  metric_name: string;
  metric_value?: number;
  unit?: string;
  year?: number;
  period?: string;
  geographic_level: string;
  source_name: string;
  source_url?: string;
  source_reference: string;
  publisher?: string;
  license?: string;
  last_updated?: string;
  notes?: string;
  created_at?: string;
}

export interface RequestEvidenceMatchItem {
  evidence: KnowledgeEvidenceDetail;
  retrieval_method: string;
  rank: number;
  similarity_score: number;
  metadata_match_level: number;
}

export interface RequestEvidenceResponse {
  reference_id: string;
  retrieval_status: string;
  evidence_count: number;
  results: RequestEvidenceMatchItem[];
}

export interface GroundedObservationItem {
  statement: string;
  evidence_ids: string[];
}

export interface GroundedAnalysisPayload {
  summary: string;
  observations: GroundedObservationItem[];
  evidence_used: string[];
  evidence_gaps: string[];
  source_references: string[];
  limitations: string[];
}

export interface GroundedAnalysisResponse {
  reference_id: string;
  model_name: string;
  status: string;
  analysis: GroundedAnalysisPayload;
  created_at: string;
}

export async function createReportApi(input: ReportCreateInput): Promise<Report> {
  return apiFetch('/reports', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchReportsApi(filters?: { state?: string; district?: string; category?: string; severity?: string; status?: string }): Promise<Report[]> {
  const query = new URLSearchParams();
  if (filters?.state) query.append('state', filters.state);
  if (filters?.district) query.append('district', filters.district);
  if (filters?.category) query.append('category', filters.category);
  if (filters?.severity) query.append('severity', filters.severity);
  if (filters?.status) query.append('status', filters.status);

  const queryString = query.toString();
  return apiFetch(`/reports${queryString ? `?${queryString}` : ''}`);
}

export async function fetchMyReportsApi(): Promise<Report[]> {
  return apiFetch('/reports/me');
}

export async function fetchReportByIdApi(reportId: string): Promise<Report> {
  return apiFetch(`/reports/${reportId}`);
}

export async function triggerReportAnalysisApi(reportId: string): Promise<any> {
  return apiFetch(`/reports/${reportId}/analyze`, { method: 'POST' });
}

// Phase 2 Step 3C-3 & 3C-4 API integrations
export async function submitCitizenRequestApi(input: CitizenRequestInput): Promise<{ reference_id: string; status: string; message: string }> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const rawBase = baseUrl.replace(/\/api\/v1\/?$/, '');
  const response = await fetch(`${rawBase}/api/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchCitizenRequestByRefApi(refId: string): Promise<CitizenRequestDetail> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const rawBase = baseUrl.replace(/\/api\/v1\/?$/, '');
  const response = await fetch(`${rawBase}/api/requests/${refId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchCitizenRequestEvidenceApi(refId: string): Promise<RequestEvidenceResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const rawBase = baseUrl.replace(/\/api\/v1\/?$/, '');
  const response = await fetch(`${rawBase}/api/requests/${refId}/evidence`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Evidence request failed' }));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export async function triggerGroundedAnalysisApi(refId: string): Promise<GroundedAnalysisResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const rawBase = baseUrl.replace(/\/api\/v1\/?$/, '');
  const response = await fetch(`${rawBase}/api/requests/${refId}/analysis`, {
    method: 'POST',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Analysis generation failed' }));
    throw new Error(errorData.detail || `Analysis generation failed with status ${response.status}`);
  }
  return response.json();
}
