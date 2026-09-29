import { apiFetch } from './client';

export interface AnalyticsOverview {
  total_reports: number;
  active_reports: number;
  analyzed_reports: number;
  resolved_reports: number;
  evidence_backed_reports: number;
  insufficient_evidence_reports: number;
  total_datasets: number;
  total_evidences: number;
}

export async function fetchAnalyticsOverviewApi(): Promise<AnalyticsOverview> {
  return apiFetch('/analytics/overview');
}

export async function fetchCategoryBreakdownApi(): Promise<{ category: string; count: number }[]> {
  return apiFetch('/analytics/categories');
}

export async function fetchGeographicBreakdownApi(): Promise<{ state: string; district: string; count: number }[]> {
  return apiFetch('/analytics/geography');
}

export async function fetchSeverityBreakdownApi(): Promise<{ severity: string; count: number }[]> {
  return apiFetch('/analytics/severity');
}

export async function fetchEvidenceStatsApi(): Promise<{ coverage: string; count: number }[]> {
  return apiFetch('/analytics/evidence');
}
