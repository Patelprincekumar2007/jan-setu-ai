import React, { useEffect, useState } from 'react';
import {
  AnalyticsOverview,
  fetchAnalyticsOverviewApi,
  fetchCategoryBreakdownApi,
  fetchGeographicBreakdownApi,
  fetchEvidenceStatsApi,
} from '../../api/analytics';

interface AnalyticsViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

type CategoryCount = { category: string; count: number };
type GeographyCount = { state: string; district: string; count: number };
type EvidenceCount = { coverage: string; count: number };

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onShowToast }) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [geographies, setGeographies] = useState<GeographyCount[]>([]);
  const [evidenceStats, setEvidenceStats] = useState<EvidenceCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      fetchAnalyticsOverviewApi(),
      fetchCategoryBreakdownApi(),
      fetchGeographicBreakdownApi(),
      fetchEvidenceStatsApi(),
    ]).then(([overviewData, categoryData, geographyData, evidenceData]) => {
      if (!isActive) return;
      setOverview(overviewData);
      setCategories(categoryData);
      setGeographies(geographyData);
      setEvidenceStats(evidenceData);
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
      ['Total reports', overview.total_reports],
      ['Active reports', overview.active_reports],
      ['Analyzed reports', overview.analyzed_reports],
      ['Resolved reports', overview.resolved_reports],
      ['Evidence-backed reports', overview.evidence_backed_reports],
      ['Insufficient-evidence reports', overview.insufficient_evidence_reports],
      ['Registered datasets', overview.total_datasets],
      ['Evidence records', overview.total_evidences],
      [],
      ['Category', 'Report count'],
      ...categories.map(({ category, count }) => [category, count]),
      [],
      ['State', 'District', 'Report count'],
      ...geographies.map(({ state, district, count }) => [state, district, count]),
      [],
      ['Evidence coverage', 'Report count'],
      ...evidenceStats.map(({ coverage, count }) => [coverage || 'Not analyzed', count]),
    ];
    const csv = rows.map((row) => row.map((cell) => csvCell(cell ?? '')).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `nagriklens-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Analytics exported', 'Downloaded current report and evidence totals.');
  };

  const maxCategoryCount = Math.max(1, ...categories.map((item) => item.count));

  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#dce9ff] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase text-[#006a61]">Stored platform data</p>
          <h1 className="mt-1 text-[24px] font-bold text-[#0b1c30]">Report analytics</h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[#45464d]">
            Counts are calculated from reports, analyses, datasets, and evidence currently stored by this prototype.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!overview || isLoading}
          className="inline-flex items-center gap-2 self-start border border-[#006a61] px-4 py-2 text-[13px] font-semibold text-[#005049] hover:bg-[#e7f5f1] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download CSV</span>
        </button>
      </header>

      {isLoading && <p className="text-[13px] text-[#45464d]">Loading stored analytics...</p>}
      {error && <p role="alert" className="border-l-2 border-[#ba1a1a] pl-3 text-[13px] text-[#93000a]">{error}</p>}

      {overview && (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Report totals">
            {[
              ['Total reports', overview.total_reports],
              ['Active reports', overview.active_reports],
              ['Evidence-backed', overview.evidence_backed_reports],
              ['Evidence records', overview.total_evidences],
              ['Resolved reports', overview.resolved_reports],
              ['Insufficient evidence', overview.insufficient_evidence_reports],
              ['Registered datasets', overview.total_datasets],
              ['Analyzed reports', overview.analyzed_reports],
            ].map(([label, value]) => (
              <div key={label} className="border-y border-[#dce9ff] py-3">
                <p className="text-[11px] font-semibold uppercase text-[#76777d]">{label}</p>
                <p className="mt-1 font-mono text-[26px] font-semibold text-[#0b1c30]">{value}</p>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <section className="space-y-4" aria-labelledby="category-breakdown">
              <div className="border-b border-[#dce9ff] pb-2">
                <h2 id="category-breakdown" className="text-[16px] font-semibold text-[#0b1c30]">Reports by category</h2>
              </div>
              {categories.length === 0 ? <p className="text-[13px] text-[#76777d]">No report categories available.</p> : categories.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-[12px]"><span>{item.category}</span><span className="font-mono">{item.count}</span></div>
                  <div className="h-2 bg-[#eff4ff]"><div className="h-full bg-[#006a61]" style={{ width: `${(item.count / maxCategoryCount) * 100}%` }} /></div>
                </div>
              ))}
            </section>

            <section className="space-y-4" aria-labelledby="geography-breakdown">
              <div className="border-b border-[#dce9ff] pb-2">
                <h2 id="geography-breakdown" className="text-[16px] font-semibold text-[#0b1c30]">Reports by geography</h2>
              </div>
              {geographies.length === 0 ? <p className="text-[13px] text-[#76777d]">No report geography available.</p> : geographies.map((item) => (
                <div key={`${item.state}-${item.district}`} className="flex justify-between border-b border-[#eff4ff] py-2 text-[13px]">
                  <span>{item.district}, {item.state}</span><span className="font-mono">{item.count}</span>
                </div>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
};