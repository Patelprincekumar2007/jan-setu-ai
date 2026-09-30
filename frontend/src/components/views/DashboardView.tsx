import React, { useState, useEffect } from 'react';
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
import { CitizenRequestRecord } from '../../api/requests';

interface DashboardViewProps {
  reports: CitizenReport[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenReportModal: () => void;
  onSelectReportForInspection: (report: CitizenReport) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenReportModal,
  onShowToast,
}) => {
  const t = useT();
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
        fetchAnalyticsOverviewApi(),
        fetchCategoryAnalyticsApi(),
        fetchGeographicAnalyticsApi(),
        fetchEvidenceCoverageAnalyticsApi(),
        fetchSeverityAnalyticsApi(),
        fetchHotspotsApi(),
        fetchDatasetsApi(),
      ]);
      setOverview(ov);
      setCategories(cat);
      setGeography(geo);
      setEvidenceCoverage(cov);
      setSeverity(sev);
      setHotspots(hs);
      setDatasets(ds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      {/* Header & Status Banner */}
      <header className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            <span>Verifiable Public Decision-Support Layer</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            {t('Executive Decision-Support Dashboard')}
          </h1>
          <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
            {t('Real-time civic demand aggregation correlated with verified open government datasets. Deterministic scoring without synthetic approximations.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-[13px] font-semibold border border-[#dce9ff] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Refresh Metrics</span>
          </button>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#006a61] text-[#ffffff] text-[13px] font-semibold hover:bg-[#005049] transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Report Issue</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-[#fffbfa] p-4 rounded-xl border border-[#ba1a1a]/30 text-[#ba1a1a] text-[13px] flex items-center justify-between">
          <span>Error loading dashboard metrics: {error}</span>
          <button onClick={loadDashboardData} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* 1. OVERVIEW KPI CARDS */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#76777d] uppercase">Total Requests</span>
          <div className="text-[28px] font-bold text-[#0b1c30] mt-1">{overview ? overview.total_requests : (loading ? '-' : 0)}</div>
          <span className="text-[11px] text-[#45464d] mt-1">Citizen Submissions</span>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#006a61] uppercase">Evidence Linked</span>
          <div className="text-[28px] font-bold text-[#006a61] mt-1">{overview ? overview.requests_with_evidence : (loading ? '-' : 0)}</div>
          <span className="text-[11px] text-[#45464d] mt-1">Backed by Public Data</span>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#ba1a1a] uppercase">Pending Evidence</span>
          <div className="text-[28px] font-bold text-[#ba1a1a] mt-1">{overview ? overview.requests_without_evidence : (loading ? '-' : 0)}</div>
          <span className="text-[11px] text-[#45464d] mt-1">No Matching Records</span>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#76777d] uppercase">Priority Assessed</span>
          <div className="text-[28px] font-bold text-[#0b1c30] mt-1">{overview ? overview.priority_assessments_generated : (loading ? '-' : 0)}</div>
          <span className="text-[11px] text-[#45464d] mt-1">Deterministic v1</span>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#76777d] uppercase">Hotspot Groups</span>
          <div className="text-[28px] font-bold text-[#0b1c30] mt-1">{overview ? overview.hotspot_groups : (loading ? '-' : 0)}</div>
          <span className="text-[11px] text-[#45464d] mt-1">Demand Clusters</span>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#76777d] uppercase">Public Datasets</span>
          <div className="text-[28px] font-bold text-[#0b1c30] mt-1">{overview ? overview.verified_datasets : (loading ? '-' : 0)}</div>
          <span className="text-[11px] text-[#45464d] mt-1">{overview?.evidence_records ?? 0} Evidence Items</span>
        </div>
      </section>

      {/* 2 & 3: CATEGORY DEMAND & GEOGRAPHIC DEMAND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (5 Cols) */}
        <section className="lg:col-span-5 bg-[#ffffff] p-5 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Demand by Civic Category</h2>
            <span className="text-[11px] font-mono text-[#76777d]">Actual database totals</span>
          </div>

          {!categories || categories.categories.length === 0 ? (
            <p className="text-[13px] text-[#45464d] py-6 text-center border border-dashed border-[#dce9ff] rounded-lg">
              No citizen requests submitted yet.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.categories.map((c) => (
                <div key={c.category} className="space-y-1">
                  <div className="flex justify-between text-[13px] font-medium text-[#0b1c30]">
                    <span>{t(c.category)}</span>
                    <span className="font-mono text-[#45464d]">
                      {c.request_count} requests ({c.percentage}%)
                      {c.affected_households ? ` · ${c.affected_households} HH` : ''}
                    </span>
                  </div>
                  <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#006a61] h-full" style={{ width: `${Math.min(100, c.percentage)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Geographic Demand Clusters (7 Cols) */}
        <section className="lg:col-span-7 bg-[#ffffff] p-5 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#0b1c30]">Geographic Demand Aggregates</h2>
              <p className="text-[11px] text-[#45464d]">Factual counts aggregated by administrative territory</p>
            </div>
            <span className="text-[11px] font-mono text-[#76777d]">{geography?.total_locations ?? 0} clusters</span>
          </div>

          {!geography || geography.locations.length === 0 ? (
            <p className="text-[13px] text-[#45464d] py-6 text-center border border-dashed border-[#dce9ff] rounded-lg">
              No geographic demand records available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px] border border-[#e5eeff]">
                <thead className="bg-[#f8f9ff] text-[#45464d] text-[11px] uppercase border-b border-[#e5eeff]">
                  <tr>
                    <th className="p-2.5">State</th>
                    <th className="p-2.5">District</th>
                    <th className="p-2.5">Locality / Ward</th>
                    <th className="p-2.5 text-right">Requests</th>
                    <th className="p-2.5 text-right">Affected Households</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5eeff]">
                  {geography.locations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-[#fbfcfe]">
                      <td className="p-2.5 font-medium text-[#0b1c30]">{loc.state}</td>
                      <td className="p-2.5">{loc.district}</td>
                      <td className="p-2.5 text-[#45464d]">{loc.locality || 'District-wide'}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-[#0b1c30]">{loc.request_count}</td>
                      <td className="p-2.5 text-right font-mono">{loc.affected_households !== null ? loc.affected_households : 'Not reported'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* 4 & 5: EVIDENCE COVERAGE & SEVERITY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Evidence Coverage Panel (6 Cols) */}
        <section className="lg:col-span-6 bg-[#ffffff] p-5 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Public Evidence Coverage</h2>
            <span className="text-[11px] font-mono text-[#006a61] font-semibold">
              {evidenceCoverage?.coverage_percentage !== null && evidenceCoverage?.coverage_percentage !== undefined
                ? `${evidenceCoverage.coverage_percentage}% Linked`
                : 'No Requests'}
            </span>
          </div>
          <p className="text-[12px] text-[#45464d]">
            Proportion of citizen submissions with matching verified public baseline metrics from JJM, NHM, SBM, or PMGSY.
          </p>

          <div className="w-full bg-[#eff4ff] h-3 rounded-full overflow-hidden flex mt-2">
            <div
              className="bg-[#006a61] h-full"
              style={{ width: `${evidenceCoverage?.coverage_percentage ?? 0}%` }}
            ></div>
            <div
              className="bg-[#dce9ff] h-full"
              style={{ width: `${100 - (evidenceCoverage?.coverage_percentage ?? 0)}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-[12px]">
            <div className="bg-[#eff4ff] p-2.5 rounded border border-[#dce9ff]">
              <span className="text-[11px] text-[#006a61] font-semibold">Requests With Evidence:</span>
              <p className="text-[16px] font-bold text-[#0b1c30]">{evidenceCoverage?.requests_with_evidence ?? 0}</p>
            </div>
            <div className="bg-[#fffbfa] p-2.5 rounded border border-[#ba1a1a]/20">
              <span className="text-[11px] text-[#ba1a1a] font-semibold">Requests Pending Evidence:</span>
              <p className="text-[16px] font-bold text-[#0b1c30]">{evidenceCoverage?.requests_without_evidence ?? 0}</p>
            </div>
          </div>
          <p className="text-[11px] text-[#76777d] italic">
            Note: "No evidence found" establishes only absence in ingested open data feeds, not non-existence of civic disruption.
          </p>
        </section>

        {/* Severity Distribution Panel (6 Cols) */}
        <section className="lg:col-span-6 bg-[#ffffff] p-5 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Reported Severity Distribution</h2>
            <span className="text-[11px] font-mono text-[#76777d]">Citizen &amp; Extracted</span>
          </div>
          <p className="text-[12px] text-[#45464d]">
            Breakdown of urgency levels assigned deterministically or structured from intake.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-3 rounded-lg bg-[#fffbfa] border border-[#ba1a1a]/30 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-[#ba1a1a]">CRITICAL</span>
              <span className="text-[20px] font-bold text-[#ba1a1a] mt-1">{severity?.counts?.CRITICAL ?? 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#fff8f2] border border-[#d97706]/30 flex flex-col">
              <span className="text-[10px] font-bold uppercase text-[#d97706]">HIGH</span>
              <span className="text-[20px] font-bold text-[#d97706] mt-1">{severity?.counts?.HIGH ?? 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
              <span className="text-[10px] font-bold uppercase text-[#0b1c30]">MEDIUM</span>
              <span className="text-[20px] font-bold text-[#0b1c30] mt-1">{severity?.counts?.MEDIUM ?? 0}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#f8f9ff] border border-[#e5eeff] flex flex-col">
              <span className="text-[10px] font-bold uppercase text-[#76777d]">LOW / UNSPEC</span>
              <span className="text-[20px] font-bold text-[#76777d] mt-1">{(severity?.counts?.LOW ?? 0) + (severity?.counts?.UNSPECIFIED ?? 0)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* 6. HOTSPOT DEMAND CLUSTERS */}
      <section className="bg-[#ffffff] p-5 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Demand Hotspots (hotspot-v1)</h2>
            <p className="text-[12px] text-[#45464d]">
              Deterministic demand groupings requiring at least 1 verified citizen request. Zero synthetic clusters.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#76777d]">{hotspots?.total_hotspots ?? 0} identified</span>
        </div>

        {!hotspots || hotspots.hotspots.length === 0 ? (
          <p className="text-[13px] text-[#45464d] py-6 text-center border border-dashed border-[#dce9ff] rounded-lg">
            No demand hotspot groups are currently available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border border-[#e5eeff]">
              <thead className="bg-[#f8f9ff] text-[#45464d] text-[11px] uppercase border-b border-[#e5eeff]">
                <tr>
                  <th className="p-2.5">Hotspot ID</th>
                  <th className="p-2.5">Territory</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Requests</th>
                  <th className="p-2.5 text-right">High Severity</th>
                  <th className="p-2.5 text-right">Affected HH</th>
                  <th className="p-2.5 text-right">Evidence Items</th>
                  <th className="p-2.5 text-right">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff]">
                {hotspots.hotspots.map((hs) => (
                  <tr key={hs.hotspot_id} className="hover:bg-[#fbfcfe]">
                    <td className="p-2.5 font-mono text-[11px] text-[#006a61] font-semibold">{hs.hotspot_id}</td>
                    <td className="p-2.5 font-medium text-[#0b1c30]">
                      {hs.locality ? `${hs.locality}, ` : ''}{hs.district}, {hs.state}
                    </td>
                    <td className="p-2.5">{t(hs.category)}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{hs.request_count}</td>
                    <td className="p-2.5 text-right font-mono text-[#ba1a1a]">{hs.factors.high_severity_request_count}</td>
                    <td className="p-2.5 text-right font-mono">{hs.affected_households !== null ? hs.affected_households : 'N/A'}</td>
                    <td className="p-2.5 text-right font-mono">{hs.evidence_count}</td>
                    <td className="p-2.5 text-right font-mono">{hs.factors.evidence_coverage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 7. VERIFIED PUBLIC DATASETS INVENTORY */}
      <section className="bg-[#ffffff] p-5 rounded-xl border border-[#e5eeff] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#0b1c30]">Ingested Public Dataset Registry</h2>
            <p className="text-[12px] text-[#45464d]">
              Deterministic open government baselines indexed for semantic and hybrid retrieval.
            </p>
          </div>
          <button
            onClick={() => onNavigate('data-sources')}
            className="text-[12px] font-semibold text-[#006a61] hover:underline"
          >
            Manage Datasets →
          </button>
        </div>

        {!datasets || datasets.datasets.length === 0 ? (
          <p className="text-[13px] text-[#45464d] py-6 text-center border border-dashed border-[#dce9ff] rounded-lg">
            No public datasets registered.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border border-[#e5eeff]">
              <thead className="bg-[#f8f9ff] text-[#45464d] text-[11px] uppercase border-b border-[#e5eeff]">
                <tr>
                  <th className="p-2.5">Dataset</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Publisher / Source</th>
                  <th className="p-2.5">Geographic Scope</th>
                  <th className="p-2.5 text-right">Records</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5eeff]">
                {datasets.datasets.map((d) => (
                  <tr key={d.dataset_id} className="hover:bg-[#fbfcfe]">
                    <td className="p-2.5 font-medium text-[#0b1c30]">
                      <div>{d.title}</div>
                      <div className="font-mono text-[10px] text-[#76777d]">{d.dataset_id}</div>
                    </td>
                    <td className="p-2.5">{d.category}</td>
                    <td className="p-2.5 text-[#45464d]">
                      {d.source_url ? (
                        <a href={d.source_url} target="_blank" rel="noreferrer" className="underline hover:text-[#006a61]">
                          {d.source_name}
                        </a>
                      ) : (
                        d.source_name
                      )}
                      {d.publisher ? ` · ${d.publisher}` : ''}
                    </td>
                    <td className="p-2.5">{d.geographic_level} ({d.year || d.period || '2024'})</td>
                    <td className="p-2.5 text-right font-mono font-semibold text-[#0b1c30]">{d.record_count}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eff4ff] text-[#006a61] border border-[#006a61]/30">
                        {d.ingestion_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
