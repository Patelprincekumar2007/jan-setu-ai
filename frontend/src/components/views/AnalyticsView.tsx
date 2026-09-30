import React, { useEffect, useState } from 'react';
import {
  AnalyticsOverview,
  fetchAnalyticsOverviewApi,
  fetchCategoryAnalyticsApi,
  fetchGeographicAnalyticsApi,
  fetchEvidenceCoverageAnalyticsApi,
  fetchSeverityAnalyticsApi,
  CategoryDemandMetric,
  GeographicDemandMetric,
  EvidenceCoverageResponse,
  SeverityAnalyticsResponse,
} from '../../api/analytics';
import { useT } from '../../i18n';

interface AnalyticsViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onShowToast }) => {
  const t = useT();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [categories, setCategories] = useState<CategoryDemandMetric[]>([]);
  const [geographies, setGeographies] = useState<GeographicDemandMetric[]>([]);
  const [evidenceCoverage, setEvidenceCoverage] = useState<EvidenceCoverageResponse | null>(null);
  const [severity, setSeverity] = useState<SeverityAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      fetchAnalyticsOverviewApi(),
      fetchCategoryAnalyticsApi(),
      fetchGeographicAnalyticsApi(),
      fetchEvidenceCoverageAnalyticsApi(),
      fetchSeverityAnalyticsApi(),
    ]).then(([overviewData, categoryData, geographyData, evidenceData, severityData]) => {
      if (!isActive) return;
      setOverview(overviewData);
      setCategories(categoryData.categories);
      setGeographies(geographyData.locations);
      setEvidenceCoverage(evidenceData);
      setSeverity(severityData);
      setError(null);
    }).catch((loadError: unknown) => {
      if (!isActive) return;
      setError(loadError instanceof Error ? loadError.message : 'Analytics could not be loaded.');
    }).finally(() => {
      if (isActive) setIsLoading(false);
    });
    return () => { isActive = false; };
  }, []);

  const downloadCsv = () => {
    if (!overview) return;
    const rows: (string | number)[][] = [
      ['Metric', 'Value'],
      ['Total requests', overview.total_requests],
      ['Evidence-backed requests', overview.requests_with_evidence],
      ['Pending evidence requests', overview.requests_without_evidence],
      ['Priority assessments generated', overview.priority_assessments_generated],
      ['Hotspot demand clusters', overview.hotspot_groups],
      ['Verified public datasets', overview.verified_datasets],
      ['Evidence records', overview.evidence_records],
      [],
      ['Category', 'Request count', 'Affected households', 'Percentage'],
      ...categories.map((c) => [c.category, c.request_count, c.affected_households ?? 'Not reported', `${c.percentage}%`]),
      [],
      ['State', 'District', 'Locality', 'Request count', 'Affected households'],
      ...geographies.map((g) => [g.state, g.district, g.locality || 'District-wide', g.request_count, g.affected_households ?? 'Not reported']),
    ];
    const csv = rows.map((row) => row.map((cell) => csvCell(cell ?? '')).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `nagriklens-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Analytics exported', 'Downloaded verified report and demand totals.');
  };

  const maxCategoryCount = Math.max(1, ...categories.map((item) => item.request_count));

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <header className="saas-card p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[11px] font-bold border border-teal-200">
              {t('Stored platform data')}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-teal-700 text-[28px]">analytics</span>
            {t('Request Analytics')}
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
            {t('Verifiable aggregates calculated directly from citizen requests, evidence matches, datasets, and priority assessments.')}
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!overview || isLoading}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[#00897b] hover:bg-[#00796b] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition-all disabled:cursor-not-allowed disabled:opacity-50 md:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>{t('Download CSV')}</span>
        </button>
      </header>

      {isLoading && (
        <div className="text-center py-12 text-slate-500 text-[13px]">
          <span className="material-symbols-outlined text-[32px] text-teal-700 animate-spin mb-2">refresh</span>
          <p>{t('Loading stored analytics...')}</p>
        </div>
      )}
      {error && <p role="alert" className="border-l-4 border-rose-500 pl-3 text-[13px] text-rose-800 bg-rose-50 p-3 rounded-r-lg">{error}</p>}

      {overview && (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Report totals">
            {[
              [t('Total requests'), overview.total_requests, 'summarize'],
              [t('Evidence-backed'), overview.requests_with_evidence, 'verified'],
              [t('Pending evidence'), overview.requests_without_evidence, 'pending'],
              [t('Priority assessments'), overview.priority_assessments_generated, 'insights'],
              [t('Hotspot clusters'), overview.hotspot_groups, 'hub'],
              [t('Evidence records'), overview.evidence_records, 'database'],
              [t('Verified datasets'), overview.verified_datasets, 'folder_managed'],
              [t('Coverage percentage'), evidenceCoverage?.coverage_percentage !== null && evidenceCoverage?.coverage_percentage !== undefined ? `${evidenceCoverage.coverage_percentage}%` : (overview.total_requests > 0 ? `${((overview.requests_with_evidence / overview.total_requests) * 100).toFixed(1)}%` : t('No data available')), 'check_circle'],
            ].map(([label, value, icon]) => (
              <div key={label as string} className="saas-card p-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-500 font-mono">{label as string}</p>
                  <p className="mt-1 font-mono text-[24px] font-bold text-slate-900">{value as any}</p>
                </div>
                <span className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <span className="material-symbols-outlined text-[20px]">{icon as string}</span>
                </span>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="saas-card p-5 space-y-4" aria-labelledby="category-breakdown">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h2 id="category-breakdown" className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700 text-[20px]">category</span>
                  {t('Requests by category')}
                </h2>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">{categories.length} Categories</span>
              </div>
              {categories.length === 0 ? <p className="text-[13px] text-slate-500">No request categories available.</p> : categories.map((item) => (
                <div key={item.category} className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-bold text-slate-800">{t(item.category)}</span>
                    <span className="font-mono text-teal-800 font-bold">{item.request_count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600" style={{ width: `${(item.request_count / maxCategoryCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </section>

            <section className="saas-card p-5 space-y-4" aria-labelledby="geography-breakdown">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h2 id="geography-breakdown" className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-teal-700 text-[20px]">map</span>
                  {t('Requests by geography')}
                </h2>
                <span className="text-[11px] font-mono text-slate-500 font-semibold">{geographies.length} Clusters</span>
              </div>
              {geographies.length === 0 ? <p className="text-[13px] text-slate-500">No report geography available.</p> : geographies.map((item, idx) => (
                <div key={`${item.state}-${item.district}-${idx}`} className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-xl text-[13px]">
                  <span className="text-slate-800 font-semibold">{item.locality ? `${item.locality}, ` : ''}{item.district}, {item.state}</span>
                  <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs">{item.request_count} requests</span>
                </div>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
};