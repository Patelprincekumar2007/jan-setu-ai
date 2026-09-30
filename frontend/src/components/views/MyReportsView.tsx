import React, { useState } from 'react';
import { CitizenReport, NavigationTab } from '../../types';
import {
  CitizenRequestRecord,
  createRequestAnalysisApi,
  fetchCitizenRequestApi,
  fetchRequestEvidenceApi,
  fetchRequestPriorityApi,
  createRequestPriorityApi,
  GroundedAnalysis,
  RequestEvidenceResponse,
  PriorityAssessmentResponse,
} from '../../api/requests';
import { useT } from '../../i18n';

interface MyReportsViewProps {
  reports: CitizenReport[];
  requests: CitizenRequestRecord[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectReport: (report: CitizenReport) => void;
  onOpenReportModal: () => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  requests,
  onNavigate,
  onSelectReport,
  onOpenReportModal,
}) => {
  const t = useT();
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<CitizenRequestRecord | null>(null);
  const [evidenceDetails, setEvidenceDetails] = useState<RequestEvidenceResponse | null>(null);
  const [analysis, setAnalysis] = useState<GroundedAnalysis | null>(null);
  const [priorityAssessment, setPriorityAssessment] = useState<PriorityAssessmentResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [priorityBusy, setPriorityBusy] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const openRequest = async (request: CitizenRequestRecord) => {
    if (activeRequestId === request.reference_id) {
      setActiveRequestId(null);
      return;
    }
    setActiveRequestId(request.reference_id);
    setRequestDetails(null);
    setEvidenceDetails(null);
    setAnalysis(null);
    setPriorityAssessment(null);
    setRequestError(null);
    setBusy(true);
    try {
      const [details, evidence] = await Promise.all([
        fetchCitizenRequestApi(request.reference_id),
        fetchRequestEvidenceApi(request.reference_id),
      ]);
      setRequestDetails(details);
      setEvidenceDetails(evidence);
      try {
        const priority = await fetchRequestPriorityApi(request.reference_id);
        setPriorityAssessment(priority);
      } catch {
        // Priority not yet computed for this request; user can trigger it
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Request details could not be loaded.');
    } finally {
      setBusy(false);
    }
  };

  const generateAnalysis = async (referenceId: string) => {
    setBusy(true);
    setRequestError(null);
    try {
      const response = await createRequestAnalysisApi(referenceId);
      setAnalysis(response.analysis);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Grounded analysis could not be generated.');
    } finally {
      setBusy(false);
    }
  };

  const generatePriority = async (referenceId: string) => {
    setPriorityBusy(true);
    setRequestError(null);
    try {
      const response = await createRequestPriorityApi(referenceId);
      setPriorityAssessment(response);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Priority assessment could not be calculated.');
    } finally {
      setPriorityBusy(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <div className="saas-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[11px] font-bold border border-teal-200">
              Citizen Auditable Telemetry Log
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-teal-700 text-[28px]">description</span>
            {t('Citizen Request Tracking')}
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
            {t('Track request processing and inspect any public evidence returned for a submitted request.')}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenReportModal}
          className="px-5 py-2.5 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ Report New Issue</span>
        </button>
      </div>

      <section className="space-y-4" aria-labelledby="citizen-requests-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="citizen-requests-heading" className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700 text-[20px]">mark_email_read</span>
            {t('Recent citizen requests')}
          </h2>
          <span className="font-mono text-[11px] text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full font-bold">{requests.length} saved</span>
        </div>
        {requests.length === 0 ? (
          <p className="saas-card p-6 text-center text-[13px] text-slate-500">
            {t('No requests submitted in this session.')}
          </p>
        ) : requests.map((request) => {
          const isOpen = activeRequestId === request.reference_id;
          const evidence = evidenceDetails?.reference_id === request.reference_id
            ? evidenceDetails.results
            : [];
          return (
            <article key={request.reference_id} className="saas-card p-5 space-y-3.5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <span className="font-mono text-[12px] font-bold text-teal-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                    {request.reference_id}
                  </span>
                  <p className="text-[15px] font-bold text-slate-900 mt-1">{request.citizen_request}</p>
                  <p className="text-[12px] text-slate-500">
                    {request.locality ? `${request.locality}, ` : ''}{request.district}, {request.state} • <span className="text-slate-900 font-semibold">{t(request.category)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => void openRequest(request)}
                  className={`rounded-lg px-4 py-2 text-[12px] font-bold transition-all cursor-pointer ${
                    isOpen
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {isOpen ? t('Hide details') : t('Track request')}
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><dt className="text-[10px] uppercase text-slate-500 font-bold font-mono">{t('Request status')}</dt><dd className="text-[12px] font-bold text-slate-900 mt-0.5">{t(request.status)}</dd></div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><dt className="text-[10px] uppercase text-slate-500 font-bold font-mono">{t('AI extraction')}</dt><dd className="text-[12px] font-bold text-teal-700 mt-0.5">{t(request.ai_extraction_status)}</dd></div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><dt className="text-[10px] uppercase text-slate-500 font-bold font-mono">{t('Retrieval')}</dt><dd className="text-[12px] font-bold text-sky-700 mt-0.5">{t(request.retrieval_status)}</dd></div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200"><dt className="text-[10px] uppercase text-slate-500 font-bold font-mono">{t('Evidence count')}</dt><dd className="text-[12px] font-bold text-slate-900 mt-0.5">{request.evidence_count}</dd></div>
              </dl>

              {isOpen && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  {busy && <p className="text-[12px] text-slate-500">{t('Loading request details...')}</p>}
                  {requestError && <p role="alert" className="text-[12px] text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{requestError}</p>}
                  {requestDetails && <p className="text-[11px] font-mono text-teal-700 font-bold">Reference confirmed: {requestDetails.reference_id}</p>}
                  <div className="space-y-3">
                    <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-teal-700 text-[18px]">database</span>
                      {t('Public Data Evidence')}
                    </h3>
                    {evidence.length === 0 ? (
                      <p className="text-[12px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        {t('No evidence was returned by the configured retrieval system. This does not establish that the issue is absent from public data.')}
                      </p>
                    ) : evidence.map((match) => (
                      <div key={match.evidence.evidence_id} className="border-l-2 border-teal-600 bg-slate-50 p-3.5 rounded-r-xl border-y border-r border-slate-200 space-y-1.5">
                        <h4 className="text-[13px] font-bold text-slate-900">{match.evidence.title}</h4>
                        <p className="text-[12px] text-slate-600">
                          {[match.evidence.locality, match.evidence.district, match.evidence.state].filter(Boolean).join(', ')} • <span className="text-slate-900 font-semibold">{t(match.evidence.category)}</span>
                        </p>
                        <p className="text-[12px] text-slate-700">
                          {match.evidence.metric_name || 'Metric'}: <span className="text-rose-600 font-bold">{match.evidence.metric_value ?? 'Not provided'}{match.evidence.unit || ''}</span> • {match.evidence.year || match.evidence.period || 'Year not provided'}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          Source: {match.source.source_url ? (
                            <a className="underline text-teal-700" href={match.source.source_url} target="_blank" rel="noreferrer">{match.source.source_name}</a>
                          ) : match.source.source_name}
                          {match.source.source_reference ? ` • ${match.source.source_reference}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    {evidence.length > 0 && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void generateAnalysis(request.reference_id)}
                        className="rounded-lg bg-[#00897b] hover:bg-[#00796b] px-4 py-2 text-[12px] font-bold text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {busy ? t('Generating...') : t('Generate evidence-grounded analysis')}
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={priorityBusy}
                      onClick={() => void generatePriority(request.reference_id)}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 px-4 py-2 text-[12px] font-bold text-slate-800 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {priorityBusy ? t('Calculating...') : (priorityAssessment ? t('Recalculate Priority Assessment') : t('Evaluate Priority Score'))}
                    </button>
                  </div>

                  {analysis && (
                    <section className="space-y-3.5 border-t border-slate-200 pt-4" aria-label="Grounded analysis">
                      <h3 className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-teal-700 text-[18px]">psychology</span>
                        {t('Grounded Analysis')}
                      </h3>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <h4 className="text-[10px] font-bold uppercase text-teal-700 font-mono mb-1">{t('Summary')}</h4>
                        <p className="text-[13px] text-slate-800 leading-relaxed">{analysis.summary}</p>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <h4 className="text-[10px] font-bold uppercase text-slate-500 font-mono mb-1.5">{t('Observations')}</h4>
                        {analysis.observations.map((observation, index) => (
                          <p key={`${index}-${observation.statement}`} className="py-1 text-[13px] text-slate-800">
                            {observation.statement} <span className="font-mono text-[11px] text-teal-700">Evidence: {observation.evidence_ids.join(', ')}</span>
                          </p>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Sample Reports List */}
      <div className="space-y-3 pt-4">
        <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-teal-700 text-[20px]">folder</span>
          District Ground Truth Reports
        </h2>
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="saas-card p-5 flex flex-col gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {report.ticketId}
                  </span>
                  <span className="text-[12px] text-slate-500 font-medium">{report.location}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[12px] text-slate-500">{report.timestamp}</span>
                </div>

                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full font-mono ${
                    report.status.includes('Resolved')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-teal-50 text-teal-800 border border-teal-200'
                  }`}
                >
                  {report.status}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <h2 className="text-[17px] font-bold text-slate-900">{report.title}</h2>
                <p className="text-[13px] text-slate-600 leading-relaxed">{report.narrative}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[12px] text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-teal-700">
                    link
                  </span>
                  <span>
                    Linked Grounding: <strong className="text-slate-900">{report.groundingDoc}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectReport(report);
                    onNavigate('evidence-explorer');
                  }}
                  className="text-[12px] font-bold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Evidence Dossier</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
