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

export async function fetchHealthApi(retries = 2, delayMs = 1500): Promise<SystemHealth> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await apiFetchRoot<SystemHealth>('/health');
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Health endpoint could not be reached.');
}

