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
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#dce9ff] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase text-[#006a61]">{t('Stored platform data')}</p>
          <h1 className="mt-1 text-[24px] font-bold text-[#0b1c30]">{t('Request Analytics')}</h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[#45464d]">
            {t('Verifiable aggregates calculated directly from citizen requests, evidence matches, datasets, and priority assessments.')}
          </p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          disabled={!overview || isLoading}
          className="inline-flex items-center gap-2 self-start border border-[#006a61] px-4 py-2 text-[13px] font-semibold text-[#005049] hover:bg-[#e7f5f1] disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>{t('Download CSV')}</span>
        </button>
      </header>

      {isLoading && <p className="text-[13px] text-[#45464d]">{t('Loading stored analytics...')}</p>}
      {error && <p role="alert" className="border-l-2 border-[#ba1a1a] pl-3 text-[13px] text-[#93000a]">{error}</p>}

      {overview && (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Report totals">
            {[
              [t('Total requests'), overview.total_requests],
              [t('Evidence-backed'), overview.requests_with_evidence],
              [t('Pending evidence'), overview.requests_without_evidence],
              [t('Priority assessments'), overview.priority_assessments_generated],
              [t('Hotspot clusters'), overview.hotspot_groups],
              [t('Evidence records'), overview.evidence_records],
              [t('Verified datasets'), overview.verified_datasets],
              [t('Coverage percentage'), evidenceCoverage?.coverage_percentage !== null && evidenceCoverage?.coverage_percentage !== undefined ? `${evidenceCoverage.coverage_percentage}%` : 'N/A'],
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
                <h2 id="category-breakdown" className="text-[16px] font-semibold text-[#0b1c30]">{t('Requests by category')}</h2>
              </div>
              {categories.length === 0 ? <p className="text-[13px] text-[#76777d]">No request categories available.</p> : categories.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span>{t(item.category)}</span>
                    <span className="font-mono">{item.request_count} ({item.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-[#eff4ff]">
                    <div className="h-full bg-[#006a61]" style={{ width: `${(item.request_count / maxCategoryCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-4" aria-labelledby="geography-breakdown">
              <div className="border-b border-[#dce9ff] pb-2">
                <h2 id="geography-breakdown" className="text-[16px] font-semibold text-[#0b1c30]">{t('Requests by geography')}</h2>
              </div>
              {geographies.length === 0 ? <p className="text-[13px] text-[#76777d]">No report geography available.</p> : geographies.map((item, idx) => (
                <div key={`${item.state}-${item.district}-${idx}`} className="flex justify-between border-b border-[#eff4ff] py-2 text-[13px]">
                  <span>{item.locality ? `${item.locality}, ` : ''}{item.district}, {item.state}</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{item.request_count} requests</span>
                </div>
              ))}
            </section>
          </div>
        </>
      )}
    </div>
  );
};