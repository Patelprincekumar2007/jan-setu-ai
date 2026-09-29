import React from 'react';
import { LocalizedTree } from '../../i18n';

export const TechArchitectureView: React.FC = () => {
  return (
    <LocalizedTree>
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-2">
        <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>System Specifications &amp; Technical Architecture</span>
        </div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
          NagrikLens AI Technical Blueprint
        </h1>
        <p className="text-[14px] text-[#45464d] max-w-3xl leading-relaxed">
          The hybrid neural-symbolic architecture ensuring semantic retrieval across Indian regional languages and deterministic municipal priority calculation.
        </p>
      </div>

      {/* Layer 1: Ingestion & Embeddings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <span className="font-mono text-[11px] text-[#006a61] font-bold">LAYER 01</span>
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[10px] font-semibold border border-[#dce9ff]">
              Ingestion &amp; Dialect
            </span>
          </div>
          <h2 className="font-bold text-[16px] text-[#0b1c30]">Multi-Dialect IndicBERT &amp; MiniLM</h2>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Ingests grievance text or transcribed speech in Marathi, Hindi, Gujarati, or Indian English. Encodes narratives into 384-dimensional dense vectors where semantic meaning aligns across scripts.
          </p>
          <div className="p-2.5 rounded bg-[#eff4ff] font-mono text-[11px] text-[#45464d] border border-[#dce9ff] space-y-1">
            <div>Embedding: paraphrase-multilingual-MiniLM-L12-v2</div>
            <div>Context Length: 1,024 tokens</div>
            <div>Inference Latency: 142ms avg</div>
          </div>
        </div>

        {/* Layer 2: Vector Search */}
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <span className="font-mono text-[11px] text-[#006a61] font-bold">LAYER 02</span>
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[10px] font-semibold border border-[#dce9ff]">
              Vector Indexing
            </span>
          </div>
          <h2 className="font-bold text-[16px] text-[#0b1c30]">FAISS &amp; ChromaDB Grounding Store</h2>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            14 verified ministerial datasets (OGD, Jal Jeevan Mission, PMGSY, NHM) pre-chunked and indexed with inverted file flat indexing (IVFFlat) and spatial metadata filtering by Ward GeoID.
          </p>
          <div className="p-2.5 rounded bg-[#eff4ff] font-mono text-[11px] text-[#45464d] border border-[#dce9ff] space-y-1">
            <div>Vector DB: FAISS (IVFFlat, Cosine Metric)</div>
            <div>Collection Size: 12,410 chunk records</div>
            <div>Lookup Latency: 38ms (nprobe=8)</div>
          </div>
        </div>

        {/* Layer 3: Grounded Synthesis */}
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <span className="font-mono text-[11px] text-[#006a61] font-bold">LAYER 03</span>
            <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[10px] font-semibold border border-[#dce9ff]">
              Synthesis &amp; Rules
            </span>
          </div>
          <h2 className="font-bold text-[16px] text-[#0b1c30]">Gemini 1.5 Grounded Generation</h2>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Produces structured JSON telemetry and natural language audit trails. Enforces strict zero-hallucination prompt boundaries: assertions without retrieved public evidence citations are withheld.
          </p>
          <div className="p-2.5 rounded bg-[#eff4ff] font-mono text-[11px] text-[#45464d] border border-[#dce9ff] space-y-1">
            <div>Model: gemini-1.5-pro-002</div>
            <div>Faithfulness Score: 96.8% (RAGAS)</div>
            <div>Audit Sign-off: SHA-256 Ledger</div>
          </div>
        </div>
      </div>

      {/* Deterministic Governing Equation Detail */}
      <div className="bg-[#131b2e] text-[#ffffff] p-6 rounded-xl border border-[#3f465c]/40 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#89f5e7] text-[22px]">
            calculate
          </span>
          <h2 className="text-[18px] font-bold text-[#ffffff]">
            Deterministic Priority Signal Calculation (Equation Spec: DHR-CIVIC-ALPHA-4)
          </h2>
        </div>

        <div className="p-3 rounded-lg bg-[#ffffff]/10 font-mono text-[13px] text-[#89f5e7] border border-[#ffffff]/15 overflow-x-auto">
          PrioritySignal = 0.30 &times; (S_rep) + 0.25 &times; (G_infra) + 0.30 &times; (W_vuln) + 0.15 &times; (Q_evid)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1 text-[12px] text-[#bec6e0]">
          <div>
            <span className="font-mono text-[#ffffff] font-bold block mb-1">S_rep (30%)</span>
            Reported severity score from verified citizen description, patient volume, and emergency service proximity.
          </div>
          <div>
            <span className="font-mono text-[#ffffff] font-bold block mb-1">G_infra (25%)</span>
            Infrastructure gap derived from ministerial OGD registers (e.g. 50.76% tap coverage vs 78.4% state norm).
          </div>
          <div>
            <span className="font-mono text-[#ffffff] font-bold block mb-1">W_vuln (30%)</span>
            Ward demographic vulnerability index. Assigned explicitly null weight if public census data is missing.
          </div>
          <div>
            <span className="font-mono text-[#ffffff] font-bold block mb-1">Q_evid (15%)</span>
            Evidence recency and citation density across matching governmental telemetry records.
          </div>
        </div>
      </div>
    </div>
    </LocalizedTree>
  );
};
