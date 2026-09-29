import { apiFetch } from './client';

export interface PriorityFactor {
  name: string;
  status: string;
  value?: number;
  weight: number;
}

export interface PrioritySignal {
  id: string;
  report_id: string;
  score?: number;
  status: string;
  factors: PriorityFactor[];
  explanation: string;
  created_at: string;
}

export async function fetchReportPriorityApi(reportId: string): Promise<PrioritySignal> {
  return apiFetch(`/priority/report/${reportId}`);
}
