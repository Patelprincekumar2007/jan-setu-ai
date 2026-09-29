import React, { useState } from 'react';
import { CitizenReport, NavigationTab } from '../../types';
import {
  CitizenRequestRecord,
  createRequestAnalysisApi,
  fetchCitizenRequestApi,
  fetchRequestEvidenceApi,
  GroundedAnalysis,
  RequestEvidenceResponse,
} from '../../api/requests';

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
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<CitizenRequestRecord | null>(null);
  const [evidenceDetails, setEvidenceDetails] = useState<RequestEvidenceResponse | null>(null);
  const [analysis, setAnalysis] = useState<GroundedAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
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
    setRequestError(null);
    setBusy(true);
    try {
      const [details, evidence] = await Promise.all([
        fetchCitizenRequestApi(request.reference_id),
        fetchRequestEvidenceApi(request.reference_id),
      ]);
      setRequestDetails(details);
      setEvidenceDetails(evidence);
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

  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
            <span className="material-symbols-outlined text-[16px]">description</span>
            <span>Citizen Auditable Telemetry Log</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            Citizen Request Tracking
          </h1>
          <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
            Track request processing and inspect any public evidence returned for a submitted request.
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

      <section className="space-y-3" aria-labelledby="citizen-requests-heading">
        <div className="flex items-center justify-between gap-3">
          <h2 id="citizen-requests-heading" className="text-[17px] font-semibold text-[#0b1c30]">
            Recent citizen requests
          </h2>
          <span className="font-mono text-[11px] text-[#76777d]">{requests.length} saved</span>
        </div>
        {requests.length === 0 ? (
          <p className="border-y border-[#dce9ff] py-4 text-[13px] text-[#45464d]">
            No requests submitted in this session.
          </p>
        ) : requests.map((request) => {
          const isOpen = activeRequestId === request.reference_id;
          const evidence = evidenceDetails?.reference_id === request.reference_id
            ? evidenceDetails.results
            : [];
          return (
            <article key={request.reference_id} className="border-y border-[#dce9ff] py-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="font-mono text-[12px] font-semibold text-[#0b1c30]">
                    {request.reference_id}
                  </p>
                  <p className="text-[14px] font-medium text-[#0b1c30]">{request.citizen_request}</p>
                  <p className="text-[12px] text-[#45464d]">
                    {request.locality ? `${request.locality}, ` : ''}{request.district}, {request.state} · {request.category}
                  </p>
                </div>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => void openRequest(request)}
                  className="shrink-0 border border-[#9aa8b8] px-3 py-2 text-[12px] font-semibold text-[#0b1c30] hover:bg-[#eff4ff]"
                >
                  {isOpen ? 'Hide details' : 'Track request'}
                </button>
              </div>

              <dl className="grid grid-cols-2 gap-3 border-t border-[#e5eeff] pt-3 sm:grid-cols-4">
                <div><dt className="text-[10px] uppercase text-[#76777d]">Request status</dt><dd className="text-[12px] font-semibold">{request.status}</dd></div>
                <div><dt className="text-[10px] uppercase text-[#76777d]">AI extraction</dt><dd className="text-[12px] font-semibold">{request.ai_extraction_status}</dd></div>
                <div><dt className="text-[10px] uppercase text-[#76777d]">Retrieval</dt><dd className="text-[12px] font-semibold">{request.retrieval_status}</dd></div>
                <div><dt className="text-[10px] uppercase text-[#76777d]">Evidence count</dt><dd className="text-[12px] font-semibold">{request.evidence_count}</dd></div>
              </dl>

              {isOpen && (
                <div className="space-y-4 border-t border-[#e5eeff] pt-4">
                  {busy && <p className="text-[12px] text-[#45464d]">Loading request details...</p>}
                  {requestError && <p role="alert" className="text-[12px] text-[#93000a]">{requestError}</p>}
                  {requestDetails && <p className="text-[11px] text-[#76777d]">Reference confirmed: {requestDetails.reference_id}</p>}
                  <div className="space-y-3">
                    <h3 className="text-[14px] font-semibold text-[#0b1c30]">Public Data Evidence</h3>
                    {evidence.length === 0 ? (
                      <p className="text-[12px] text-[#45464d]">
                        No evidence was returned by the configured retrieval system. This does not establish that the issue is absent from public data.
                      </p>
                    ) : evidence.map((match) => (
                      <div key={match.evidence.evidence_id} className="border-l-2 border-[#006a61] pl-3 space-y-1">
                        <h4 className="text-[13px] font-semibold text-[#0b1c30]">{match.evidence.title}</h4>
                        <p className="text-[12px] text-[#45464d]">
                          {[match.evidence.locality, match.evidence.district, match.evidence.state].filter(Boolean).join(', ')} · {match.evidence.category}
                        </p>
                        <p className="text-[12px] text-[#45464d]">
                          {match.evidence.metric_name || 'Metric'}: {match.evidence.metric_value ?? 'Not provided'}{match.evidence.unit || ''} · {match.evidence.year || match.evidence.period || 'Year not provided'}
                        </p>
                        <p className="text-[12px] text-[#45464d]">
                          Source: {match.source.source_url ? (
                            <a className="underline" href={match.source.source_url} target="_blank" rel="noreferrer">{match.source.source_name}</a>
                          ) : match.source.source_name}
                          {match.source.source_reference ? ` · ${match.source.source_reference}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  {evidence.length > 0 && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void generateAnalysis(request.reference_id)}
                      className="border border-[#006a61] px-3 py-2 text-[12px] font-semibold text-[#005049] hover:bg-[#e7f5f1] disabled:opacity-50"
                    >
                      {busy ? 'Generating...' : 'Generate evidence-grounded analysis'}
                    </button>
                  )}

                  {analysis && (
                    <section className="space-y-3 border-t border-[#dce9ff] pt-4" aria-label="Grounded analysis">
                      <h3 className="text-[14px] font-semibold text-[#0b1c30]">Grounded Analysis</h3>
                      <div><h4 className="text-[11px] font-semibold uppercase text-[#76777d]">Summary</h4><p className="text-[13px] text-[#0b1c30]">{analysis.summary}</p></div>
                      <div><h4 className="text-[11px] font-semibold uppercase text-[#76777d]">Observations</h4>
                        {analysis.observations.map((observation, index) => (
                          <p key={`${index}-${observation.statement}`} className="py-1 text-[13px] text-[#0b1c30]">
                            {observation.statement} <span className="font-mono text-[11px] text-[#006a61]">Evidence: {observation.evidence_ids.join(', ')}</span>
                          </p>
                        ))}
                      </div>
                      <div><h4 className="text-[11px] font-semibold uppercase text-[#76777d]">Evidence Gaps</h4><ul className="list-disc pl-5 text-[12px]">{analysis.evidence_gaps.map((gap) => <li key={gap}>{gap}</li>)}</ul></div>
                      <div><h4 className="text-[11px] font-semibold uppercase text-[#76777d]">Sources</h4><ul className="list-disc pl-5 font-mono text-[12px]">{analysis.source_references.map((source) => <li key={source}>{source}</li>)}</ul></div>
                      <div><h4 className="text-[11px] font-semibold uppercase text-[#76777d]">Limitations</h4><ul className="list-disc pl-5 text-[12px]">{analysis.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></div>
                    </section>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* Reports List */}
      <h2 className="text-[17px] font-semibold text-[#0b1c30]">Sample reports</h2>
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
