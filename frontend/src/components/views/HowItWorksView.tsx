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
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-2">
        <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          <span>Procedural Transparency Blueprint</span>
        </div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
          How NagrikLens AI Works: The Auditable Pipeline
        </h1>
        <p className="text-[14px] text-[#45464d] max-w-3xl leading-relaxed">
          Transforming citizen grievances into verified, legally compliant municipal interventions through Retrieval-Augmented Generation (RAG) and Open Government Data (OGD).
        </p>
      </div>

      {/* 5 Procedural Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {PIPELINE_STEPS.map((step) => (
          <div
            key={step.stepNumber}
            className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between gap-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-[#006a61]">
                  STEP 0{step.stepNumber}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                  {step.icon}
                </span>
              </div>
              <h2 className="text-[15px] font-bold text-[#0b1c30]">{step.title}</h2>
              <p className="text-[12px] text-[#45464d] leading-relaxed">{step.fullDesc}</p>
            </div>
            <div className="pt-2 border-t border-[#eff4ff]">
              <span className="font-mono text-[10px] text-[#76777d]">{step.stateBadge}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Core Civic Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006a61]">
            <span className="material-symbols-outlined text-[22px]">balance</span>
          </div>
          <h2 className="text-[16px] font-bold text-[#0b1c30]">
            AI Decision-Support, Not Automated Governance
          </h2>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Priorities and signals are provided purely to assist human civil servants, municipal engineers, and elected corporators. No citizen's petition is ever discarded by an autonomous algorithm.
          </p>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006a61]">
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <h2 className="text-[16px] font-bold text-[#0b1c30]">
            Zero Hallucination Grounding Guarantee
          </h2>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Every analytical observation must cite a verified public document chunk (Jal Jeevan Mission, PMGSY, NHM) with cosine similarity exceeding 0.82. Synthetic hallucinations are blocked at the prompt level.
          </p>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-[22px]">error</span>
          </div>
          <h2 className="text-[16px] font-bold text-[#0b1c30]">
            Explicit Declaration of Missing Data
          </h2>
          <p className="text-[13px] text-[#45464d] leading-relaxed">
            When municipal telemetry records or census indices are missing, NagrikLens declares uncertainty explicitly rather than guessing or interpolating false statistics.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#131b2e] text-[#ffffff] p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-bold text-[#ffffff]">
            Experience the live pipeline in action
          </h2>
          <p className="text-[13px] text-[#bec6e0] mt-0.5">
            Test how multi-lingual complaints are transformed into verified evidence dossiers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('report-a-problem')}
          className="px-5 py-2.5 rounded-lg bg-[#86f2e4] text-[#005049] font-bold text-[13px] hover:bg-[#89f5e7] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          File Live Telemetry Report →
        </button>
      </div>
    </div>
    </LocalizedTree>
  );
};
