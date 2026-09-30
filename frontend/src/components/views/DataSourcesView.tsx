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
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#dce9ff] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase text-[#006a61]">{t('Public data catalog')}</p>
          <h1 className="mt-1 text-[24px] font-bold text-[#0b1c30]">{t('Data sources')}</h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[#45464d]">
            {t('Dataset metadata currently stored by this prototype. Availability here does not imply a live upstream feed.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reloadCatalog(true)}
          disabled={isReloading}
          className="inline-flex items-center gap-2 self-start border border-[#006a61] px-4 py-2 text-[13px] font-semibold text-[#005049] hover:bg-[#e7f5f1] disabled:cursor-wait disabled:opacity-50 md:self-auto"
        >
          <span className={`material-symbols-outlined text-[18px] ${isReloading ? 'animate-spin' : ''}`}>refresh</span>
          <span>{isReloading ? t('Loading...') : t('Reload catalog')}</span>
        </button>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter datasets by category">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filterCategory === category}
            onClick={() => setFilterCategory(category)}
            className={`border px-3 py-1.5 text-[12px] font-semibold ${filterCategory === category ? 'border-[#006a61] bg-[#e7f5f1] text-[#005049]' : 'border-[#dce9ff] text-[#45464d] hover:bg-[#eff4ff]'}`}
          >
            {t(category)}{category === 'All' ? ` (${datasets.length})` : ''}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-[13px] text-[#45464d]">{t('Loading stored datasets...')}</p>}
      {error && <p role="alert" className="border-l-2 border-[#ba1a1a] pl-3 text-[13px] text-[#93000a]">{error}</p>}
      {!isLoading && !error && datasets.length === 0 && (
        <p className="border-y border-[#dce9ff] py-5 text-[13px] text-[#45464d]">{t('No datasets are currently registered.')}</p>
      )}

      <section className="grid grid-cols-1 gap-x-8 md:grid-cols-2" aria-label="Registered datasets">
        {filtered.map((dataset) => (
          <article key={dataset.dataset_id} className="space-y-3 border-y border-[#dce9ff] py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-[#006a61]">{dataset.dataset_id}</p>
                <h2 className="mt-1 text-[15px] font-semibold text-[#0b1c30]">{dataset.title}</h2>
              </div>
              <span className="border border-[#dce9ff] px-2 py-1 font-mono text-[10px] text-[#45464d]">
                {dataset.ingestion_status}
              </span>
            </div>
            <p className="text-[12px] text-[#45464d]">{dataset.publisher || dataset.source_name} · {dataset.category}</p>
            {dataset.description && <p className="text-[13px] leading-relaxed text-[#45464d]">{dataset.description}</p>}
            <dl className="grid grid-cols-2 gap-3 border-t border-[#eff4ff] pt-3 text-[11px]">
              <div><dt className="text-[#76777d]">Records</dt><dd className="font-mono text-[#0b1c30]">{dataset.record_count.toLocaleString()}</dd></div>
              <div><dt className="text-[#76777d]">Geographic level</dt><dd className="text-[#0b1c30]">{dataset.geographic_level}</dd></div>
              <div><dt className="text-[#76777d]">Geographic scope</dt><dd className="text-[#0b1c30]">{dataset.geographic_scope || 'National'}</dd></div>
              <div><dt className="text-[#76777d]">Reporting period</dt><dd className="text-[#0b1c30]">{dataset.period || dataset.year || '2024'}</dd></div>
            </dl>
            {dataset.source_url && (
              <a href={dataset.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#005049] underline">
                <span>{t('Open source')}</span><span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};