export type NavigationTab =
  | 'dashboard'
  | 'report-a-problem'
  | 'explore-issues'
  | 'evidence-explorer'
  | 'priority-insights'
  | 'data-sources'
  | 'analytics'
  | 'my-reports'
  | 'how-it-works'
  | 'tech-architecture'
  | 'system-monitoring'
  | 'settings';

export type UserRole = 'Citizen' | 'Analyst' | 'Admin';

export type AppLanguage = 'EN' | 'HI' | 'GU';

export interface CitizenReport {
  id: string;
  ticketId: string;
  category: 'Water' | 'Roads' | 'Healthcare' | 'Electricity' | 'Sanitation' | 'Education' | 'Transport' | 'Housing';
  title: string;
  narrative: string;
  location: string;
  ward: string;
  geoId: string;
  coordinates: [number, number];
  timestamp: string;
  status: 'Active Under Review' | 'Analyzing Evidence' | 'Resolved / Actioned' | 'Queued';
  priorityScore: number;
  priorityLabel: string;
  similarityScore: number;
  groundingDoc: string;
  groundingAgency: string;
  evidenceFound: boolean;
  householdsAffected?: number;
  facilityName?: string;
  slaRemaining?: string;
}

export interface PipelineStep {
  stepNumber: number;
  stepId: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  stateBadge: string;
  icon: string;
}

export interface PublicDataset {
  id: string;
  code: string;
  name: string;
  agency: string;
  recordsCount: number;
  lastUpdated: string;
  matchAccuracy: string;
  status: 'Verified Live' | 'Syncing' | 'Pending Gazette';
  vectorHash: string;
  description: string;
  category: string;
}
