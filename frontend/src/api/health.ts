import { apiFetch } from './client';

export interface SystemHealth {
  status: string;
  timestamp: string;
  environment: string;
  services: {
    api: string;
    database: string;
    gemini: string;
    embedding_model: string;
    faiss: string;
    storage: string;
  };
}

export async function fetchHealthApi(): Promise<SystemHealth> {
  return apiFetch('/health');
}
