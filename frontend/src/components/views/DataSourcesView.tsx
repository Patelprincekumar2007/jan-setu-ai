import React, { useEffect, useState } from 'react';
import { DatasetItem, fetchDatasetsApi } from '../../api/datasets';
import { useT } from '../../i18n';

interface DataSourcesViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

const categories = ['All', 'Water', 'Road', 'Health', 'Sanitation', 'Other'];

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ onShowToast }) => {
  const t = useT();
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadCatalog = async (announce = false) => {
    if (announce) setIsReloading(true);
    try {
      const result = await fetchDatasetsApi();
      setDatasets(result.datasets);
      setError(null);
      if (announce) onShowToast('Catalog refreshed', `${result.total} stored dataset records loaded.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'The dataset catalog could not be loaded.');
    } finally {
      setIsLoading(false);
      setIsReloading(false);
    }
  };

  useEffect(() => {
    void reloadCatalog();
  }, []);

  const filtered = datasets.filter((dataset) => {
    if (filterCategory === 'All') return true;
    return dataset.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <header className="saas-card p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[11px] font-bold border border-teal-200">
              {t('Public data catalog')}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-teal-700 text-[28px]">database</span>
            {t('Data sources')}
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
            {t('Dataset metadata currently stored by this prototype. Official open data records powering FAISS vector grounding and anti-hallucination verification.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reloadCatalog(true)}
          disabled={isReloading}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[#00897b] hover:bg-[#00796b] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition-all disabled:cursor-wait disabled:opacity-50 md:self-auto cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[18px] ${isReloading ? 'animate-spin' : ''}`}>refresh</span>
          <span>{isReloading ? t('Loading...') : t('Reload catalog')}</span>
        </button>
      </header>

      <div className="saas-card p-4 flex flex-wrap gap-2" role="group" aria-label="Filter datasets by category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filterCategory === category}
            onClick={() => setFilterCategory(category)}
            className={`rounded-lg px-4 py-2 text-[12px] font-bold transition-all cursor-pointer ${
              filterCategory === category
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {t(category)}{category === 'All' ? ` (${datasets.length})` : ''}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12 text-slate-500 text-[13px]">
          <span className="material-symbols-outlined text-[32px] text-teal-700 animate-spin mb-2">refresh</span>
          <p>{t('Loading stored datasets...')}</p>
        </div>
      )}
      {error && <p role="alert" className="border-l-4 border-rose-500 pl-3 text-[13px] text-rose-800 bg-rose-50 p-3 rounded-r-lg">{error}</p>}
      {!isLoading && !error && datasets.length === 0 && (
        <p className="saas-card p-6 text-center text-[13px] text-slate-500">{t('No datasets are currently registered.')}</p>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2" aria-label="Registered datasets">
        {filtered.map((dataset) => (
          <article key={dataset.dataset_id} className="saas-card p-5 space-y-3.5 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-teal-700 font-bold">{dataset.dataset_id}</span>
                  <h2 className="mt-1 text-[16px] font-bold text-slate-900">{dataset.title}</h2>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  {dataset.ingestion_status}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 font-mono">
                {dataset.publisher || dataset.source_name} • <span className="text-slate-900 font-sans font-semibold">{dataset.category}</span>
              </p>
              {dataset.description && (
                <p className="text-[13px] leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {dataset.description}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-[11px]">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <dt className="text-slate-500">Records</dt>
                  <dd className="font-mono text-slate-900 font-bold text-[13px]">{dataset.record_count.toLocaleString()}</dd>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <dt className="text-slate-500">Geographic level</dt>
                  <dd className="text-slate-900 font-semibold">{dataset.geographic_level}</dd>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <dt className="text-slate-500">Geographic scope</dt>
                  <dd className="text-slate-900 font-semibold">{dataset.geographic_scope || 'National'}</dd>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <dt className="text-slate-500">Reporting period</dt>
                  <dd className="text-slate-900 font-semibold">{dataset.period || dataset.year || '2024'}</dd>
                </div>
              </dl>
              {dataset.source_url && (
                <div className="flex justify-end pt-1">
                  <a
                    href={dataset.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12px] font-bold text-teal-700 hover:underline"
                  >
                    <span>{t('Open source')}</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};