import React from 'react';
import { PIPELINE_STEPS } from '../../data/mockData';
import { NavigationTab } from '../../types';
import { LocalizedTree } from '../../i18n';

interface HowItWorksViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onNavigate }) => {
  return (
    <LocalizedTree>
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <div className="saas-card p-6 space-y-2">
        <div className="flex items-center gap-2 text-teal-700 font-mono text-[11px] uppercase font-bold">
          <span className="material-symbols-outlined text-[18px]">account_tree</span>
          <span>Procedural Transparency Blueprint</span>
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          How NagrikLens AI Works: The Auditable Pipeline
        </h1>
        <p className="text-[14px] text-slate-600 max-w-3xl leading-relaxed">
          Transforming citizen grievances into verified, legally compliant municipal interventions through Retrieval-Augmented Generation (RAG) and Open Government Data (OGD).
        </p>
      </div>

      {/* 5 Procedural Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {PIPELINE_STEPS.map((step) => (
          <div
            key={step.stepNumber}
            className="saas-card p-5 flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
                  STEP 0{step.stepNumber}
                </span>
                <span className="material-symbols-outlined text-[20px] text-teal-700">
                  {step.icon}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-slate-900">{step.title}</h2>
              <p className="text-[12px] text-slate-600 leading-relaxed">{step.fullDesc}</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="font-mono text-[10px] text-slate-500 font-semibold">{step.stateBadge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Core Civic Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="saas-card p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[24px]">balance</span>
          </div>
          <h2 className="text-[17px] font-bold text-slate-900">
            AI Decision-Support, Not Automated Governance
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Priorities and signals are provided purely to assist human civil servants, municipal engineers, and elected corporators. No citizen petition is ever discarded by an autonomous algorithm.
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <h2 className="text-[17px] font-bold text-slate-900">
            Zero Hallucination Grounding Guarantee
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            Every analytical observation must cite a verified public document chunk (Jal Jeevan Mission, PMGSY, NHM) with cosine similarity exceeding 0.82. Synthetic hallucinations are blocked at the prompt level.
          </p>
        </div>

        <div className="saas-card p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <span className="material-symbols-outlined text-[24px]">error</span>
          </div>
          <h2 className="text-[17px] font-bold text-slate-900">
            Explicit Declaration of Missing Data
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            When municipal telemetry records or census indices are missing, NagrikLens declares uncertainty explicitly rather than guessing or interpolating false statistics.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="saas-card bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-white">
            Experience the live pipeline in action
          </h2>
          <p className="text-[13px] text-slate-300 mt-0.5">
            Test how multi-lingual complaints are transformed into verified evidence dossiers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('report-a-problem')}
          className="px-5 py-2.5 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white font-bold text-[13px] shadow-xs hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
        >
          Submit Live Telemetry
        </button>
      </div>
    </div>
    </LocalizedTree>
  );
};
