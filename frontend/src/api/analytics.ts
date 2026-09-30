import { apiFetchRoot } from './client';

export interface AnalyticsOverview {
  total_requests: number;
  requests_with_evidence: number;
  requests_without_evidence: number;
  priority_assessments_generated: number;
  hotspot_groups: number;
  verified_datasets: number;
  evidence_records: number;
}

export interface CategoryDemandMetric {
  category: string;
  request_count: number;
  affected_households?: number | null;
  percentage: number;
}

export interface CategoryAnalyticsResponse {
  total_requests: number;
  categories: CategoryDemandMetric[];
}

export interface GeographicDemandMetric {
  state: string;
  district: string;
  locality?: string | null;
  request_count: number;
  affected_households?: number | null;
}

export interface GeographicAnalyticsResponse {
  total_locations: number;
  total_requests: number;
  locations: GeographicDemandMetric[];
}

export interface TimelinePoint {
  date: string;
  request_count: number;
}

export interface TimelineAnalyticsResponse {
  total_days: number;
  timeline: TimelinePoint[];
}

export interface EvidenceCoverageResponse {
  total_requests: number;
  requests_with_evidence: number;
  requests_without_evidence: number;
  coverage_percentage?: number | null;
  note: string;
}

export interface SeverityAnalyticsResponse {
  total_requests: number;
  counts: Record<string, number>;
}

export interface HotspotDetail {
  hotspot_id: string;
  state: string;
  district: string;
  locality?: string | null;
  category: string;
  request_count: number;
  affected_households?: number | null;
  evidence_count: number;
  severity_distribution: Record<string, number>;
  methodology_version: string;
  factors: {
    request_count: number;
    affected_households?: number | null;
    high_severity_request_count: number;
    evidence_coverage: number;
    category_concentration: number;
  };
  limitations: string[];
  created_at: string;
}

export interface HotspotListResponse {
  total_hotspots: number;
  methodology_version: string;
  hotspots: HotspotDetail[];
}

export function fetchAnalyticsOverviewApi(): Promise<AnalyticsOverview> {
  return apiFetchRoot('/api/analytics/overview');
}

export function fetchCategoryAnalyticsApi(district?: string): Promise<CategoryAnalyticsResponse> {
  const q = district ? `?district=${encodeURIComponent(district)}` : '';
  return apiFetchRoot(`/api/analytics/categories${q}`);
}

export function fetchGeographicAnalyticsApi(): Promise<GeographicAnalyticsResponse> {
  return apiFetchRoot('/api/analytics/geography');
}

export function fetchTimelineAnalyticsApi(): Promise<TimelineAnalyticsResponse> {
  return apiFetchRoot('/api/analytics/timeline');
}

export function fetchEvidenceCoverageAnalyticsApi(): Promise<EvidenceCoverageResponse> {
  return apiFetchRoot('/api/analytics/evidence-coverage');
}

export function fetchSeverityAnalyticsApi(): Promise<SeverityAnalyticsResponse> {
  return apiFetchRoot('/api/analytics/severity');
}

export function fetchHotspotsApi(category?: string, district?: string): Promise<HotspotListResponse> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (district) params.append('district', district);
  const q = params.toString() ? `?${params.toString()}` : '';
  return apiFetchRoot(`/api/hotspots${q}`);
}
