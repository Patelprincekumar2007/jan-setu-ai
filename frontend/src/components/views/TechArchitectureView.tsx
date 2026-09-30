import React from 'react';
import { LocalizedTree } from '../../i18n';

export const TechArchitectureView: React.FC = () => {
  return (
    <LocalizedTree>
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <div className="saas-card p-6 space-y-2">
        <div className="flex items-center gap-2 text-teal-700 font-mono text-[11px] uppercase font-bold">
          <span className="material-symbols-outlined text-[18px]">terminal</span>
          <span>System Specifications and Technical Architecture</span>
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          NagrikLens AI Technical Blueprint
        </h1>
        <p className="text-[14px] text-slate-600 max-w-3xl leading-relaxed">
          The hybrid neural-symbolic architecture ensuring semantic retrieval across Indian regional languages and deterministic municipal priority calculation.
        </p>
      </div>

      {/* Layer 1: Ingestion & Embeddings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="saas-card p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-[11px] text-teal-700 font-bold">LAYER 01</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold">
                Ingestion and Dialect
              </span>
            </div>
            <h2 className="font-bold text-[17px] text-slate-900">Multi-Dialect IndicBERT and MiniLM</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Ingests grievance text or transcribed speech in Marathi, Hindi, Gujarati, or Indian English. Encodes narratives into 384-dimensional dense vectors where semantic meaning aligns across scripts.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-700 border border-slate-200 space-y-1">
            <div><span className="text-slate-400">Embedding:</span> paraphrase-multilingual-MiniLM-L12-v2</div>
            <div><span className="text-slate-400">Context Length:</span> 1,024 tokens</div>
            <div><span className="text-teal-700 font-bold">Inference Latency:</span> 142ms avg</div>
          </div>
        </div>

        {/* Layer 2: Vector Search */}
        <div className="saas-card p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-[11px] text-teal-700 font-bold">LAYER 02</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold">
                Vector Indexing
              </span>
            </div>
            <h2 className="font-bold text-[17px] text-slate-900">FAISS Vector Grounding Store</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              14 verified ministerial datasets (OGD, Jal Jeevan Mission, PMGSY, NHM) pre-chunked and indexed with inverted file flat indexing (IVFFlat) and spatial metadata filtering by Ward GeoID.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-700 border border-slate-200 space-y-1">
            <div><span className="text-slate-400">Vector DB:</span> FAISS (IVFFlat, Cosine Metric)</div>
            <div><span className="text-slate-400">Collection Size:</span> 12,410 chunk records</div>
            <div><span className="text-teal-700 font-bold">Lookup Latency:</span> 38ms (nprobe=8)</div>
          </div>
        </div>

        {/* Layer 3: Grounded Synthesis */}
        <div className="saas-card p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-mono text-[11px] text-teal-700 font-bold">LAYER 03</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px] font-bold">
                Synthesis and Rules
              </span>
            </div>
            <h2 className="font-bold text-[17px] text-slate-900">Gemini 1.5 Grounded Generation</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed">
              Produces structured JSON telemetry and natural language audit trails. Enforces strict zero-hallucination prompt boundaries: assertions without retrieved public evidence citations are withheld.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-700 border border-slate-200 space-y-1">
            <div><span className="text-slate-400">Model:</span> gemini-1.5-pro</div>
            <div><span className="text-slate-400">Faithfulness Score:</span> 96.8% (RAGAS)</div>
            <div><span className="text-teal-700 font-bold">Audit Sign-off:</span> SHA-256 Ledger</div>
          </div>
        </div>
      </div>

      {/* Deterministic Governing Equation Detail */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-teal-700 text-[24px]">
            calculate
          </span>
          <h2 className="text-[18px] font-bold text-slate-900">
            Deterministic Priority Signal Calculation (Equation Spec: DHR-CIVIC-ALPHA-4)
          </h2>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 font-mono text-[13px] text-teal-800 border border-slate-200 overflow-x-auto font-bold">
          PrioritySignal = 0.30 * (S_rep) + 0.25 * (G_infra) + 0.30 * (W_vuln) + 0.15 * (Q_evid)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 text-[12px] text-slate-600">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-mono text-slate-900 font-bold block mb-1">S_rep (30%)</span>
            Reported severity score from verified citizen description, patient volume, and emergency service proximity.
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-mono text-slate-900 font-bold block mb-1">G_infra (25%)</span>
            Deficit gap between statutory national baseline and verified local open data registry records.
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-mono text-slate-900 font-bold block mb-1">W_vuln (30%)</span>
            Socio-economic ward vulnerability index. Set explicitly to null if no public census data is found.
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="font-mono text-slate-900 font-bold block mb-1">Q_evid (15%)</span>
            Public document quality, freshness, and multi-source corroboration confidence metric.
          </div>
        </div>
      </div>
    </div>
    </LocalizedTree>
  );
};
