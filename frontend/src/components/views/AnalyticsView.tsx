import React from 'react';

interface AnalyticsViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onShowToast }) => {
  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      {/* Header */}
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
            <span className="material-symbols-outlined text-[16px]">query_stats</span>
            <span>Civic Intelligence Telemetry Analytics</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            District Operational Analytics
          </h1>
          <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
            Quantitative analysis of citizen grievances, vector similarity distributions, multi-lingual intake channels, and civil servant resolution performance across Dharashiv District.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onShowToast('CSV Dataset Ready', 'Monthly district telemetry report exported.')}
          className="px-4 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold hover:bg-[#213145] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Download Analytics CSV</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-[#76777d]">Total Ingested Grievances</span>
          <div className="text-[28px] font-bold text-[#0b1c30] mt-1">1,482</div>
          <div className="text-[12px] text-[#006a61] font-semibold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +18.4% month-over-month
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-[#76777d]">Evidence Corroboration Rate</span>
          <div className="text-[28px] font-bold text-[#006a61] mt-1">84.2%</div>
          <div className="text-[12px] text-[#76777d] mt-2">
            15.8% marked Insufficient Records
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-[#76777d]">Avg SLA Resolution Time</span>
          <div className="text-[28px] font-bold text-[#0b1c30] mt-1">38.4 hrs</div>
          <div className="text-[12px] text-[#006a61] font-semibold mt-2">
            7.6 hrs faster than statutory target
          </div>
        </div>

        <div className="bg-[#ffffff] p-4 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase text-[#76777d]">Hallucination Audit Flags</span>
          <div className="text-[28px] font-bold text-[#ba1a1a] mt-1">0.00%</div>
          <div className="text-[12px] text-[#006a61] font-semibold mt-2">
            Strict RAG Grounding Mode Enforced
          </div>
        </div>
      </div>

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Multi-Lingual Ingest Distribution */}
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <h2 className="font-bold text-[16px] text-[#0b1c30]">
              Multi-Dialect Grievance Ingest Breakdown
            </h2>
            <span className="font-mono text-[11px] text-[#76777d]">IndicBERT Normalized</span>
          </div>

          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Citizens in Dharashiv submit complaints across regional Marathi, Hindi, and Gujarati. The multilingual pipeline converts all narratives into unified semantic vector space.
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-[12px] pb-1">
                <span className="font-semibold text-[#0b1c30]">Marathi (मराठी) - Primary Regional</span>
                <span className="font-mono font-bold text-[#006a61]">48.2% (714 reports)</span>
              </div>
              <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                <div className="bg-[#006a61] h-full" style={{ width: '48.2%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] pb-1">
                <span className="font-semibold text-[#0b1c30]">Hindi (हिन्दी)</span>
                <span className="font-mono font-bold text-[#006a61]">32.6% (483 reports)</span>
              </div>
              <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                <div className="bg-[#86f2e4] border border-[#006a61] h-full" style={{ width: '32.6%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] pb-1">
                <span className="font-semibold text-[#0b1c30]">English (EN)</span>
                <span className="font-mono font-bold text-[#0b1c30]">11.4% (169 reports)</span>
              </div>
              <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                <div className="bg-[#131b2e] h-full" style={{ width: '11.4%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[12px] pb-1">
                <span className="font-semibold text-[#0b1c30]">Gujarati (ગુજરાતી)</span>
                <span className="font-mono font-bold text-[#76777d]">7.8% (116 reports)</span>
              </div>
              <div className="w-full h-2.5 bg-[#eff4ff] rounded-full overflow-hidden">
                <div className="bg-[#565e74] h-full" style={{ width: '7.8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Domain Severity Matrix */}
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
            <h2 className="font-bold text-[16px] text-[#0b1c30]">
              Domain Infrastructure Incident Distribution
            </h2>
            <span className="font-mono text-[11px] text-[#006a61] font-semibold">Active Wards 1-12</span>
          </div>

          <p className="text-[13px] text-[#45464d] leading-relaxed">
            Categorization determined by transformer named entity recognition (NER), confirmed against ministerial registries.
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-[#dce9ff] flex items-center justify-center text-[#006a61]">
                  <span className="material-symbols-outlined text-[18px]">water_drop</span>
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Water &amp; Irrigation</div>
                  <div className="text-[11px] text-[#76777d]">Borewell, pipeline pressure, contamination</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-bold text-[#ba1a1a]">42%</div>
                <div className="text-[10px] text-[#76777d]">High Attention</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-[#dce9ff] flex items-center justify-center text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[18px]">add_road</span>
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Roads &amp; Transport</div>
                  <div className="text-[11px] text-[#76777d]">Culverts, potholes, asphalt subsidence</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-bold text-[#0b1c30]">28%</div>
                <div className="text-[10px] text-[#76777d]">Moderate Hazard</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-[#dce9ff] flex items-center justify-center text-[#006a61]">
                  <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Healthcare Facilities</div>
                  <div className="text-[11px] text-[#76777d]">PHC utility continuity, cold storage</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-bold text-[#ba1a1a]">18%</div>
                <div className="text-[10px] text-[#76777d]">Critical Priority</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-[#dce9ff] flex items-center justify-center text-[#45464d]">
                  <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
                </span>
                <div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Public Sanitation</div>
                  <div className="text-[11px] text-[#76777d]">Drain blockage, solid waste clearance</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-bold text-[#006a61]">12%</div>
                <div className="text-[10px] text-[#76777d]">Routine SLA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
