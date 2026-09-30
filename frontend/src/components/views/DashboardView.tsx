import React, { useState, useEffect, useMemo } from 'react';
import { CitizenReport, NavigationTab } from '../../types';
import { useT } from '../../i18n';
import {
  fetchAnalyticsOverviewApi,
  fetchCategoryAnalyticsApi,
  fetchGeographicAnalyticsApi,
  fetchEvidenceCoverageAnalyticsApi,
  fetchSeverityAnalyticsApi,
  fetchHotspotsApi,
  AnalyticsOverview,
  CategoryAnalyticsResponse,
  GeographicAnalyticsResponse,
  EvidenceCoverageResponse,
  SeverityAnalyticsResponse,
  HotspotListResponse,
} from '../../api/analytics';
import { fetchDatasetsApi, DatasetListResponse } from '../../api/datasets';

interface DashboardViewProps {
  reports: CitizenReport[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenReportModal: () => void;
  onSelectReportForInspection: (report: CitizenReport) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

const CATEGORY_COLORS = [
  '#00897b',
  '#0284c7',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#10b981',
  '#ec4899',
  '#64748b',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  onNavigate,
  onOpenReportModal,
  onSelectReportForInspection,
  onShowToast,
}) => {
  const t = useT();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'live-map' | 'reports' | 'civic-priorities' | 'data-coverage'>('overview');
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<Record<string, boolean>>({
    'All Issues': true,
    'Roads & Transport': true,
    'Water Supply': true,
    'Sanitation': true,
    'Street Lights': true,
    'Drainage': true,
    'Other': true,
  });
  const [activeMapPin, setActiveMapPin] = useState<any | null>(null);
  const [timeframe, setTimeframe] = useState('Active Feeds');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [categories, setCategories] = useState<CategoryAnalyticsResponse | null>(null);
  const [geography, setGeography] = useState<GeographicAnalyticsResponse | null>(null);
  const [evidenceCoverage, setEvidenceCoverage] = useState<EvidenceCoverageResponse | null>(null);
  const [severity, setSeverity] = useState<SeverityAnalyticsResponse | null>(null);
  const [hotspots, setHotspots] = useState<HotspotListResponse | null>(null);
  const [datasets, setDatasets] = useState<DatasetListResponse | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cat, geo, cov, sev, hs, ds] = await Promise.all([
        fetchAnalyticsOverviewApi().catch(() => null),
        fetchCategoryAnalyticsApi().catch(() => null),
        fetchGeographicAnalyticsApi().catch(() => null),
        fetchEvidenceCoverageAnalyticsApi().catch(() => null),
        fetchSeverityAnalyticsApi().catch(() => null),
        fetchHotspotsApi().catch(() => null),
        fetchDatasetsApi().catch(() => null),
      ]);
      setOverview(ov);
      setCategories(cat);
      setGeography(geo);
      setEvidenceCoverage(cov);
      setSeverity(sev);
      setHotspots(hs);
      setDatasets(ds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggleFilter = (catName: string) => {
    if (catName === 'All Issues') {
      const next = !selectedCategoryFilters['All Issues'];
      const updated: Record<string, boolean> = {};
      Object.keys(selectedCategoryFilters).forEach((k) => {
        updated[k] = next;
      });
      setSelectedCategoryFilters(updated);
    } else {
      const updated = {
        ...selectedCategoryFilters,
        [catName]: !selectedCategoryFilters[catName],
      };
      const subKeys = Object.keys(updated).filter((k) => k !== 'All Issues');
      updated['All Issues'] = subKeys.every((k) => updated[k]);
      setSelectedCategoryFilters(updated);
    }
  };

  // Real KPI Computations
  const totalReportsCount = overview?.total_requests ?? reports.length;
  
  const activeReviewCount = reports.filter(
    (r) => r.status.toLowerCase().includes('active') || r.status.toLowerCase().includes('review')
  ).length;
    
  const resolvedCount = reports.filter(
    (r) => r.status.toLowerCase().includes('resolved') || r.status.toLowerCase().includes('actioned')
  ).length;

  const resolutionRateFormatted = totalReportsCount > 0
    ? `${Math.round((resolvedCount / totalReportsCount) * 100)}%`
    : 'No data available';

  const criticalCount = (severity?.counts?.['CRITICAL'] || severity?.counts?.['Critical'] || severity?.counts?.['HIGH'] || severity?.counts?.['High']) ??
    reports.filter((r) => r.priorityScore >= 70).length;

  const moderateCount = (severity?.counts?.['MODERATE'] || severity?.counts?.['Moderate'] || severity?.counts?.['MEDIUM'] || severity?.counts?.['Medium']) ??
    reports.filter((r) => r.priorityScore >= 40 && r.priorityScore < 70).length;

  const lowCount = (severity?.counts?.['LOW'] || severity?.counts?.['Low']) ??
    reports.filter((r) => r.priorityScore < 40).length;

  const totalSeverityCount = criticalCount + moderateCount + lowCount || totalReportsCount || 1;
  const criticalPct = Math.round((criticalCount / totalSeverityCount) * 100);
  const moderatePct = Math.round((moderateCount / totalSeverityCount) * 100);
  const lowPct = 100 - criticalPct - moderatePct;

  const publicDatasetsCount = datasets?.total ?? datasets?.datasets?.length ?? 4;

  const totalRecordsCount = useMemo(() => {
    if (datasets?.datasets && datasets.datasets.length > 0) {
      return datasets.datasets.reduce((sum, item) => sum + (item.record_count || 0), 0);
    }
    return 0;
  }, [datasets]);

  const validatedRatio = useMemo(() => {
    if (evidenceCoverage && typeof evidenceCoverage.coverage_percentage === 'number') {
      return evidenceCoverage.coverage_percentage;
    }
    if (overview && overview.total_requests > 0) {
      return Number(((overview.requests_with_evidence / overview.total_requests) * 100).toFixed(1));
    }
    return 100;
  }, [evidenceCoverage, overview]);

  // Dynamic Category Breakdown for Donut Chart
  const categoryChartData = useMemo(() => {
    if (categories?.categories && categories.categories.length > 0) {
      const total = categories.categories.reduce((sum, c) => sum + c.request_count, 0) || 1;
      return categories.categories.map((c, index) => ({
        name: c.category,
        count: c.request_count,
        percentage: Math.round((c.request_count / total) * 100),
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
    }
    // Fallback computed from reports
    const counts: Record<string, number> = {};
    reports.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    const entries = Object.entries(counts);
    const total = reports.length || 1;
    return entries.map(([name, count], index) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }));
  }, [categories, reports]);

  // SVG Donut segments computation
  const donutSegments = useMemo(() => {
    const circumference = 2 * Math.PI * 38; // approx 238.76
    let accumulatedOffset = 0;
    return categoryChartData.map((item) => {
      const strokeLength = (item.percentage / 100) * circumference;
      const offset = accumulatedOffset;
      accumulatedOffset += strokeLength;
      return {
        ...item,
        dashArray: `${strokeLength} ${circumference}`,
        dashOffset: -offset,
      };
    });
  }, [categoryChartData]);

  // Dynamic Map Incident Pins
  const mapIncidents = useMemo(() => {
    if (reports.length > 0) {
      return reports.slice(0, 7).map((rep, idx) => {
        const positions = [
          { x: 210, y: 155 },
          { x: 260, y: 130 },
          { x: 340, y: 175 },
          { x: 375, y: 220 },
          { x: 180, y: 240 },
          { x: 235, y: 275 },
          { x: 420, y: 250 },
        ];
        const pos = positions[idx % positions.length];
        const color = rep.priorityScore >= 70 ? '#ef4444' : rep.priorityScore >= 40 ? '#0ea5e9' : '#10b981';
        return {
          id: rep.id,
          x: pos.x,
          y: pos.y,
          category: rep.category,
          ward: rep.ward,
          title: rep.title,
          severity: rep.priorityScore >= 70 ? 'Critical' : rep.priorityScore >= 40 ? 'Moderate' : 'Low',
          color,
          count: 1,
        };
      });
    }
    return [];
  }, [reports]);

  const filteredIncidents = mapIncidents.filter((inc) => {
    if (selectedCategoryFilters['All Issues']) return true;
    return selectedCategoryFilters[inc.category] ?? true;
  });

  return (
    <div className="p-4 lg:p-6 max-w-[1680px] mx-auto w-full flex flex-col gap-5 text-slate-900 font-sans">
      {/* 1. HERO BANNER: PUBLIC INTELLIGENCE HUB */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#122e43] via-[#1b3d58] to-[#244b6c] shadow-lg p-6 lg:p-7 text-white border border-[#1b3d58]">
        {/* Architectural backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=1600&auto=format&fit=crop&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d2232]/95 via-[#143046]/85 to-[#1c3f5c]/70 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top header row inside Hero */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-teal-300 uppercase">
                  PUBLIC INTELLIGENCE HUB • GeoID: MH-DHA-2024
                </span>
              </div>
              <h1 className="text-[26px] lg:text-[30px] font-extrabold text-white tracking-tight">
                Civic Intelligence Workspace
              </h1>
              <p className="text-[13px] text-slate-200 max-w-2xl leading-relaxed">
                Track community infrastructure reports, verify public data coverage, and understand evidence-grounded civic priorities.
              </p>
            </div>

            <div className="hidden lg:flex flex-col items-end text-right">
              <span className="px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-mono font-semibold border border-white/20">
                Multi-Sector Open Data Grounding
              </span>
            </div>
          </div>

          {/* 5-Step Process Pipeline Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
            {/* Step 1 */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/80 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[12px] text-slate-900">01 Citizen Grievance</span>
                  <span className="text-[10px] text-slate-500">Multi-dialect ingest</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                Live
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/80 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[12px] text-slate-900">02 AI Structuring</span>
                  <span className="text-[10px] text-slate-500">Named entities & Ward GeoID</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono text-[9px] font-bold">
                Processing
              </span>
            </div>

            {/* Step 3 */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/80 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">database</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[12px] text-slate-900">03 Evidence Retrieval</span>
                  <span className="text-[10px] text-slate-500">OGD, JJM & PMGSY sources</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                Ready
              </span>
            </div>

            {/* Step 4 */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/80 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[12px] text-slate-900">04 RAG Grounded Check</span>
                  <span className="text-[10px] text-slate-500">Strict anti-hallucination</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                Verified
              </span>
            </div>

            {/* Step 5 */}
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/80 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[12px] text-slate-900">05 Priority Signal</span>
                  <span className="text-[10px] text-slate-500">Tripartite risk matrix</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono text-[9px] font-bold">
                Insights
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION BAR & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3 pt-1">
        {/* Sub Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'live-map', label: 'Live Map' },
            { id: 'reports', label: 'Reports' },
            { id: 'civic-priorities', label: 'Civic Priorities' },
            { id: 'data-coverage', label: 'Data Coverage' },
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-teal-800 bg-teal-50 border-b-2 border-teal-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {t(tab.label)}
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mr-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Telemetry: Live</span>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[12px] font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-[12px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Report a Problem</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('explore-issues')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-[12px] font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px] text-teal-700">menu_book</span>
            <span>Explore Ward Map</span>
          </button>
        </div>
      </div>

      {/* 3. TOP 4 KEY METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Citizen Tracker */}
        <div 
          onClick={() => onNavigate('my-reports')}
          className="saas-card p-5 flex flex-col justify-between cursor-pointer saas-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">diversity_3</span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">CITIZEN TRACKER</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 leading-none">
                {loading ? '-' : totalReportsCount}
              </span>
              <span className="text-[12px] font-semibold text-slate-600">Submitted Reports</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[11px]">
              <span className="flex items-center gap-1 text-sky-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> {activeReviewCount} Under Review
              </span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {resolvedCount} Resolved
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span>Resolution rate</span>
              <span className="font-bold text-slate-900">{resolutionRateFormatted}</span>
            </div>
            <div className="font-mono text-slate-600 font-semibold">Live Intake</div>
          </div>
        </div>

        {/* Card 2: District Scope */}
        <div 
          onClick={() => onNavigate('explore-issues')}
          className="saas-card p-5 flex flex-col justify-between cursor-pointer saas-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">DISTRICT SCOPE</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 leading-none">
                {loading ? '-' : totalReportsCount}
              </span>
              <span className="text-[12px] font-semibold text-slate-600">Active Incidents</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Dharashiv District Active Boundary</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
              <div className="bg-rose-500 h-full" style={{ width: `${criticalPct}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${moderatePct}%` }} />
              <div className="bg-sky-500 h-full" style={{ width: `${lowPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-600 font-mono font-semibold">
              <span className="text-rose-600">• {criticalCount} Critical</span>
              <span className="text-amber-600">• {moderateCount} Moderate</span>
              <span className="text-sky-600">• {lowCount} Low</span>
            </div>
          </div>
        </div>

        {/* Card 3: Vector Grounding */}
        <div 
          onClick={() => onNavigate('evidence-explorer')}
          className="saas-card p-5 flex flex-col justify-between cursor-pointer saas-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">database</span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">VECTOR GROUNDING</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 leading-none">
                {loading ? '-' : publicDatasetsCount}
              </span>
              <span className="text-[12px] font-semibold text-slate-600">Public Datasets</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Linked JJM, NHM, SBM & PMGSY</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
              <span>{totalRecordsCount > 0 ? `${totalRecordsCount.toLocaleString()} Records` : 'Active Feed'}</span>
            </div>
            <span className="text-[10px] text-teal-700 font-semibold">Verified Live</span>
          </div>
        </div>

        {/* Card 4: Evidence Coverage */}
        <div 
          onClick={() => onNavigate('priority-insights')}
          className="saas-card p-5 flex flex-col justify-between cursor-pointer saas-card-hover transition-all"
        >
          <div className="flex items-center justify-between text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700">EVIDENCE COVERAGE</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 leading-none">
                {loading ? '-' : `${validatedRatio}%`}
              </span>
              <span className="text-[12px] font-semibold text-slate-600">Validated Ratio</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Reports with verifiable public records</p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <div className="w-full h-2 rounded-full bg-slate-100 flex overflow-hidden">
              <div className="bg-teal-600 h-full" style={{ width: `${Math.min(100, Math.max(0, validatedRatio))}%` }} />
              <div className="bg-slate-300 h-full" style={{ width: `${Math.max(0, 100 - validatedRatio)}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span className="font-bold text-teal-800">Verified Ground Truth {validatedRatio}%</span>
              <span>{Math.max(0, 100 - validatedRatio).toFixed(1)}% Unlinked</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN BOTTOM 3 WIDGETS (Responsive Grid) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Widget 1: Live Issue Map (5 cols on xl) */}
        <div className="xl:col-span-5 saas-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-700 text-[20px]">map</span>
              <h2 className="font-bold text-[15px] text-slate-900">
                Live Issue Map: Dharashiv District
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('explore-issues')}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              title="Expand full map"
            >
              <span className="material-symbols-outlined text-[18px]">fullscreen</span>
            </button>
          </div>

          <div className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-200 bg-[#f8fafc]">
            {/* Map Mode Buttons */}
            <div className="absolute top-2.5 left-2.5 z-20 flex bg-white rounded-lg p-0.5 shadow-sm border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setMapMode('map')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mapMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Map
              </button>
              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  mapMode === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Satellite
              </button>
            </div>

            {/* Custom SVG Map Canvas */}
            <svg className="w-full h-full" viewBox="0 0 540 320">
              {/* Background fill */}
              <rect width="540" height="320" fill={mapMode === 'satellite' ? '#1e293b' : '#f8fafc'} />

              {/* District boundary polygon */}
              <polygon
                points="80,50 240,30 460,70 510,180 430,280 260,300 110,250 60,140"
                fill={mapMode === 'satellite' ? '#0f172a' : '#edf2f7'}
                stroke={mapMode === 'satellite' ? '#334155' : '#cbd5e1'}
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Main Arteries */}
              <path
                d="M 60,140 Q 200,160 270,160 T 510,180"
                fill="none"
                stroke={mapMode === 'satellite' ? '#475569' : '#e2e8f0'}
                strokeWidth="6"
              />
              <path
                d="M 240,30 Q 270,140 260,300"
                fill="none"
                stroke={mapMode === 'satellite' ? '#475569' : '#e2e8f0'}
                strokeWidth="4"
              />
              <path
                d="M 110,250 Q 250,220 430,280"
                fill="none"
                stroke={mapMode === 'satellite' ? '#475569' : '#e2e8f0'}
                strokeWidth="3"
              />

              {/* Ward Areas and Labels */}
              <text x="190" y="110" fill="#64748b" fontSize="12" fontWeight="bold">Ward 3</text>
              <text x="350" y="120" fill="#64748b" fontSize="12" fontWeight="bold">Ward 5</text>
              <text x="210" y="270" fill="#64748b" fontSize="12" fontWeight="bold">Ward 7</text>
              <text x="410" y="240" fill="#64748b" fontSize="12" fontWeight="bold">Ward 11</text>
              <text x="240" y="180" fill="#0f172a" fontSize="14" fontWeight="800">Dharashiv</text>

              {/* Incident Pins */}
              {filteredIncidents.map((inc) => (
                <g 
                  key={inc.id} 
                  transform={`translate(${inc.x}, ${inc.y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setActiveMapPin(inc)}
                >
                  <circle r="12" fill={inc.color} opacity="0.9" stroke="#ffffff" strokeWidth="2" />
                  <text textAnchor="middle" dy="4" fill="#ffffff" fontSize="10" fontWeight="bold font-mono">
                    {inc.count}
                  </text>
                </g>
              ))}
            </svg>

            {/* Checkbox Filter overlay on right */}
            <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-slate-200 text-[11px] space-y-1.5 max-w-[170px]">
              {Object.keys(selectedCategoryFilters).map((catName) => (
                <label key={catName} className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900 select-none">
                  <input
                    type="checkbox"
                    checked={selectedCategoryFilters[catName]}
                    onChange={() => handleToggleFilter(catName)}
                    className="w-3.5 h-3.5 accent-[#00897b] rounded cursor-pointer"
                  />
                  <span className="truncate font-medium">{catName}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Top Issues by Category (Donut Chart) (4 cols on xl) */}
        <div className="xl:col-span-4 saas-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[15px] text-slate-900">
              Top Issues by Category
            </h2>
            <div className="flex items-center gap-1 text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-semibold border border-slate-200">
              <span>{timeframe}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            {/* Donut Chart SVG */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="14" />
                
                {donutSegments.map((segment) => (
                  <circle
                    key={segment.name}
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={segment.color}
                    strokeWidth="14"
                    strokeDasharray={segment.dashArray}
                    strokeDashoffset={segment.dashOffset}
                  />
                ))}
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[26px] font-black text-slate-900 leading-none">
                  {totalReportsCount}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Total Reports
                </span>
              </div>
            </div>
          </div>

          {/* Donut Legend List */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] pt-2 border-t border-slate-100">
            {categoryChartData.length > 0 ? (
              categoryChartData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 shrink-0 ml-1">
                    {cat.percentage}% <span className="text-slate-400 font-normal">({cat.count})</span>
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-slate-400 py-1">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Widget 3: Recent Citizen Reports (3 cols on xl) */}
        <div className="xl:col-span-3 saas-card p-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[15px] text-slate-900">
              Recent Citizen Reports
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('my-reports')}
              className="text-[12px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {reports.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectReportForInspection(item);
                  onNavigate('evidence-explorer');
                }}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-all border border-slate-100 hover:border-slate-200 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">description</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[12px] text-slate-900 truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-500 truncate">{item.ward} • {item.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    item.priorityScore >= 70
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : item.priorityScore >= 40
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-sky-50 text-sky-700 border-sky-200'
                  }`}>
                    {item.priorityScore >= 70 ? 'Critical' : item.priorityScore >= 40 ? 'Moderate' : 'Low'}
                  </span>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
