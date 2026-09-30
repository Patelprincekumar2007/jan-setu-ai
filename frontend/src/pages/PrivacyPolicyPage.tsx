import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff } from 'lucide-react';
import { NavigationTab } from '../types';

interface PrivacyPolicyPageProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#f0f4f9] text-slate-900 font-sans p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-teal-700" />
            <span>Back to Dashboard</span>
          </button>
          <span className="font-mono text-[11px] font-semibold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
            Effective Date: March 2026
          </span>
        </div>

        {/* Hero Card */}
        <div className="saas-card p-6 lg:p-8 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2.5 text-teal-700 font-mono text-[12px] uppercase font-bold tracking-wider">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Statutory Compliance and Data Privacy</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            NagrikLens AI operates strictly on open public datasets and anonymized citizen feedback. We prioritize citizen privacy, transparent data provenance, and ethical AI assistance.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-4">
          <div className="saas-card p-6 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Lock className="w-4 h-4 text-teal-600" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              When citizens submit reports through NagrikLens AI, we collect grievance descriptions, geographic ward selections, sector classifications, and voluntary contact handles. Personal Identifying Information is scrubbed prior to semantic vector ingestion.
            </p>
          </div>

          <div className="saas-card p-6 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Database className="w-4 h-4 text-teal-600" />
              <h2>2. Use of Public Open Data</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              All administrative grounding evidence is sourced from authorized open government portals including Jal Jeevan Mission, National Health Mission, Pradhan Mantri Gram Sadak Yojana, and Swachh Bharat Mission. No proprietary or confidential citizen records are harvested.
            </p>
          </div>

          <div className="saas-card p-6 bg-white border border-slate-200 rounded-xl space-y-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <EyeOff className="w-4 h-4 text-teal-600" />
              <h2>3. AI Processing and Anti-Hallucination Guardrails</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Citizen descriptions are processed using structured language models for entity extraction and vector similarity matching. Automated responses strictly disallow fabricated citations, ensuring every insight traces directly to ingested public records.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 py-4">
          NagrikLens AI • Public Data Grounding Engine
        </div>
      </div>
    </div>
  );
};
