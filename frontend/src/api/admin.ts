import { apiFetch } from './client';

export async function ingestDatasetApi(datasetId: string): Promise<{ status: string; message: string }> {
  return apiFetch(`/admin/datasets/${datasetId}/ingest`, { method: 'POST' });
}

export async function syncAllDatasetsApi(): Promise<{ status: string; synced_count: number; message: string }> {
  return apiFetch('/admin/datasets/sync', { method: 'POST' });
}
