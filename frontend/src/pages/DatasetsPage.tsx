import React, { useState, useEffect } from 'react';
import { Info, ExternalLink, Database, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface DatasetItem {
  dataset_id: string;
  title: string;
  description?: string | null;
  source_name: string;
  source_url?: string | null;
  publisher?: string | null;
  data_type: string;
  geographic_scope: string;
  last_updated?: string | null;
  license: string;
  ingestion_status: 'NOT_INGESTED' | 'INGESTED' | 'FAILED';
  record_count: number;
  ingested_at?: string | null;
}

interface PublicRecordItem {
  record_id: string;
  dataset_id: string;
  state: string;
  district: string;
  locality?: string | null;
  category: string;
  metric_name: string;
  metric_value: number;
  unit?: string | null;
  year?: number | null;
  geographic_level: string;
  source_reference: string;
  notes?: string | null;
}

interface KnowledgeEvidenceItem {
  evidence_id: string;
  title: string;
  content: string;
  state: string;
  district: string;
  category: string;
  metric_name: string;
  metric_value?: number | null;
  unit?: string | null;
  source_name: string;
  source_reference: string;
}

export const DatasetsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataset, setSelectedDataset] = useState<DatasetItem | null>(null);
  const [records, setRecords] = useState<PublicRecordItem[]>([]);
  const [evidenceList, setEvidenceList] = useState<KnowledgeEvidenceItem[]>([]);
  const [activeTab, setActiveTab] = useState<'records' | 'knowledge'>('records');
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [knowledgeStatus, setKnowledgeStatus] = useState<any>(null);

  // Semantic Search Tester State
  const [testQuery, setTestQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<any[] | null>(null);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatasetsAndStatus = async () => {
      try {
        const [datasetsRes, statusRes] = await Promise.all([
          fetch('/api/datasets'),
          fetch('/api/knowledge/status'),
        ]);
        if (datasetsRes.ok) {
          const data = await datasetsRes.json();
          setDatasets(data.datasets || []);
        }
        if (statusRes.ok) {
          const sData = await statusRes.json();
          setKnowledgeStatus(sData);
        }
      } catch (err) {
        console.error('Failed to load dataset registry or status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatasetsAndStatus();
  }, []);

  const handleSelectDataset = async (dataset: DatasetItem) => {
    setSelectedDataset(dataset);
    if (dataset.ingestion_status === 'INGESTED') {
      setIsLoadingRecords(true);
      try {
        const [recordsRes, knowledgeRes] = await Promise.all([
          fetch(`/api/datasets/${dataset.dataset_id}/records?limit=10`),
          fetch(`/api/knowledge/search?category=Water&top_k=10`),
        ]);
        if (recordsRes.ok) {
          const rData = await recordsRes.json();
          setRecords(rData.records || []);
        }
        if (knowledgeRes.ok) {
          const kData = await knowledgeRes.json();
          setEvidenceList(kData.results || []);
        }
      } catch (err) {
        console.error('Failed to load dataset inspection details:', err);
      } finally {
        setIsLoadingRecords(false);
      }
    } else {
      setRecords([]);
      setEvidenceList([]);
    }
  };

  const handleTestSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsSearchingSemantic(true);
    setSemanticError(null);
    try {
      const res = await fetch(`/api/knowledge/semantic-search?q=${encodeURIComponent(testQuery)}&top_k=3`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Search failed');
      }
      setSemanticResults(data.results || []);
    } catch (err: any) {
      setSemanticError(err.message);
      setSemanticResults(null);
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Public Datasets Catalog</h1>
        <p className="text-slate-500 text-sm mt-1">
          Transparent directory of verified open government datasets and baselines used for decision support.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-900 flex items-start gap-3">
        <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Verified Public Data Foundation:</span> NagrikLens AI grounds analysis exclusively on verified open public datasets published under open licenses (e.g. GODL). Datasets marked <span className="font-semibold text-emerald-800">INGESTED</span> are normalized and stored with direct row-level provenance.
        </div>
      </div>

      {knowledgeStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-lg p-4 mb-6 shadow-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Baseline Metadata</div>
            <div className="text-sm font-semibold text-emerald-700 mt-1">{knowledgeStatus.baseline_metadata}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Semantic FAISS Index</div>
            <div className={`text-sm font-semibold mt-1 ${knowledgeStatus.semantic_faiss?.available ? 'text-emerald-700' : 'text-amber-700'}`}>
              {knowledgeStatus.semantic_faiss?.available ? 'Available' : (knowledgeStatus.semantic_faiss?.stale ? 'Stale' : 'Not built')}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Evidence Count</div>
            <div className="text-sm font-semibold font-mono text-slate-900 mt-1">{knowledgeStatus.semantic_faiss?.evidence_count || 0}</div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Embedding Model</div>
            <div className="text-xs font-mono text-slate-600 mt-1 truncate" title={knowledgeStatus.semantic_faiss?.embedding_model}>
              {knowledgeStatus.semantic_faiss?.embedding_model || 'Not configured'}
            </div>
          </div>
        </div>
      )}

      {knowledgeStatus?.semantic_faiss?.available && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mb-6 shadow-sm">
          <div className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-2">
            <span>Semantic Retrieval Inspection</span>
          </div>
          <form onSubmit={handleTestSemanticSearch} className="flex gap-2 mb-3">
            <input
              type="text"
              value={testQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestQuery(e.target.value)}
              placeholder="e.g. water problem in Dharashiv"
              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isSearchingSemantic}
            />
            <button
              type="submit"
              disabled={isSearchingSemantic || !testQuery.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors"
            >
              {isSearchingSemantic ? 'Searching...' : 'Test Retrieval'}
            </button>
          </form>

          {semanticError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded mb-3">
              {semanticError}
            </div>
          )}

          {semanticResults && (
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-500 mb-2">
                Top Results ({semanticResults.length})
              </div>
              {semanticResults.length === 0 ? (
                <div className="text-xs text-slate-500">No results found.</div>
              ) : (
                <div className="space-y-2">
                  {semanticResults.map((r: any, i: number) => (
                    <div key={i} className="p-3 border border-slate-200 rounded bg-slate-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-xs text-slate-900">{r.title}</span>
                        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Sim: {typeof r.similarity_score === 'number' ? r.similarity_score.toFixed(3) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{r.content}</p>
                      <div className="mt-2 text-[11px] text-slate-500 font-mono">
                        ID: {r.evidence_id} | {r.district}, {r.state}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Datasets Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">Registered Public Datasets</span>
          <span className="text-xs text-slate-500">{datasets.length} Total</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading public datasets catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-3 px-4">Dataset / Registry</th>
                  <th className="py-3 px-4">Publisher &amp; Source</th>
                  <th className="py-3 px-4">Scope &amp; Type</th>
                  <th className="py-3 px-4">License</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {datasets.map((d) => (
                  <tr key={d.dataset_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{d.title}</div>
                      {d.description && <div className="text-[11px] text-slate-500 mt-0.5 max-w-md">{d.description}</div>}
                      {d.source_url && (
                        <a
                          href={d.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-1"
                        >
                          <span>Official Source</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{d.publisher || d.source_name}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded">
                        {d.source_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{d.geographic_scope}</div>
                      <div className="text-[10px] text-slate-400">{d.data_type}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                      {d.license}
                    </td>
                    <td className="py-3 px-4">
                      {d.ingestion_status === 'INGESTED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> INGESTED
                        </span>
                      ) : d.ingestion_status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle size={11} /> FAILED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          <Clock size={11} /> NOT_INGESTED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSelectDataset(d)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dataset Inspection Details */}
      {selectedDataset && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
          <div className="flex justify-between items-start pb-4 border-b border-slate-200 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{selectedDataset.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedDataset.description}</p>
            </div>
            <button
              onClick={() => setSelectedDataset(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6">
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Dataset ID</div>
              <div className="font-mono text-slate-800 mt-1">{selectedDataset.dataset_id}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Source Name</div>
              <div className="text-slate-800 font-medium mt-1">{selectedDataset.source_name}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Publisher</div>
              <div className="text-slate-800 font-medium mt-1">{selectedDataset.publisher || 'Not Specified'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Ingested Records</div>
              <div className="text-slate-800 font-medium mt-1">{selectedDataset.record_count} Records</div>
            </div>
          </div>

          {selectedDataset.ingestion_status === 'INGESTED' && (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`px-3 py-1.5 rounded text-xs font-medium ${
                      activeTab === 'records'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Normalized Records ({records.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className={`px-3 py-1.5 rounded text-xs font-medium ${
                      activeTab === 'knowledge'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Knowledge Evidence Grounding ({evidenceList.length})
                  </button>
                </div>
                <span className="text-[11px] text-slate-500">
                  {activeTab === 'records' ? 'Direct Row-level Data' : 'Deterministic Grounding Text for Retrieval'}
                </span>
              </div>

              {isLoadingRecords ? (
                <div className="p-6 text-center text-xs text-slate-500">Loading inspection details...</div>
              ) : activeTab === 'records' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">State</th>
                        <th className="py-2.5 px-3">District</th>
                        <th className="py-2.5 px-3">Metric</th>
                        <th className="py-2.5 px-3">Value</th>
                        <th className="py-2.5 px-3">Source Row ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records.map((r: PublicRecordItem) => (
                        <tr key={r.record_id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-slate-800">{r.state}</td>
                          <td className="py-2 px-3 text-slate-700">{r.district}</td>
                          <td className="py-2 px-3 text-slate-700">{r.metric_name}</td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {r.metric_value} {r.unit || ''}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{r.source_reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Evidence Title &amp; Grounding Text</th>
                        <th className="py-2.5 px-3">Ground Metric</th>
                        <th className="py-2.5 px-3">Provenance Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {evidenceList.map((e: KnowledgeEvidenceItem) => (
                        <tr key={e.evidence_id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 max-w-xl">
                            <div className="font-semibold text-slate-900">{e.title}</div>
                            <div className="text-slate-600 text-[11px] mt-1 leading-relaxed">{e.content}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                            {e.metric_value !== null && e.metric_value !== undefined ? `${e.metric_value} ${e.unit || ''}` : 'N/A'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {e.source_reference}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
