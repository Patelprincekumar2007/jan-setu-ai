import React, { useState } from 'react';
import { ASSETS } from '../../data/mockData';
import { LocalizedTree } from '../../i18n';

interface PriorityInsightsViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const PriorityInsightsView: React.FC<PriorityInsightsViewProps> = ({ onShowToast }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [highlightDrawer, setHighlightDrawer] = useState<boolean>(false);
  const [isForwarding, setIsForwarding] = useState<boolean>(false);

  const handleForwardPackage = () => {
    setIsForwarding(true);
    setTimeout(() => {
      setIsForwarding(false);
      onShowToast(
        'Evidence Package Forwarded',
        'Cryptographic receipt generated: DHR-COLL-2024-8841-ACK with full formula dump and audit ledger.',
        'success'
      );
    }, 1000);
  };

  const handleOpenDrawer = () => {
    setHighlightDrawer(true);
    const element = document.getElementById('signal-engine-drawer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setTimeout(() => setHighlightDrawer(false), 2500);
  };

  return (
    <LocalizedTree>
    <div className="flex flex-col w-full pb-16 min-h-screen bg-[#f0f4f9] text-slate-900 font-sans">
      {/* Sub-header Breadcrumb and System Status Ribbon */}
      <div className="w-full bg-white px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
          <span className="text-teal-700 font-bold">CIVIC-TELEMETRY</span>
          <span>/</span>
          <span>DHARASHIV_DIST_04</span>
          <span>/</span>
          <span className="text-slate-900 font-bold">SIG-ENGINE-V2.4</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Deterministic Weighting Active</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">SPECIFICATION: TRI-FACTOR RISK MATRIX</div>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        {/* Screen Header & Mandated Transparency Banner */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col max-w-3xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[11px] uppercase font-bold border border-teal-200">
                  Statutory Auditing Layer
                </span>
                <span className="text-slate-500 text-[12px]">• Non-Automated Executive Stream</span>
              </div>
              <h1 className="text-[28px] lg:text-[32px] font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-teal-700 text-[32px]">insights</span>
                Priority Insights
              </h1>
              <p className="text-[14px] text-slate-600 mt-1 leading-relaxed">
                Evidence-backed signals that help identify where further attention or investigation
                may be useful. Strictly decision-support, not automated decisions.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-end">
              <button
                type="button"
                onClick={() =>
                  onShowToast(
                    'Export Initialized',
                    'Exporting verified cryptographic audit ledger as CSV/JSON-LD for district review.',
                    'info'
                  )
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-[13px] font-bold transition-all border border-slate-300 shadow-2xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-teal-700">file_download</span>
                <span>Export Verified Dossiers</span>
              </button>

              <button
                type="button"
                onClick={handleOpenDrawer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-bold shadow-xs transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">functions</span>
                <span>Formula Inspector</span>
              </button>
            </div>
          </div>

          {/* Statutory Transparency Notice */}
          <div className="saas-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00897b]"></div>
            <div className="flex items-start gap-3 pl-2">
              <span className="material-symbols-outlined text-teal-700 text-[24px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-slate-900">
                  Civic Decision Transparency Notice
                </span>
                <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">
                  Priority signals are analytical aids calculated exclusively from verifiable citizen inputs and authenticated public records. They do not substitute statutory administrative determinations.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 pl-2 sm:pl-0">
              <span className="font-mono text-[11px] text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 font-bold">
                RTI Sec 4(1)(b) Compliant
              </span>
            </div>
          </div>
        </section>

        {/* Top Filter & Control Strip */}
        <section className="saas-card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase text-slate-500 mr-1 font-bold font-mono">
              Domain:
            </span>
            {[
              { id: 'All', label: 'All (23)' },
              { id: 'Water', label: 'Water (8)', icon: 'water_drop', color: 'text-teal-600' },
              { id: 'Roads', label: 'Roads (6)', icon: 'commute', color: 'text-amber-600' },
              { id: 'Healthcare', label: 'Healthcare (5)', icon: 'local_hospital', color: 'text-rose-600' },
              { id: 'Sanitation', label: 'Sanitation (4)', icon: 'recycling', color: 'text-emerald-600' },
            ].map((dom) => {
              const isSelected = selectedDomain === dom.id;
              return (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => setSelectedDomain(dom.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {dom.icon && (
                    <span className={`material-symbols-outlined text-[16px] ${dom.color}`}>
                      {dom.icon}
                    </span>
                  )}
                  <span>{dom.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold">Jurisdiction:</span>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg text-[12px] text-slate-800 border border-slate-200 font-semibold">
                <span className="material-symbols-outlined text-[16px] text-rose-500">
                  location_on
                </span>
                <span>Dharashiv (All Wards)</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold">Sort:</span>
              <div className="flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg text-[12px] text-slate-800 border border-slate-200 font-semibold">
                <span>Priority Signal (High to Low)</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">
                  unfold_more
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Dual-Pane Section (7-col / 5-col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Primary Analysis Stream (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Featured In-Depth Dossier Card */}
            <div className="saas-card p-5 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-sky-500 to-indigo-500"></div>

              {/* Card Header & Badging */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200">
                      CASE #DHR-2024-W04-098
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">shield_with_heart</span>
                      <span>Public Health Impact</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">Updated 14m ago</span>
                  </div>
                  <h2 className="text-[20px] font-bold text-slate-900 leading-snug">
                    Water Infrastructure Deficit: Ward 4 Primary Health Centre, Dharashiv
                  </h2>
                </div>

                {/* Signal Gauge Block */}
                <div className="shrink-0 bg-slate-50 p-3 rounded-xl flex items-center gap-3 self-start border border-slate-200">
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold font-mono">
                      Priority Signal
                    </span>
                    <div className="flex items-baseline gap-0.5 justify-end">
                      <span className="text-[28px] text-teal-800 font-bold leading-none">72</span>
                      <span className="text-[12px] text-slate-500 font-mono">/100</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center relative">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-teal-600"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="72, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <span className="material-symbols-outlined text-[18px] text-teal-700 absolute">
                      trending_up
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlight recommendation pill */}
              <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl flex items-center gap-2.5 text-teal-800">
                <span className="material-symbols-outlined text-[20px] text-teal-700">
                  insights
                </span>
                <span className="text-[13px] font-bold">
                  High Attention Recommended: Strong Public Data Correlation
                </span>
              </div>

              {/* Facility Real-world Visual Context */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-1">
                <div className="sm:col-span-2 relative h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt="Ward 4 PHC facade"
                    src={ASSETS.phcClinicFacade}
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur font-mono text-[11px] text-white border border-slate-700">
                    Ward 4 PHC Maternal Ward Intake Wing
                  </div>
                </div>

                <div
                  className="w-full h-44 rounded-xl bg-cover bg-center relative bg-slate-100 flex flex-col justify-end p-2 border border-slate-200"
                  style={{ backgroundImage: `url('${ASSETS.mapBackground}')` }}
                >
                  <div className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur font-mono text-[11px] text-teal-300 flex items-center gap-1.5 border border-slate-700">
                    <span className="material-symbols-outlined text-[14px] text-teal-400">
                      pin_drop
                    </span>
                    <span>GeoID: 27-DHR-04-A</span>
                  </div>
                </div>
              </div>

              {/* Detailed Mathematical Contribution Breakdown */}
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[15px] text-slate-900">
                    Weighted Factor Breakdown
                  </span>
                  <span className="font-mono text-[11px] text-teal-800 font-bold">TOTAL SUM: 72.0</span>
                </div>

                <div className="space-y-3">
                  {/* Item 1: Reported Severity */}
                  <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col gap-2 border border-slate-200">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                        <span className="font-bold text-slate-900">Reported Severity</span>
                        <span className="font-mono text-[11px] text-slate-500">(Weight: 30%)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        Contribution: 27.0 pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div className="h-full bg-rose-500" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        Direct citizen impact on clinical facility: Inability to sterilize surgical instruments and sustain inpatient hydration.
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0 font-mono">
                        High Severity
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Infrastructure Gap */}
                  <div className="bg-slate-50 p-3.5 rounded-xl flex flex-col gap-2 border border-slate-200">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                        <span className="font-bold text-slate-900">Infrastructure Gap</span>
                        <span className="font-mono text-[11px] text-slate-500">(Weight: 25%)</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        Contribution: 22.5 pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                      <div className="h-full bg-teal-600" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>
                        District tap coverage 50.76% vs 78.40% state baseline norm (OGD Jal Jeevan Portal 2024).
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0 flex items-center gap-1 font-mono">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Verified via OGD
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grounding Audit Footer */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <span className="material-symbols-outlined text-[16px] text-teal-700">lock</span>
                  <span>SHA-256: 8f4a21...d09c</span>
                  <span>• Zero synthetic extrapolation</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenDrawer}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[12px] font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-teal-700">
                    schema
                  </span>
                  <span>Open Signal Provenance Drawer</span>
                </button>
              </div>
            </div>

            {/* Other District Signals Under Inspection */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[17px] text-slate-900">
                    Other District Signals Under Inspection
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-200">
                    3 Active
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Real-time sync with Zilla Parishad Grievance DB
                </span>
              </div>

              {/* Signal Card 1 */}
              <div className="saas-card p-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0 border border-rose-200">
                      <span className="material-symbols-outlined text-[20px]">alt_route</span>
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[14px] text-slate-900">
                          Pothole &amp; Base Course Erosion on State Highway 14
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">SH-14 / KM 42</span>
                      </div>
                      <span className="text-[11px] text-slate-600">
                        Between Tuljapur bypass and Kasar Balkunda junction
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-mono">SIGNAL</div>
                      <div className="text-[18px] font-bold text-slate-900">64/100</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                      <span className="font-mono text-[12px] text-teal-800 font-bold">64</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Inspector Drawer (5 cols) */}
          <div
            id="signal-engine-drawer"
            className={`lg:col-span-5 flex flex-col gap-4 sticky top-20 transition-all duration-300 rounded-2xl ${
              highlightDrawer ? 'ring-2 ring-teal-500 shadow-xl' : ''
            }`}
          >
            <div className="saas-card p-5 flex flex-col gap-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-teal-700 text-[24px]">
                    calculate
                  </span>
                  <div>
                    <h3 className="font-bold text-[15px] text-slate-900">
                      Signal Calculation Engine
                    </h3>
                    <span className="font-mono text-[10px] text-slate-500">
                      ALGORITHM SPEC: DHR-CIVIC-ALPHA-4
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Hero Box */}
              <div className="bg-slate-900 p-4 rounded-xl text-white flex flex-col gap-2.5 shadow-sm">
                <span className="font-mono text-[11px] text-teal-300 uppercase tracking-wider font-bold">
                  Formal Governing Equation
                </span>
                <div className="p-3 rounded-lg bg-white/10 font-mono text-[12px] text-white overflow-x-auto leading-relaxed border border-white/10">
                  Signal = 0.30 * (S<sub>rep</sub>) + 0.25 * (G<sub>infra</sub>) + 0.30 * (W<sub>vuln</sub>) + 0.15 * (Q<sub>evid</sub>)
                </div>
                <p className="text-[12px] text-slate-300 leading-normal">
                  Linear combination model calibrated for district-level administrative screening. Weights approved by Municipal Oversight Committee.
                </p>
              </div>

              {/* Step-by-Step Calculation Trace */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase text-slate-500 font-bold font-mono tracking-wider">
                  Step-by-Step Execution Trace
                </span>
                <div className="bg-slate-50 p-3.5 rounded-xl font-mono text-[12px] space-y-2 border border-slate-200">
                  <div className="flex justify-between items-center text-slate-800">
                    <span>1. S_rep (Severity)</span>
                    <span className="font-bold text-teal-700">90.0 * 0.30 = 27.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800">
                    <span>2. G_infra (Tap Gap: 27.6%)</span>
                    <span className="font-bold text-teal-700">90.0 * 0.25 = 22.50</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>3. W_vuln (Census null)</span>
                    <span className="font-bold">0.0 * 0.30 = 0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-800">
                    <span>4. Q_evid (2 Open Datasets)</span>
                    <span className="font-bold text-teal-700">75.0 * 0.15 = 11.25</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-slate-900 text-[14px]">
                    <span className="font-bold">Calculated Score</span>
                    <span className="text-teal-700 font-bold">60.75 &rarr; 72.00*</span>
                  </div>
                </div>
              </div>

              {/* Forward CTA */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isForwarding}
                  onClick={handleForwardPackage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-bold transition-all shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isForwarding ? 'sync' : 'forward_to_inbox'}
                  </span>
                  <span>
                    {isForwarding
                      ? 'Generating Cryptographic Dossier...'
                      : 'Forward Evidence Package to District Collectorate'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </LocalizedTree>
  );
};
