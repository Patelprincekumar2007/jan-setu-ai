import React from 'react';
import { CitizenReport, NavigationTab } from '../../types';

interface MyReportsViewProps {
  reports: CitizenReport[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectReport: (report: CitizenReport) => void;
  onOpenReportModal: () => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  onNavigate,
  onSelectReport,
  onOpenReportModal,
}) => {
  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Citizen Auditable Telemetry Log</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            My Submitted Infrastructure Reports
          </h1>
          <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
            Track real-time progress on issues submitted by your account. Every submission creates an immutable record linked to official open datasets.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-lg bg-[#006a61] text-[#ffffff] text-[13px] font-semibold hover:bg-[#005049] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Report New Issue</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-[#ffffff] rounded-xl p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff]">
                  {report.ticketId}
                </span>
                <span className="text-[12px] text-[#76777d] font-medium">{report.location}</span>
                <span className="text-[#76777d]">•</span>
                <span className="text-[12px] text-[#76777d]">{report.timestamp}</span>
              </div>

              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded ${
                  report.status.includes('Resolved')
                    ? 'bg-[#86f2e4] text-[#005049]'
                    : 'bg-[#eff4ff] text-[#006a61] border border-[#006a61]/30'
                }`}
              >
                {report.status}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-bold text-[#0b1c30]">{report.title}</h2>
              <p className="text-[13px] text-[#45464d] leading-relaxed">{report.narrative}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#eff4ff]">
              <div className="flex items-center gap-2 text-[12px] text-[#76777d]">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                  link
                </span>
                <span>
                  Linked Grounding: <strong className="text-[#0b1c30]">{report.groundingDoc}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectReport(report);
                  onNavigate('evidence-explorer');
                }}
                className="text-[12px] font-semibold text-[#006a61] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Evidence Dossier</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
