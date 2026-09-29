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
