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
        'Cryptographic receipt generated: DHR-COLL-2024-8841-ACK with full formula dump & audit ledger.',
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
    <div className="flex flex-col w-full pb-10">
      {/* Sub-header Breadcrumb and System Status Ribbon */}
      <div className="w-full bg-[#eff4ff] px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#e5eeff]">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#45464d]">
          <span className="text-[#006a61] font-semibold">CIVIC-TELEMETRY</span>
          <span>/</span>
          <span>DHARASHIV_DIST_04</span>
          <span>/</span>
          <span className="text-[#0b1c30] font-semibold">SIG-ENGINE-V2.4</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#006a61] bg-[#ffffff] px-2.5 py-0.5 rounded shadow-xs border border-[#dce9ff] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] animate-pulse"></span>
            <span>Deterministic Weighting Active</span>
          </div>
          <div className="font-mono text-[11px] text-[#76777d]">LATENCY: 42ms</div>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        {/* Screen Header & Mandated Transparency Banner */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col max-w-3xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase font-semibold border border-[#dce9ff]">
                  Statutory Auditing Layer
                </span>
                <span className="text-[#76777d] text-[12px]">• Non-Automated Executive Stream</span>
              </div>
              <h1 className="text-[28px] lg:text-[32px] font-bold text-[#0b1c30] tracking-tight">
                Priority Insights
              </h1>
              <p className="text-[15px] text-[#45464d] mt-1 leading-relaxed">
                Evidence-backed signals that help identify where further attention or investigation
                may be useful. Not automated government decisions.
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#dce9ff] hover:bg-[#cbdbf5] text-[#0b1c30] text-[13px] font-semibold transition-colors shadow-xs border border-[#cbdbf5] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">file_download</span>
                <span>Export Verified Dossiers</span>
              </button>

              <button
                type="button"
                onClick={handleOpenDrawer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold shadow-xs hover:bg-[#213145] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">functions</span>
                <span>Formula Inspector</span>
              </button>
            </div>
          </div>

          {/* Statutory Transparency Notice */}
          <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006a61]"></div>
            <div className="flex items-start gap-3 pl-2">
              <span
                className="material-symbols-outlined text-[#006a61] text-[24px] shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <div className="flex flex-col">
                <span className="font-semibold text-[15px] text-[#0b1c30]">
                  Civic Decision Transparency Notice
                </span>
                <p className="text-[13px] text-[#45464d] mt-0.5 leading-relaxed">
                  Priority signals are analytical aids calculated exclusively from verifiable citizen inputs and authenticated public records. They do not substitute statutory administrative determinations.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 pl-2 sm:pl-0">
              <span className="font-mono text-[11px] text-[#76777d] bg-[#eff4ff] px-2 py-1 rounded border border-[#dce9ff]">
                RTI Sec 4(1)(b) Compliant
              </span>
            </div>
          </div>
        </section>

        {/* Top Filter & Control Strip */}
        <section className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase text-[#76777d] mr-1 font-semibold">
              Domain:
            </span>
            {[
              { id: 'All', label: 'All (23)' },
              { id: 'Water', label: 'Water (8)', icon: 'water_drop', color: 'text-[#006a61]' },
              { id: 'Roads', label: 'Roads (6)', icon: 'commute', color: 'text-[#45464d]' },
              { id: 'Healthcare', label: 'Healthcare (5)', icon: 'local_hospital', color: 'text-[#ba1a1a]' },
              { id: 'Sanitation', label: 'Sanitation (4)', icon: 'recycling', color: 'text-[#45464d]' },
            ].map((dom) => {
              const isSelected = selectedDomain === dom.id;
              return (
                <button
                  key={dom.id}
                  type="button"
                  onClick={() => setSelectedDomain(dom.id)}
                  className={`px-3 py-1.5 rounded text-[12px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#000000] text-[#ffffff]'
                      : 'bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] border border-[#dce9ff]'
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
              <span className="text-[11px] text-[#45464d] font-semibold">Jurisdiction:</span>
              <div className="flex items-center gap-1 bg-[#eff4ff] px-3 py-1.5 rounded text-[12px] text-[#0b1c30] border border-[#dce9ff] font-semibold">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  location_on
                </span>
                <span>Dharashiv (All Wards)</span>
                <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#45464d] font-semibold">Sort:</span>
              <div className="flex items-center gap-1 bg-[#eff4ff] px-3 py-1.5 rounded text-[12px] text-[#0b1c30] border border-[#dce9ff] font-semibold">
                <span>Priority Signal (High to Low)</span>
                <span className="material-symbols-outlined text-[16px] text-[#76777d]">
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
            <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#e5eeff] p-5 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#006a61] via-[#6bd8cb] to-[#d3e4fe]"></div>

              {/* Card Header & Badging */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-semibold border border-[#dce9ff]">
                      CASE #DHR-2024-W04-098
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">shield_with_heart</span>
                      <span>Public Health Impact</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#76777d]">Updated 14m ago</span>
                  </div>
                  <h2 className="text-[20px] font-bold text-[#0b1c30] leading-snug">
                    Water Infrastructure Deficit — Ward 4 Primary Health Centre, Dharashiv
                  </h2>
                </div>

                {/* Signal Gauge Block */}
                <div className="shrink-0 bg-[#eff4ff] p-3 rounded-lg flex items-center gap-3 self-start border border-[#dce9ff]">
                  <div className="flex flex-col text-right">
                    <span className="text-[11px] text-[#76777d] uppercase font-semibold">
                      Priority Signal
                    </span>
                    <div className="flex items-baseline gap-0.5 justify-end">
                      <span className="text-[28px] text-[#0b1c30] font-bold leading-none">72</span>
                      <span className="text-[12px] text-[#45464d] font-mono">/100</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#dce9ff] flex items-center justify-center relative">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#ffffff]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                      />
                      <path
                        className="text-[#006a61]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeDasharray="72, 100"
                        strokeLinecap="round"
                        strokeWidth="3.5"
                      />
                    </svg>
                    <span className="material-symbols-outlined text-[18px] text-[#006a61] absolute">
                      trending_up
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlight recommendation pill */}
              <div className="bg-[#86f2e4]/30 border border-[#86f2e4] p-2.5 rounded-lg flex items-center gap-2 text-[#005049]">
                <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                  insights
                </span>
                <span className="text-[13px] font-semibold">
                  High Attention Recommended — Strong Public Data Correlation
                </span>
              </div>

              {/* Facility Real-world Visual Context */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-1">
                <div className="sm:col-span-2 relative h-44 rounded-lg overflow-hidden bg-[#eff4ff] border border-[#dce9ff]">
                  <img
                    className="w-full h-full object-cover"
                    alt="Ward 4 PHC facade"
                    src={ASSETS.phcClinicFacade}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#ffffff]/90 backdrop-blur font-mono text-[11px] text-[#0b1c30] border border-[#dce9ff]">
                    Ward 4 PHC Maternal Ward Intake Wing
                  </div>
                </div>

                <div
                  className="w-full h-44 rounded-lg bg-cover bg-center relative bg-[#eff4ff] flex flex-col justify-end p-2 border border-[#dce9ff]"
                  style={{ backgroundImage: `url('${ASSETS.mapBackground}')` }}
                >
                  <div className="px-2 py-0.5 rounded bg-[#ffffff]/90 backdrop-blur font-mono text-[11px] text-[#0b1c30] flex items-center gap-1 border border-[#dce9ff]">
                    <span className="material-symbols-outlined text-[12px] text-[#006a61]">
                      pin_drop
                    </span>
                    <span>GeoID: 27-DHR-04-A</span>
                  </div>
                </div>
              </div>

              {/* Detailed Mathematical Contribution Breakdown */}
              <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[15px] text-[#0b1c30]">
                    Weighted Factor Breakdown
                  </span>
                  <span className="font-mono text-[11px] text-[#76777d]">TOTAL SUM: 72.0</span>
                </div>

                <div className="space-y-3">
                  {/* Item 1: Reported Severity */}
                  <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1.5 border border-[#dce9ff]">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#ba1a1a]"></span>
                        <span className="font-semibold text-[#0b1c30]">Reported Severity</span>
                        <span className="font-mono text-[11px] text-[#76777d]">(Weight: 30%)</span>
                      </div>
                      <span className="font-mono font-semibold text-[#0b1c30]">
                        Contribution: 27.0 pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#dce9ff] overflow-hidden flex">
                      <div className="h-full bg-[#ba1a1a]" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#45464d]">
                      <span>
                        Direct citizen impact on clinical facility: Inability to sterilize surgical instruments &amp; sustain overnight inpatient hydration.
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] text-[11px] font-semibold shrink-0">
                        High Severity
                      </span>
                    </div>
                  </div>

                  {/* Item 2: Infrastructure Gap */}
                  <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1.5 border border-[#dce9ff]">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#006a61]"></span>
                        <span className="font-semibold text-[#0b1c30]">Infrastructure Gap</span>
                        <span className="font-mono text-[11px] text-[#76777d]">(Weight: 25%)</span>
                      </div>
                      <span className="font-mono font-semibold text-[#0b1c30]">
                        Contribution: 22.5 pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#dce9ff] overflow-hidden flex">
                      <div className="h-full bg-[#006a61]" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#45464d]">
                      <span>
                        District tap coverage 50.76% vs 78.40% state baseline norm (OGD Jal Jeevan Portal 2024).
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#86f2e4] text-[#005049] text-[11px] font-semibold shrink-0 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Verified via OGD
                      </span>
                    </div>
                  </div>

                  {/* Item 3: Missing Data Protocol Callout */}
                  <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1.5 border border-[#dce9ff] relative overflow-hidden">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#76777d]"></span>
                        <span className="font-semibold text-[#0b1c30]">
                          Socio-Economic Vulnerability Index
                        </span>
                        <span className="font-mono text-[11px] text-[#76777d]">(Weight: 30%)</span>
                      </div>
                      <span className="font-mono font-semibold text-[#76777d]">
                        Contribution: 0.0 pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#dce9ff] overflow-hidden flex">
                      <div className="h-full bg-[#c6c6cd]" style={{ width: '0%' }}></div>
                    </div>
                    <div className="p-2 rounded bg-[#ffffff] border border-[#dce9ff] flex items-start gap-2 text-[11px] text-[#45464d]">
                      <span className="material-symbols-outlined text-[#76777d] text-[16px] shrink-0 mt-0.5">
                        info
                      </span>
                      <span className="font-mono">
                        <strong className="text-[#0b1c30]">Insufficient Evidence:</strong> No
                        verified socio-economic vulnerability census dataset available for Ward 4. System
                        assigned zero weight without synthetic imputation.
                      </span>
                    </div>
                  </div>

                  {/* Item 4: Evidence Coverage */}
                  <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col gap-1.5 border border-[#dce9ff]">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#131b2e]"></span>
                        <span className="font-semibold text-[#0b1c30]">
                          Evidence Coverage &amp; Recency
                        </span>
                        <span className="font-mono text-[11px] text-[#76777d]">(Weight: 15%)</span>
                      </div>
                      <span className="font-mono font-semibold text-[#0b1c30]">
                        Contribution: 11.2 pts
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#dce9ff] overflow-hidden flex">
                      <div className="h-full bg-[#131b2e]" style={{ width: '75%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#45464d]">
                      <span>
                        2 verified municipal registries retrieved (MJP Maharashtra pipeline map + NHM Health Facility Log).
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] text-[11px] font-semibold shrink-0">
                        Partial Coverage
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grounding Audit Footer and Trigger Drawer */}
              <div className="pt-2 border-t border-[#eff4ff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#45464d] font-mono text-[11px]">
                  <span className="material-symbols-outlined text-[16px] text-[#006a61]">lock</span>
                  <span>SHA-256: 8f4a21...d09c</span>
                  <span>• Zero synthetic extrapolation</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenDrawer}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-[12px] font-semibold transition-colors border border-[#dce9ff] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#006a61]">
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
                  <span className="font-bold text-[17px] text-[#0b1c30]">
                    Other District Signals Under Inspection
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-semibold border border-[#dce9ff]">
                    3 Active
                  </span>
                </div>
                <span className="text-[11px] text-[#76777d]">
                  Real-time sync with Zilla Parishad Grievance DB
                </span>
              </div>

              {/* Signal Card 1 */}
              <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#ba1a1a] shrink-0 border border-[#dce9ff]">
                      <span className="material-symbols-outlined text-[18px]">alt_route</span>
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[#0b1c30]">
                          Pothole &amp; Base Course Erosion on State Highway 14
                        </span>
                        <span className="font-mono text-[11px] text-[#76777d]">SH-14 / KM 42</span>
                      </div>
                      <span className="text-[11px] text-[#45464d]">
                        Between Tuljapur bypass and Kasar Balkunda junction
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#76777d]">SIGNAL</div>
                      <div className="text-[18px] font-bold text-[#0b1c30]">64/100</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#dce9ff] flex items-center justify-center">
                      <span className="font-mono text-[12px] text-[#006a61] font-bold">64</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#eff4ff] p-2 rounded-lg text-[11px] border border-[#dce9ff]">
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                      verified
                    </span>
                    <span><strong>Coverage:</strong> Strong</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-[15px] text-[#76777d]">
                      database
                    </span>
                    <span>PMGSY &amp; PWD Records</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                      check_circle
                    </span>
                    <span><strong>Missing Data:</strong> None</span>
                  </div>
                </div>
              </div>

              {/* Signal Card 2 */}
              <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] shrink-0 border border-[#dce9ff]">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[#0b1c30]">
                          Primary School Sanitation Line Blockage (ZP School 3)
                        </span>
                        <span className="font-mono text-[11px] text-[#76777d]">EDU-DHR-88</span>
                      </div>
                      <span className="text-[11px] text-[#45464d]">
                        Affects 320 enrolled primary pupils; water backflow reported
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#76777d]">SIGNAL</div>
                      <div className="text-[18px] font-bold text-[#0b1c30]">58/100</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center border border-[#dce9ff]">
                      <span className="font-mono text-[12px] text-[#0b1c30] font-bold">58</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#eff4ff] p-2 rounded-lg text-[11px] border border-[#dce9ff]">
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">
                      offline_bolt
                    </span>
                    <span><strong>Coverage:</strong> Partial</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2">
                    <span className="material-symbols-outlined text-[15px] text-[#76777d]">
                      description
                    </span>
                    <span>UDISE+ Infrastructure Audit</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 text-[#76777d]">
                    <span className="material-symbols-outlined text-[15px] text-[#ba1a1a]">
                      warning
                    </span>
                    <span><strong>Missing:</strong> Flow rate telemetry</span>
                  </div>
                </div>
              </div>

              {/* Signal Card 3 */}
              <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#76777d] shrink-0 border border-[#dce9ff]">
                      <span className="material-symbols-outlined text-[18px]">vaccines</span>
                    </span>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[#0b1c30]">
                          Sub-centre Cold Storage Power Fluctuations
                        </span>
                        <span className="font-mono text-[11px] text-[#76777d]">HEALTH-SC-12</span>
                      </div>
                      <span className="text-[11px] text-[#45464d]">
                        Immunization stock at risk; solar backup inverter fault alert
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#76777d]">SIGNAL</div>
                      <div className="text-[18px] font-bold text-[#0b1c30]">51/100</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#eff4ff] flex items-center justify-center border border-[#dce9ff]">
                      <span className="font-mono text-[12px] text-[#0b1c30] font-bold">51</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-[#eff4ff] p-2 rounded-lg text-[11px] border border-[#dce9ff]">
                  <div className="flex items-center gap-1.5 px-2 text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[15px]">hourglass_empty</span>
                    <span><strong>Coverage:</strong> Insufficient Evidence</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 text-[#45464d]">
                    <span className="material-symbols-outlined text-[15px] text-[#76777d]">link_off</span>
                    <span>DISCOM outage log not integrated</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 text-[#45464d]">
                    <span className="material-symbols-outlined text-[15px] text-[#76777d]">rule</span>
                    <span>Weighting scaled to 0.4x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Real-World Photographs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Active Sensor Telemetry
                </span>
                <div className="h-32 rounded-lg bg-[#eff4ff] relative overflow-hidden flex items-end p-2 border border-[#dce9ff]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Digital pressure meter"
                    src={ASSETS.waterPressureGauge}
                  />
                  <div className="relative z-10 bg-[#ffffff]/90 backdrop-blur px-2 py-0.5 rounded font-mono text-[11px] text-[#0b1c30] border border-[#dce9ff]">
                    Ward 4 Main: 0.12 Bar (Critical Low)
                  </div>
                </div>
                <span className="text-[12px] text-[#45464d]">
                  Automated pressure drop recorded at 04:15 IST corroborate citizen reports.
                </span>
              </div>

              <div className="bg-[#ffffff] rounded-xl p-4 shadow-xs border border-[#e5eeff] flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-[#76777d] uppercase tracking-wider">
                  Public Evidence Repository
                </span>
                <div className="h-32 rounded-lg bg-[#eff4ff] relative overflow-hidden flex items-end p-2 border border-[#dce9ff]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Records repository"
                    src={ASSETS.recordsRepository}
                  />
                  <div className="relative z-10 bg-[#ffffff]/90 backdrop-blur px-2 py-0.5 rounded font-mono text-[11px] text-[#0b1c30] border border-[#dce9ff]">
                    MJP Jal Jeevan Audit 2023-24
                  </div>
                </div>
                <span className="text-[12px] text-[#45464d]">
                  Cross-referenced against Maharashtra Water Supply Gazette Vol. 48.
                </span>
              </div>
            </div>
          </div>

          {/* Right Inspector / Mathematical Detail Drawer (5 cols) */}
          <div
            id="signal-engine-drawer"
            className={`lg:col-span-5 flex flex-col gap-4 sticky top-20 transition-all duration-300 rounded-xl ${
              highlightDrawer ? 'ring-2 ring-[#006a61] shadow-xl' : ''
            }`}
          >
            <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#e5eeff] p-5 flex flex-col gap-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006a61] text-[24px]">
                    calculate
                  </span>
                  <div>
                    <h3 className="font-semibold text-[15px] text-[#0b1c30]">
                      Signal Calculation Engine
                    </h3>
                    <span className="font-mono text-[10px] text-[#76777d]">
                      ALGORITHM SPEC: DHR-CIVIC-ALPHA-4
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onShowToast('Math Proof Downloaded', 'Deterministic LaTeX proof and weights specification downloaded.')
                  }
                  className="p-1.5 rounded hover:bg-[#eff4ff] text-[#76777d] hover:text-[#0b1c30] transition-colors border border-[#dce9ff]"
                  title="Download Math Proof"
                >
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </button>
              </div>

              {/* Formula Hero Box */}
              <div className="bg-[#131b2e] p-4 rounded-lg text-[#ffffff] flex flex-col gap-2 shadow-xs border border-[#3f465c]/40">
                <span className="font-mono text-[11px] text-[#bec6e0] uppercase tracking-wider font-semibold">
                  Formal Governing Equation
                </span>
                <div className="p-2 rounded bg-[#ffffff]/10 font-mono text-[12px] text-[#ffffff] overflow-x-auto leading-relaxed border border-[#ffffff]/10">
                  Signal = 0.30 &times; (S<sub>rep</sub>) + 0.25 &times; (G<sub>infra</sub>) + 0.30 &times; (W<sub>vuln</sub>) + 0.15 &times; (Q<sub>evid</sub>)
                </div>
                <p className="text-[12px] text-[#bec6e0] leading-normal">
                  Linear combination model calibrated for district-level administrative screening. Weights approved by Municipal Oversight Committee.
                </p>
              </div>

              {/* Operational Missing Data Rule Callout */}
              <div className="bg-[#eff4ff] p-4 rounded-lg flex flex-col gap-2 border border-[#dce9ff]">
                <div className="flex items-center gap-2 text-[#0b1c30] font-semibold text-[14px]">
                  <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                    policy
                  </span>
                  <span>Handling of Missing Data Protocol</span>
                </div>
                <div className="p-2 rounded bg-[#ffffff] text-[12px] text-[#0b1c30] leading-normal border border-[#dce9ff]">
                  “If a factor lacks verified records, its weighting is normalized or flagged as{' '}
                  <strong>‘Insufficient Evidence’</strong> rather than guessed.”
                </div>
                <ul className="text-[11px] text-[#45464d] space-y-1.5 mt-0.5 list-disc pl-4 leading-normal">
                  <li>No synthetic imputation or heuristic filling is legally permissible.</li>
                  <li>Missing indices receive explicitly null weight, preventing false escalation.</li>
                  <li>A mandatory missing data caveat is automatically appended to dispatch memos.</li>
                </ul>
              </div>

              {/* Step-by-Step Calculation Trace */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase text-[#76777d] font-semibold tracking-wider">
                  Step-by-Step Execution Trace
                </span>
                <div className="bg-[#eff4ff] p-3 rounded-lg font-mono text-[12px] space-y-2 border border-[#dce9ff]">
                  <div className="flex justify-between items-center text-[#0b1c30]">
                    <span>1. S_rep (Severity)</span>
                    <span className="font-bold">90.0 &times; 0.30 = 27.00</span>
                  </div>
                  <div className="flex justify-between items-center text-[#0b1c30]">
                    <span>2. G_infra (Tap Gap: 27.6%)</span>
                    <span className="font-bold">90.0 &times; 0.25 = 22.50</span>
                  </div>
                  <div className="flex justify-between items-center text-[#76777d]">
                    <span className="flex items-center gap-1">
                      <span>3. W_vuln (Census null)</span>
                      <span className="px-1 py-0.2 rounded bg-[#dce9ff] text-[#0b1c30] text-[10px]">
                        NULL
                      </span>
                    </span>
                    <span className="font-bold">0.0 &times; 0.30 = 0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-[#0b1c30]">
                    <span>4. Q_evid (2 Open Datasets)</span>
                    <span className="font-bold">75.0 &times; 0.15 = 11.25</span>
                  </div>
                  <div className="pt-2 border-t border-[#dce9ff] flex justify-between items-center text-[#0b1c30] text-[14px]">
                    <span className="font-semibold">Calculated Score</span>
                    <span className="text-[#006a61] font-bold">60.75 &rarr; 72.00*</span>
                  </div>
                  <div className="text-[10px] text-[#76777d] font-sans">
                    *Normalized over available evidence domains (0.70 non-null denominator).
                  </div>
                </div>
              </div>

              {/* Integrated Public Data Registries Links */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase text-[#76777d] font-semibold tracking-wider">
                  Integrated Public Data Registries
                </span>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                        cloud_done
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-[#0b1c30] font-semibold">
                          OGD Jal Jeevan Mission API
                        </span>
                        <span className="font-mono text-[10px] text-[#76777d]">
                          data.gov.in/dataset/jjm-dharashiv
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                      open_in_new
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#006a61]">
                        cloud_done
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-[#0b1c30] font-semibold">
                          National Health Mission GIS Facility Log
                        </span>
                        <span className="font-mono text-[10px] text-[#76777d]">
                          nhm.gov.in/phc-geo-inventory-v2
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-[#76777d]">
                      open_in_new
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#76777d]">
                        cloud_off
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[12px] text-[#0b1c30] font-semibold">
                          Ward Socio-Demographic Census 2021+
                        </span>
                        <span className="font-mono text-[10px] text-[#ba1a1a] font-medium">
                          Dataset Pending State Release
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-[#76777d]">UNAVAILABLE</span>
                  </div>
                </div>
              </div>

              {/* Statutory Action CTA Button */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  disabled={isForwarding}
                  onClick={handleForwardPackage}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#000000] text-[#ffffff] hover:bg-[#213145] text-[13px] font-semibold transition-colors shadow-md cursor-pointer"
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
                <p className="font-mono text-center text-[#76777d] text-[10px]">
                  Generates cryptographic sign-off packet with Ward 4 geo-tagging &amp; full formula dump.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </LocalizedTree>
  );
};
