import { apiFetchRoot } from './client';

export interface SystemHealth {
  status: string;
  service?: string;
  environment: string;
  timestamp?: string;
  services?: {
    api?: string;
    database?: string;
    gemini?: string;
    embedding_model?: string;
    faiss?: string;
    storage?: string;
  };
}

export async function fetchHealthApi(): Promise<SystemHealth> {
  return apiFetchRoot<SystemHealth>('/health');
}

