import React, { useState, useEffect } from 'react';
import { CitizenReport, NavigationTab } from '../../types';
import { PIPELINE_STEPS, PUBLIC_DATASETS, ASSETS } from '../../data/mockData';
import { useT } from '../../i18n';

interface DashboardViewProps {
  reports: CitizenReport[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenReportModal: () => void;
  onSelectReportForInspection: (report: CitizenReport) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  onNavigate,
  onOpenReportModal,
  onSelectReportForInspection,
  onShowToast,
}) => {
  const t = useT();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'verified-docs' | 'map'>('reports');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedReportId, setSelectedReportId] = useState<string>('rep-8821');
  const [customDialectInput, setCustomDialectInput] = useState<string>('');

  // Simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev % 5) + 1);
      }, 2400);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  const currentStepData = PIPELINE_STEPS.find((s) => s.stepNumber === activeStep) || PIPELINE_STEPS[0];
  const selectedReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  // Filter reports
  const filteredReports = reports.filter((r) => {
    if (categoryFilter === 'All') return true;
    return r.category.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full flex flex-col gap-6">
      {/* Interactive Fast Track / Judge Guided Pipeline Tour Banner */}
      <section className="rounded-xl bg-[#131b2e] text-[#ffffff] shadow-md overflow-hidden relative border border-[#3f465c]/30">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#006a61]/25 blur-3xl pointer-events-none"></div>

        <div className="p-4 lg:p-6 flex flex-col gap-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#86f2e4] text-[#005049]">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </span>
              <span className="font-mono text-[11px] tracking-wider uppercase text-[#89f5e7] font-semibold">
                {t('60-90s Rapid Audit')}
              </span>
              <span className="text-[#7c839b] font-mono text-[11px]">•</span>
              <h2 className="font-semibold text-[15px] text-[#ffffff]">
                {t('Judge & Reviewer Fast Track Walkthrough')}
              </h2>
            </div>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#d3e4fe]/15 text-[#bec6e0] border border-[#bec6e0]/20">
              {t('Auditable Pipeline v2.4')}
            </span>
          </div>

          <p className="text-[13px] text-[#bec6e0] max-w-4xl leading-relaxed">
            {t('Follow the five procedural checkpoints transforming raw community complaints into legally auditable, open-data verified municipal interventions.')}
          </p>

          {/* Pipeline Sequence Bar with Step Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
            {PIPELINE_STEPS.map((step) => {
              const isSelected = activeStep === step.stepNumber;
              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => {
                    setActiveStep(step.stepNumber);
                    setIsSimulating(false);
                  }}
                  className={`text-left p-2.5 rounded-lg transition-all flex flex-col gap-1 border ${
                    isSelected
                      ? 'bg-[#d3e4fe]/35 border-[#89f5e7] ring-1 ring-[#89f5e7] shadow-sm'
                      : 'bg-[#d3e4fe]/10 border-transparent hover:bg-[#d3e4fe]/20 text-[#bec6e0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        isSelected ? 'text-[#89f5e7]' : 'text-[#cbdbf5]'
                      }`}
                    >
                      {t('STEP')} 0{step.stepNumber}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        isSelected ? 'text-[#89f5e7]' : 'text-[#cbdbf5]'
                      }`}
                    >
                      {step.icon}
                    </span>
                  </div>
                  <span className="font-semibold text-[13px] text-[#ffffff] truncate">
                    {t(step.title)}
                  </span>
                  <span className="text-[12px] text-[#bec6e0] line-clamp-1">
                    {t(step.shortDesc)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Step Inspector Strip */}
          <div className="mt-1 bg-[#eff4ff]/10 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[#d3e4fe]/20">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 rounded bg-[#006a61] text-[#ffffff] font-mono text-[11px] font-semibold whitespace-nowrap">
                {currentStepData.stateBadge}
              </span>
              <p className="text-[13px] text-[#ffffff] leading-snug">
                <strong className="text-[#89f5e7]">{t('Step')} {activeStep} {t('Active:')}</strong>{' '}
                {t(currentStepData.fullDesc)}
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-3 py-1.5 rounded bg-[#006a61] text-[#ffffff] font-semibold text-[12px] hover:bg-[#005049] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSimulating ? 'pause_circle' : 'play_circle'}
                </span>
                <span>{isSimulating ? t('Pause Simulation') : t('Run Live Simulation')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSimulating(false);
                  setActiveStep(1);
                  onShowToast(t('Tour Reset'), t('Walkthrough reset to Step 1 (Citizen Grievance Ingest)'));
                }}
                className="px-2.5 py-1.5 rounded bg-[#d3e4fe]/20 text-[#ffffff] font-medium text-[12px] hover:bg-[#d3e4fe]/30 transition-colors"
              >
                {t('Reset')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome & Context Header Strip with Direct Action Triggers */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-1">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#006a61] font-semibold uppercase tracking-wider">
              {t('Public Intelligence Hub')}
            </span>
            <span className="text-[#76777d] font-mono text-[11px]">•</span>
            <span className="font-mono text-[11px] text-[#45464d]">GeoID: MH-DHA-2024</span>
          </div>
          <h1 className="font-bold text-[28px] lg:text-[32px] text-[#0b1c30] tracking-tight">
            {t('Good morning, Anita')}
          </h1>
          <p className="text-[15px] text-[#45464d] max-w-3xl leading-relaxed">
            {t('Track community infrastructure reports, verify public data coverage, and understand evidence-grounded civic priorities.')}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenReportModal}
            className="px-4 py-2.5 rounded-lg bg-[#006a61] text-[#ffffff] font-semibold text-[13px] hover:bg-[#005049] transition-all shadow-md flex items-center gap-2 group cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
              add_circle
            </span>
            <span>+ {t('Report a Problem')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('explore-issues')}
            className="px-4 py-2.5 rounded-lg bg-[#dce9ff] text-[#0b1c30] font-semibold text-[13px] hover:bg-[#cbdbf5] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#006a61]">
              explore
            </span>
            <span>{t('Explore Ward Map')}</span>
          </button>
        </div>
      </header>

      {/* High-Legibility KPI Summary Tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#45464d] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
              {t('Citizen Tracker')}
            </span>
            <span className="material-symbols-outlined text-[#006a61] text-[22px]">
              assignment_turned_in
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] text-[#0b1c30] font-bold leading-tight">4</span>
              <span className="text-[13px] text-[#45464d]">{t('Submitted Reports')}</span>
            </div>
            <p className="font-mono text-[11px] text-[#006a61] mt-1 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
              {t('2 Active Under Review')} <span className="text-[#76777d] font-normal">|</span> {t('2 Resolved')}
            </p>
          </div>
          <div className="mt-3 pt-2 bg-[#eff4ff] rounded px-2.5 py-1.5 flex items-center justify-between text-[#45464d] text-[12px]">
            <span>{t('Resolution rate: 50%')}</span>
            <span className="font-mono text-[11px] text-[#006a61] font-semibold">{t('SLA: 48h avg')}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#45464d] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
              {t('District Scope')}
            </span>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[22px]">
              warning
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] text-[#0b1c30] font-bold leading-tight">28</span>
              <span className="text-[13px] text-[#45464d]">{t('Active Incidents')}</span>
            </div>
            <p className="text-[12px] text-[#45464d] mt-1">
              {t('Across Dharashiv District (Ward 1 - Ward 12)')}
            </p>
          </div>
          <div className="mt-3 pt-2 bg-[#eff4ff] rounded px-2.5 py-1.5 flex items-center justify-between text-[#45464d] text-[12px]">
            <span className="text-[#ba1a1a] font-semibold">{t('8 Critical Priority')}</span>
            <span className="font-mono text-[11px] text-[#0b1c30]">{t('20 Moderate')}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#45464d] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
              {t('Vector Grounding')}
            </span>
            <span className="material-symbols-outlined text-[#006a61] text-[22px]">
              dataset
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] text-[#0b1c30] font-bold leading-tight">14</span>
              <span className="text-[13px] text-[#45464d]">{t('Public Datasets')}</span>
            </div>
            <p className="text-[12px] text-[#45464d] mt-1 truncate">
              {t('Linked OGD, JJM, PMGSY, & NHM Feeds')}
            </p>
          </div>
          <div className="mt-3 pt-2 bg-[#eff4ff] rounded px-2.5 py-1.5 flex items-center justify-between text-[12px]">
            <span className="font-mono text-[11px] text-[#006a61] font-semibold">12,410 Records</span>
            <span className="font-mono text-[11px] text-[#76777d]">Updated 1h ago</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#45464d] mb-2">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
              {t('Evidence Coverage')}
            </span>
            <span className="material-symbols-outlined text-[#006a61] text-[22px]">
              donut_large
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] text-[#006a61] font-bold leading-tight">84.2%</span>
              <span className="text-[13px] text-[#45464d]">{t('Validated Ratio')}</span>
            </div>
            <p className="text-[12px] text-[#45464d] mt-1">
              {t('Reports with verifiable public records')}
            </p>
          </div>
          <div className="mt-3">
            <div className="w-full bg-[#dce9ff] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#006a61] h-full" style={{ width: '84.2%' }}></div>
              <div className="bg-[#c6c6cd] h-full" style={{ width: '15.8%' }}></div>
            </div>
            <div className="flex justify-between items-center text-[#76777d] font-mono text-[11px] pt-1">
              <span>Verified Ground Truth</span>
              <span>15.8% Uncorroborated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dual-Pane Workspace Section (7 / 5 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Primary Workspace (7 Cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Section Navigation & Filter Bar */}
          <div className="bg-[#ffffff] p-2.5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                    : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                Recent Reports ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('verified-docs')}
                className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                  activeTab === 'verified-docs'
                    ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                    : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                Evidence Dossiers
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all ${
                  activeTab === 'map'
                    ? 'bg-[#ffffff] text-[#0b1c30] shadow-xs'
                    : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                Ward GIS Map
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#76777d] uppercase tracking-wider font-semibold">
                Filter:
              </span>
              <select
                className="bg-[#eff4ff] text-[#0b1c30] text-[12px] font-medium rounded px-2.5 py-1 outline-none border border-[#dce9ff] cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Water">Water Infrastructure</option>
                <option value="Roads">Roads &amp; Transit</option>
                <option value="Electricity">Power &amp; Energy</option>
                <option value="Sanitation">Public Sanitation</option>
              </select>
            </div>
          </div>

          {/* TAB 1: REPORTS LIST VIEW */}
          {activeTab === 'reports' && (
            <div className="flex flex-col gap-3">
              {filteredReports.map((report) => {
                const isSelected = selectedReportId === report.id;
                return (
                  <article
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`bg-[#ffffff] rounded-xl p-4 shadow-xs border transition-all flex flex-col gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#006a61] ring-1 ring-[#006a61]'
                        : 'border-[#e5eeff] hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-bold border border-[#dce9ff]">
                          {report.ticketId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] text-[12px] font-medium flex items-center gap-1">
                          <span
                            className={`material-symbols-outlined text-[14px] ${
                              report.category === 'Water'
                                ? 'text-[#006a61]'
                                : report.category === 'Roads'
                                ? 'text-[#ba1a1a]'
                                : 'text-[#76777d]'
                            }`}
                          >
                            {report.category === 'Water'
                              ? 'water_drop'
                              : report.category === 'Roads'
                              ? 'add_road'
                              : report.category === 'Electricity'
                              ? 'solar_power'
                              : 'cleaning_services'}
                          </span>
                          {report.category}
                        </span>
                        <span className="text-[12px] text-[#76777d]">{report.location}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#76777d]">
                        {report.timestamp}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="font-semibold text-[17px] text-[#0b1c30] leading-snug">
                        {report.title}
                      </h3>
                      <p className="text-[14px] text-[#45464d] leading-relaxed">
                        {report.narrative}
                      </p>
                    </div>

                    {/* Badges & Metrics */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {report.evidenceFound ? (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#eff4ff] text-[#006a61] font-semibold flex items-center gap-1 border border-[#006a61]/30">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Evidence Found ({report.groundingAgency})
                        </span>
                      ) : (
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#fff3cd] text-[#856404] font-semibold flex items-center gap-1 border border-[#ffeeba]">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Partial Evidence (Flagged)
                        </span>
                      )}

                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                          report.priorityScore >= 70
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : report.priorityScore >= 50
                            ? 'bg-[#d3e4fe] text-[#0b1c30]'
                            : 'bg-[#e5eeff] text-[#45464d]'
                        }`}
                      >
                        {report.priorityLabel}
                      </span>

                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#eff4ff] text-[#45464d] border border-[#dce9ff]">
                        sim: {report.similarityScore.toFixed(3)}
                      </span>
                    </div>

                    {/* Grounding Strip */}
                    <div className="bg-[#eff4ff] rounded p-2.5 flex items-center justify-between gap-2 text-[#45464d] text-[12px] border border-[#dce9ff]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-[16px] text-[#006a61] shrink-0">
                          link
                        </span>
                        <span className="truncate">
                          Grounding: <strong>{report.groundingDoc}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectReportForInspection(report);
                          onNavigate('evidence-explorer');
                        }}
                        className="shrink-0 text-[12px] text-[#006a61] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View Grounded Analysis</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* TAB 2: EVIDENCE DOSSIERS VIEW */}
          {activeTab === 'verified-docs' && (
            <div className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                <h3 className="font-semibold text-[18px] text-[#0b1c30]">
                  Verified Public Datasets (OGD Grounding Store)
                </h3>
                <span className="font-mono text-[11px] text-[#006a61] font-semibold">
                  Active ChromaDB &amp; FAISS: v2.4
                </span>
              </div>
              <p className="text-[13px] text-[#45464d] leading-relaxed">
                Every civic anomaly is correlated against publicly disclosed ministerial project files,
                GIS shapefiles, and municipal tender registries to eliminate unverified claims.
              </p>
              <div className="space-y-2.5 pt-1">
                {PUBLIC_DATASETS.map((ds) => (
                  <div
                    key={ds.id}
                    className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between gap-3 hover:bg-[#dce9ff]/50 transition-colors"
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold text-[13px] text-[#0b1c30]">{ds.name}</p>
                      <p className="font-mono text-[11px] text-[#76777d]">
                        Dataset ID: {ds.code} • {ds.recordsCount.toLocaleString()} Records
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold whitespace-nowrap">
                      {ds.matchAccuracy}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('data-sources')}
                  className="text-[13px] text-[#006a61] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Explore all 14 Data Sources</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WARD GIS MAP VIEW */}
          {activeTab === 'map' && (
            <div className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                <div>
                  <h3 className="font-semibold text-[18px] text-[#0b1c30]">
                    Dharashiv District Ward Telemetry Map
                  </h3>
                  <p className="text-[12px] text-[#45464d]">
                    Geospatial density of active water and road anomalies
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-[#eff4ff] text-[#0b1c30] font-mono text-[11px] font-semibold border border-[#dce9ff]">
                  Wards 1-12
                </span>
              </div>
              <div
                className="w-full h-80 rounded-xl bg-cover bg-center shadow-inner relative overflow-hidden flex flex-col justify-between p-3 border border-[#dce9ff]"
                style={{ backgroundImage: `url('${ASSETS.mapBackground}')` }}
              >
                <div className="flex justify-between items-start">
                  <span className="px-2 py-1 rounded bg-[#213145]/90 text-[#eaf1ff] font-mono text-[11px] font-semibold shadow-md">
                    LAT: 18.1856° N | LON: 76.0416° E
                  </span>
                  <span className="px-2 py-1 rounded bg-[#ba1a1a] text-[#ffffff] font-semibold text-[11px] shadow-md">
                    Ward 4 Alert Zone
                  </span>
                </div>
                <div className="bg-[#ffffff]/90 backdrop-blur-md p-2 rounded-lg flex items-center justify-between border border-[#dce9ff]">
                  <span className="text-[12px] text-[#0b1c30] font-semibold">
                    Ward 4 PHC Water Pipeline Cluster
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('explore-issues')}
                    className="font-mono text-[11px] text-[#006a61] font-semibold hover:underline"
                  >
                    Open Spatial Registry →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right / Evidence Drawer & Verification Intelligence (5 Cols) */}
        <aside className="lg:col-span-5 flex flex-col gap-4">
          {/* Deep Inspection Dossier Card */}
          <div className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                  analytics
                </span>
                <h3 className="font-semibold text-[15px] text-[#0b1c30]">
                  Active Grounded Analysis
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold">
                Inspecting {selectedReport.ticketId}
              </span>
            </div>

            <p className="text-[12px] text-[#45464d] leading-relaxed">
              RAG retrieval retrieved 3 corroborating governmental telemetry documents within 0.8 km
              of the incident location.
            </p>

            {/* Tripartite Priority Signal Matrix */}
            <div className="bg-[#eff4ff] rounded-lg p-3 flex flex-col gap-2.5 border border-[#dce9ff]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
                  Tripartite Priority Score
                </span>
                <span className="font-mono text-[15px] font-bold text-[#ba1a1a]">
                  {selectedReport.priorityScore} / 100
                </span>
              </div>

              {/* Metric 1 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#0b1c30] font-medium">Public Safety &amp; Health Risk</span>
                  <span className="font-mono text-[#006a61] font-semibold">88 / 100</span>
                </div>
                <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#ba1a1a] h-full" style={{ width: '88%' }}></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#0b1c30] font-medium">Ward Vulnerability Index</span>
                  <span className="font-mono text-[#006a61] font-semibold">76 / 100</span>
                </div>
                <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#006a61] h-full" style={{ width: '76%' }}></div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#0b1c30] font-medium">Structural Asset Degradation</span>
                  <span className="font-mono text-[#006a61] font-semibold">52 / 100</span>
                </div>
                <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#565e74] h-full" style={{ width: '52%' }}></div>
                </div>
              </div>
            </div>

            {/* RAG Retrieval Chunk Card */}
            <div className="rounded-lg p-3 bg-[#eff4ff] flex flex-col gap-2 border border-[#dce9ff]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
                  <span className="text-[11px] font-semibold text-[#006a61]">
                    Verified Record Accent
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#45464d]">
                  Chunk ID: JJM-SEC-892
                </span>
              </div>
              <p className="text-[12px] text-[#0b1c30] font-mono bg-[#ffffff] p-2.5 rounded border border-[#dce9ff] leading-relaxed">
                "Jal Jeevan Mission District Register: Section 4-B feeder line installed 2019 under
                tender NIT-33. Scheduled inspection due: Nov 2023 [OVERDUE]. Target volume: 45,000 L/day
                for Primary Health Centre facility."
              </p>
              <div className="flex items-center justify-between text-[#45464d] font-mono text-[11px] pt-0.5">
                <span>Cosine sim: <strong className="text-[#006a61]">0.942</strong></span>
                <span>Source: OGD Ministry of Jal Shakti</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  onShowToast(
                    'Audit Dossier Exported',
                    `Exported ${selectedReport.ticketId} with SHA-256 integrity hash & vector citations.`,
                    'success'
                  )
                }
                className="flex-1 py-2 rounded bg-[#dce9ff] hover:bg-[#cbdbf5] text-[#0b1c30] text-[12px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Audit Trail</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onShowToast(
                    'Brief Dispatched',
                    `Municipal ticket dispatched to Junior Engineer (Ward 4 Water Works).`,
                    'success'
                  )
                }
                className="flex-1 py-2 rounded bg-[#000000] text-[#ffffff] text-[12px] font-semibold hover:bg-[#213145] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Dispatch Brief</span>
              </button>
            </div>
          </div>

          {/* Civic Trust & Verification Principles Card */}
          <div className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                policy
              </span>
              <h3 className="font-semibold text-[15px] text-[#0b1c30]">
                Civic Trust &amp; Verification Principles
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#006a61] text-[18px] shrink-0 mt-0.5">
                  balance
                </span>
                <div>
                  <span className="text-[12px] font-semibold text-[#0b1c30]">
                    AI-Assisted Analysis — Not Automated Government Decisions
                  </span>
                  <p className="text-[11px] text-[#45464d] leading-normal mt-0.5">
                    Priorities provide transparent decision-support for human civil servants; no
                    citizen request is discarded by an algorithm.
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#006a61] text-[18px] shrink-0 mt-0.5">
                  verified_user
                </span>
                <div>
                  <span className="text-[12px] font-semibold text-[#0b1c30]">
                    Zero Fabricated Statistics
                  </span>
                  <p className="text-[11px] text-[#45464d] leading-normal mt-0.5">
                    RAG architecture prevents synthetic completions. Numerical assertions link to
                    public ministerial gazettes.
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[18px] shrink-0 mt-0.5">
                  report_problem
                </span>
                <div>
                  <span className="text-[12px] font-semibold text-[#0b1c30]">
                    Explicit Missing Data Flags
                  </span>
                  <p className="text-[11px] text-[#45464d] leading-normal mt-0.5">
                    If municipal GIS records are absent or out-of-date, NagrikLens declares uncertainty
                    instead of guessing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Dialect Semantic Equivalence Preview */}
          <div className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[20px]">
                  translate
                </span>
                <h3 className="font-semibold text-[15px] text-[#0b1c30]">
                  Cross-Dialect Semantic Alignment
                </h3>
              </div>
              <span className="font-mono text-[11px] text-[#76777d]">IndicBERT v3</span>
            </div>
            <p className="text-[12px] text-[#45464d] leading-relaxed">
              Grievances filed in any regional language resolve to identical vector representation
              coordinates in our municipal semantic graph:
            </p>
            <div className="flex flex-col gap-2 font-mono text-[12px]">
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <span className="text-[#0b1c30]">
                  <strong className="text-[#76777d]">EN:</strong> "Water problem in Dharashiv"
                </span>
                <span className="text-[#006a61] font-semibold">Base Query</span>
              </div>
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <span className="text-[#0b1c30]">
                  <strong className="text-[#76777d]">HI:</strong> "धाराशिव में पानी की समस्या"
                </span>
                <span className="text-[#006a61] font-semibold">sim: 0.988</span>
              </div>
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                <span className="text-[#0b1c30]">
                  <strong className="text-[#76777d]">GU:</strong> "ધારાશિવમાં પાણીની સમસ્યા"
                </span>
                <span className="text-[#006a61] font-semibold">sim: 0.979</span>
              </div>
            </div>

            {/* Interactive Query Tester */}
            <div className="pt-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type custom sentence in Marathi/Hindi..."
                value={customDialectInput}
                onChange={(e) => setCustomDialectInput(e.target.value)}
                className="flex-1 bg-[#eff4ff] border border-[#dce9ff] rounded px-2.5 py-1 text-[11px] outline-none text-[#0b1c30]"
              />
              <button
                type="button"
                onClick={() => {
                  if (!customDialectInput) return;
                  onShowToast(
                    'Embedding Evaluated',
                    `Computed 768-dim IndicBERT vector: Cosine sim 0.962 to municipal water deficit baseline.`
                  );
                }}
                className="px-2.5 py-1 rounded bg-[#006a61] text-[#ffffff] font-semibold text-[11px]"
              >
                Compute
              </button>
            </div>
          </div>

          {/* Verified Public Data Feeds Live Ticker */}
          <div className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
                Verified Public Ingest Feeds
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#006a61]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] animate-pulse"></span> Streaming
              </span>
            </div>
            <div className="flex flex-col divide-y divide-[#eff4ff]">
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">
                    cloud_sync
                  </span>
                  <span className="text-[12px] text-[#0b1c30]">
                    Open Government Data (OGD) Platform
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#006a61] font-medium">
                  Synced 12m ago
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">
                    water
                  </span>
                  <span className="text-[12px] text-[#0b1c30]">
                    Jal Jeevan Mission (Ministry of Jal Shakti)
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#006a61] font-medium">
                  Synced 24m ago
                </span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#76777d] text-[18px]">
                    holiday_village
                  </span>
                  <span className="text-[12px] text-[#0b1c30]">
                    Ministry of Rural Development (PMGSY)
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#006a61] font-medium">
                  Synced 41m ago
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
