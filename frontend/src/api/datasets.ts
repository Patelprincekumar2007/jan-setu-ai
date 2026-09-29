import { apiFetch } from './client';

export interface Dataset {
  id: string;
  name: string;
  organization: string;
  description?: string;
  source_url?: string;
  dataset_identifier: string;
  category: string;
  geographic_scope: string;
  time_period?: string;
  record_count: number;
  ingestion_status: string;
  verification_status: string;
  is_demo: string;
  created_at: string;
  updated_at: string;
}

export async function fetchDatasetsApi(): Promise<Dataset[]> {
  return apiFetch('/datasets');
}

export async function fetchDatasetByIdApi(datasetId: string): Promise<Dataset> {
  return apiFetch(`/datasets/${datasetId}`);
}
