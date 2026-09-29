import React, { useState } from 'react';
import { PUBLIC_DATASETS } from '../../data/mockData';

interface DataSourcesViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ onShowToast }) => {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const datasets = [
    ...PUBLIC_DATASETS,
    {
      id: 'maha-gis-ward-cadastre',
      code: 'MAHA-GIS-CADASTRE-2024',
      name: 'Maharashtra Remote Sensing Application Centre (MRSAC) Cadastre',
      agency: 'MRSAC Nagpur / Urban Development Dept',
      recordsCount: 8900,
      lastUpdated: '3h ago',
      matchAccuracy: '99.8% Match Acc',
      status: 'Verified Live' as const,
      vectorHash: '8a12..99',
      description: 'Dharashiv district municipal ward polygons, land parcel numbers, and public right-of-way easement corridors.',
      category: 'GIS & Municipal Land',
    },
    {
      id: 'udise-infra-2023',
      code: 'UDISE-PLUS-DHA-2023',
      name: 'Unified District Information System for Education (UDISE+)',
      agency: 'Ministry of Education',
      recordsCount: 1420,
      lastUpdated: '1d ago',
      matchAccuracy: '96.2% Match Acc',
      status: 'Verified Live' as const,
      vectorHash: '1f44..72',
      description: 'Zilla Parishad school utility records, functional girls/boys sanitation facilities, and drinking water source audits.',
      category: 'Education Infrastructure',
    },
    {
      id: 'cgwb-groundwater-2024',
      code: 'CGWB-GW-AQUIFER-MH',
      name: 'Central Ground Water Board (CGWB) Seasonal Aquifer Monitor',
      agency: 'CGWB / Ministry of Jal Shakti',
      recordsCount: 680,
      lastUpdated: '5d ago',
      matchAccuracy: '95.0% Match Acc',
      status: 'Verified Live' as const,
      vectorHash: '5e09..33',
      description: 'Pre-monsoon and post-monsoon water table depth telemetry across Marathwada basalt fracture zones.',
      category: 'Water Infrastructure',
    },
  ];

  const handleSync = (id: string, name: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      onShowToast('Dataset Synchronized', `Pulled latest API updates for ${name}. Vector embeddings refreshed.`);
    }, 1200);
  };

  const filtered = datasets.filter((d) => {
    if (filterCategory === 'All') return true;
    return d.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
            <span className="material-symbols-outlined text-[16px]">layers</span>
            <span>Open Government Data Grounding Store</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Public Data Sources &amp; Vector Registries
          </h1>
          <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
            All civic complaints are reconciled strictly against authenticated open governmental feeds.
            Zero synthetic data imputation is permitted in our RAG pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onShowToast('Full Re-sync Started', 'Scanning 14 ministerial endpoints...')}
            className="px-4 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold hover:bg-[#213145] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">sync</span>
            <span>Sync All Catalogs</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Water', 'Roads', 'Healthcare', 'GIS', 'Education'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-colors shrink-0 ${
              filterCategory === cat
                ? 'bg-[#131b2e] text-[#ffffff]'
                : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#dce9ff] border border-[#dce9ff]'
            }`}
          >
            {cat} {cat === 'All' ? `(${datasets.length})` : ''}
          </button>
        ))}
      </div>

      {/* Datasets Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ds) => (
          <div
            key={ds.id}
            className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-semibold border border-[#dce9ff]">
                  {ds.code}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold">
                  {ds.matchAccuracy}
                </span>
              </div>

              <h2 className="font-bold text-[16px] text-[#0b1c30] leading-snug">{ds.name}</h2>
              <p className="text-[12px] text-[#76777d]">{ds.agency}</p>
              <p className="text-[13px] text-[#45464d] leading-relaxed pt-1">{ds.description}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#eff4ff]">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#76777d]">
                <span>Records: <strong>{ds.recordsCount.toLocaleString()}</strong></span>
                <span>Hash: {ds.vectorHash}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#006a61] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
                  Updated {ds.lastUpdated}
                </span>

                <button
                  type="button"
                  disabled={syncingId === ds.id}
                  onClick={() => handleSync(ds.id, ds.name)}
                  className="px-2.5 py-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-[11px] font-semibold transition-colors flex items-center gap-1 border border-[#dce9ff] cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[14px] ${syncingId === ds.id ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>{syncingId === ds.id ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
