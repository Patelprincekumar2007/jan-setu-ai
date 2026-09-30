import { apiFetchRoot } from './client';

export interface DatasetItem {
  dataset_id: string;
  title: string;
  description?: string | null;
  source_name: string;
  source_url?: string | null;
  publisher?: string | null;
  data_type: string;
  geographic_scope: string;
  geographic_level: string;
  category: string;
  year?: number | null;
  period?: string | null;
  last_updated?: string | null;
  license: string;
  ingestion_status: string;
  record_count: number;
  retrieval_method?: string | null;
  source_format?: string | null;
  notes?: string | null;
  ingested_at?: string | null;
  created_at: string;
}

export interface DatasetListResponse {
  total: number;
  datasets: DatasetItem[];
}

export async function fetchDatasetsApi(): Promise<DatasetListResponse> {
  return apiFetchRoot('/api/datasets');
}

export async function fetchDatasetByIdApi(datasetId: string): Promise<DatasetItem> {
  return apiFetchRoot(`/api/datasets/${datasetId}`);
}
