import { apiFetch } from './client';

export interface EvidenceSearchInput {
  query: string;
  state?: string;
  district?: string;
  category?: string;
  top_k?: number;
}

export interface EvidenceItem {
  id: string;
  dataset_id: string;
  evidence_identifier: string;
  source_name: string;
  source_organization: string;
  source_url?: string;
  title: string;
  description: string;
  state: string;
  district: string;
  locality?: string;
  category: string;
  reporting_period?: string;
  metric_name?: string;
  metric_value?: string;
  raw_text?: string;
  extra_metadata?: any;
  verification_status: string;
  created_at: string;
  similarity_score?: number;
}

export interface EvidenceSearchResult {
  results: EvidenceItem[];
  evidence_coverage: 'STRONG' | 'PARTIAL' | 'INSUFFICIENT';
  total: number;
}

export async function searchEvidenceApi(input: EvidenceSearchInput): Promise<EvidenceSearchResult> {
  return apiFetch('/evidence/search', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
