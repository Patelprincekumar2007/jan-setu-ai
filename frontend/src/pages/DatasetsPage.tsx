import React, { useState, useEffect } from 'react';
import { Info, ExternalLink, Database, X } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { Table } from '../components/common/Table';
import type { Column } from '../components/common/Table';
import { StatusIndicator } from '../components/common/StatusIndicator';
import type { StatusVariant } from '../components/common/StatusIndicator';
import { Button } from '../components/common/Button';
import styles from './DatasetsPage.module.css';

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
          fetch('/api/knowledge/status')
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

  const mapStatusVariant = (status: string): { variant: StatusVariant; label: string } => {
    switch (status) {
      case 'INGESTED':
        return { variant: 'verified', label: 'INGESTED' };
      case 'FAILED':
        return { variant: 'error', label: 'FAILED' };
      default:
        return { variant: 'planned', label: 'NOT_INGESTED' };
    }
  };

  const columns: Column<DatasetItem>[] = [
    {
      key: 'title',
      header: 'Dataset / Registry',
      render: (row) => (
        <div>
          <div className={styles.datasetName}>{row.title}</div>
          {row.description && <div className={styles.datasetDesc}>{row.description}</div>}
          {row.source_url && (
            <a
              href={row.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              <span>Source URL</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      ),
      width: '35%',
    },
    {
      key: 'publisher',
      header: 'Publisher & Source',
      render: (row) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--navy-900)' }}>
            {row.publisher || row.source_name}
          </div>
          <span className={styles.sourceBadge}>{row.source_name}</span>
        </div>
      ),
      width: '25%',
    },
    {
      key: 'geographic_scope',
      header: 'Scope & Type',
      render: (row) => (
        <div style={{ fontSize: '12px', color: 'var(--slate-600)' }}>
          <div>{row.geographic_scope}</div>
          <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>{row.data_type}</div>
        </div>
      ),
      width: '15%',
    },
    {
      key: 'license',
      header: 'License',
      render: (row) => (
        <span style={{ fontSize: '11px', color: 'var(--slate-600)', fontFamily: 'var(--font-mono)' }}>
          {row.license}
        </span>
      ),
      width: '13%',
    },
    {
      key: 'ingestion_status',
      header: 'Status',
      render: (row) => {
        const { variant, label } = mapStatusVariant(row.ingestion_status);
        return <StatusIndicator status={variant} label={label} />;
      },
      width: '12%',
    },
  ];

  const recordColumns: Column<PublicRecordItem>[] = [
    {
      key: 'state',
      header: 'State',
      render: (r) => <span style={{ fontWeight: 600 }}>{r.state}</span>,
      width: '20%',
    },
    {
      key: 'district',
      header: 'District',
      render: (r) => <span>{r.district}</span>,
      width: '20%',
    },
    {
      key: 'metric_name',
      header: 'Metric',
      render: (r) => <span>{r.metric_name}</span>,
      width: '25%',
    },
    {
      key: 'metric_value',
      header: 'Value',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy-900)' }}>
          {r.metric_value} {r.unit || ''}
        </span>
      ),
      width: '15%',
    },
    {
      key: 'source_reference',
      header: 'Source Row ID',
      render: (r) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--slate-500)' }}>
          {r.source_reference}
        </span>
      ),
      width: '20%',
    },
  ];

  const evidenceColumns: Column<KnowledgeEvidenceItem>[] = [
    {
      key: 'title',
      header: 'Evidence Title & Grounding Text',
      render: (e) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-900)' }}>{e.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--slate-600)', marginTop: '4px', lineHeight: 1.4 }}>
            {e.content}
          </div>
        </div>
      ),
      width: '55%',
    },
    {
      key: 'metric_value',
      header: 'Ground Metric',
      render: (e) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy-900)', fontSize: '13px' }}>
          {e.metric_value !== null && e.metric_value !== undefined ? `${e.metric_value} ${e.unit || ''}` : 'N/A'}
        </span>
      ),
      width: '18%',
    },
    {
      key: 'source_reference',
      header: 'Provenance Reference',
      render: (e) => (
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '2px 6px', borderRadius: '4px' }}>
            {e.source_reference}
          </span>
        </div>
      ),
      width: '27%',
    },
  ];

  return (
    <PageContainer
      title="Public &amp; Government Datasets Catalog"
      subtitle="Transparent directory of verified open government datasets and baselines used for decision support."
    >
      <div className={styles.notice}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Verified Public Data Foundation:</strong> NagrikLens AI grounds analysis exclusively on verified open public datasets published under open licenses (e.g. GODL). Datasets marked <strong>INGESTED</strong> are normalized and stored with direct row-level provenance.
          </div>
        </div>
      </div>

      {knowledgeStatus && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--slate-50)', border: '1px solid var(--border-subtle)', borderRadius: '6px', fontSize: '13px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '4px' }}>Baseline metadata</div>
            <div style={{ color: 'var(--green-700)', fontWeight: 500 }}>{knowledgeStatus.baseline_metadata}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '4px' }}>Semantic FAISS index</div>
            <div style={{ color: knowledgeStatus.semantic_faiss.available ? 'var(--green-700)' : 'var(--amber-700)', fontWeight: 500 }}>
              {knowledgeStatus.semantic_faiss.available ? 'Available' : (knowledgeStatus.semantic_faiss.stale ? 'Stale' : 'Not built')}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '4px' }}>Evidence count</div>
            <div style={{ color: 'var(--slate-800)', fontFamily: 'var(--font-mono)' }}>{knowledgeStatus.semantic_faiss.evidence_count || 0}</div>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '4px' }}>Embedding model</div>
            <div style={{ color: 'var(--slate-600)', fontFamily: 'var(--font-mono)', fontSize: '11px', wordBreak: 'break-all' }}>
              {knowledgeStatus.semantic_faiss.embedding_model || 'Not configured'}
            </div>
          </div>
        </div>
      )}

      {knowledgeStatus?.semantic_faiss?.available && (
        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--white)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginBottom: '12px', fontSize: '14px' }}>
            Semantic Retrieval Inspection
          </div>
          <form onSubmit={handleTestSemanticSearch} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="e.g. water problems in Dharashiv"
              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-subtle)', borderRadius: '4px', fontSize: '13px' }}
              disabled={isSearchingSemantic}
            />
            <Button type="submit" variant="primary" disabled={isSearchingSemantic || !testQuery.trim()} style={{ fontSize: '13px' }}>
              {isSearchingSemantic ? 'Searching...' : 'Test Retrieval'}
            </Button>
          </form>

          {semanticError && (
            <div style={{ padding: '8px 12px', background: 'var(--red-50)', color: 'var(--red-700)', fontSize: '13px', borderRadius: '4px' }}>
              {semanticError}
            </div>
          )}

          {semanticResults && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--slate-500)', marginBottom: '8px', fontWeight: 500 }}>
                Top Results ({semanticResults.length})
              </div>
              {semanticResults.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--slate-500)' }}>No results found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {semanticResults.map((r, i) => (
                    <div key={i} style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '4px', background: 'var(--slate-50)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--navy-900)' }}>{r.title}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber-700)', background: 'var(--amber-50)', padding: '2px 6px', borderRadius: '4px' }}>
                          Sim: {r.similarity_score?.toFixed(3)}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--slate-700)', lineHeight: 1.4 }}>{r.content}</div>
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--slate-500)', fontFamily: 'var(--font-mono)' }}>
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

      <div className={styles.tableSection}>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--slate-500)' }}>
            Loading public datasets catalog...
          </div>
        ) : (
          <Table
            columns={columns}
            data={datasets}
            keyExtractor={(row) => row.dataset_id}
            emptyMessage="No public datasets registered."
          />
        )}
      </div>

      {datasets.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          {datasets.map((d) => (
            <Button
              key={d.dataset_id}
              variant={selectedDataset?.dataset_id === d.dataset_id ? 'primary' : 'secondary'}
              onClick={() => handleSelectDataset(d)}
              style={{ fontSize: '13px', padding: '6px 14px' }}
            >
              <Database size={14} style={{ marginRight: '6px' }} />
              Inspect: {d.title.split('(')[0].trim()}
            </Button>
          ))}
        </div>
      )}

      {selectedDataset && (
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div>
              <div className={styles.detailTitle}>{selectedDataset.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '4px' }}>
                {selectedDataset.description}
              </div>
            </div>
            <button
              onClick={() => setSelectedDataset(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--slate-400)',
                padding: '4px',
              }}
              aria-label="Close details"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Dataset ID</div>
              <div className={styles.gridValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {selectedDataset.dataset_id}
              </div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Source Name</div>
              <div className={styles.gridValue}>{selectedDataset.source_name}</div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Publisher</div>
              <div className={styles.gridValue}>{selectedDataset.publisher || 'Not Specified'}</div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Geographic Scope</div>
              <div className={styles.gridValue}>{selectedDataset.geographic_scope}</div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Data Type</div>
              <div className={styles.gridValue}>{selectedDataset.data_type}</div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>License</div>
              <div className={styles.gridValue} style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                {selectedDataset.license}
              </div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Last Updated</div>
              <div className={styles.gridValue}>{selectedDataset.last_updated || 'N/A'}</div>
            </div>
            <div className={styles.gridItem}>
              <div className={styles.gridLabel}>Ingested Records</div>
              <div className={styles.gridValue}>{selectedDataset.record_count} Verified Records</div>
            </div>
          </div>

          {selectedDataset.ingestion_status === 'INGESTED' && (
            <div className={styles.recordsTableWrapper}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant={activeTab === 'records' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('records')}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Normalized Records ({records.length})
                  </Button>
                  <Button
                    variant={activeTab === 'knowledge' ? 'primary' : 'ghost'}
                    onClick={() => setActiveTab('knowledge')}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    Knowledge Evidence Grounding ({evidenceList.length})
                  </Button>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
                  {activeTab === 'records' ? 'Direct Row-level Data' : 'Deterministic Grounding Text for Retrieval'}
                </span>
              </div>

              {isLoadingRecords ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--slate-500)', fontSize: '12px' }}>
                  Loading inspection details...
                </div>
              ) : activeTab === 'records' ? (
                <Table
                  columns={recordColumns}
                  data={records}
                  keyExtractor={(r) => r.record_id}
                  emptyMessage="No normalized records found."
                />
              ) : (
                <Table
                  columns={evidenceColumns}
                  data={evidenceList}
                  keyExtractor={(e) => e.evidence_id}
                  emptyMessage="No knowledge evidence records found."
                />
              )}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};
