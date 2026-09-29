import React, { useState } from 'react';
import { CitizenReport } from '../../types';
import { ASSETS } from '../../data/mockData';
import { LocalizedTree } from '../../i18n';

interface EvidenceExplorerViewProps {
  selectedReport?: CitizenReport;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const EvidenceExplorerView: React.FC<EvidenceExplorerViewProps> = ({
  selectedReport,
  onShowToast,
}) => {
  const [inspectorExpanded, setInspectorExpanded] = useState<boolean>(false);
  const [showFilterLogModal, setShowFilterLogModal] = useState<boolean>(false);

  const handleDownloadJson = () => {
    const payload = {
      report_id: 'NL-2025-0842',
      pipeline: 'Gemini 1.5 Grounded RAG + FAISS Multilingual',
      ward: selectedReport?.ward || 'Dharashiv Ward 4',
      faithfulness_score: 0.968,
      corroborated_sources: [
        {
          id: 'OGD-JJM-2024-MH-01',
          agency: 'Ministry of Jal Shakti',
          cosine_sim: 0.892,
          chunk_id: '8812',
          verified_coverage: '50.76%',
        },
        {
          id: 'NHM-INFRA-MH-2023',
          agency: 'Ministry of Health & Family Welfare',
          cosine_sim: 0.835,
          table: 'Audit Table 4.B',
          findings: '14% peripheral health posts report groundwater drawdown',
        },
      ],
      missing_evidence_claims: [
        'Ward 4 PHC borewell pump motor physical integrity (No smart switchboard telemetry)',
      ],
      dispatched_action: {
        ticket: '#WW-DHR-882',
        role: 'Junior Engineer Water Works',
        sla_hours: 24,
      },
    };

    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', 'NL-2025-0842-provenance.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('JSON Provenance Saved', 'Audit metadata exported with vector hash verification.', 'success');
  };

  return (
    <LocalizedTree>
    <div className="flex flex-col w-full pb-10">
      {/* Sub-header ribbon */}
      <div className="px-4 lg:px-6 py-3 bg-[#eff4ff] border-b border-[#e5eeff] flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#45464d] uppercase">
            <span>Telemetry Node</span>
            <span>/</span>
            <span className="text-[#006a61] font-semibold">MH-DHR-WARD-004</span>
            <span>/</span>
            <span>RAG-SYNTHESIS</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#ffffff] shadow-xs text-[#0b1c30] font-mono text-[11px] border border-[#dce9ff]">
              <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
              <span>Pipeline: Gemini 1.5 Grounded RAG + FAISS Multilingual</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span>Evidence Verified</span>
            </div>

            <div className="inline-flex items-center px-2 py-0.5 rounded bg-[#131b2e] text-[#dae2fd] font-mono text-[11px] font-semibold">
              NL-2025-0842
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-2 pt-1">
          <div>
            <h1 className="text-[22px] lg:text-[24px] font-semibold text-[#0b1c30] tracking-tight">
              Evidence-Grounded Analysis: Dharashiv Ward 4 Water Infrastructure
            </h1>
            <p className="text-[12px] text-[#45464d] mt-0.5">
              Municipal Audit &amp; Grounding dossier corroborating citizen telemetry against national &amp; state open data repositories.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-1 rounded bg-[#eff4ff] text-[#45464d] border border-[#dce9ff]">
              Model: gemini-1.5-pro-002
            </span>
            <span className="px-2 py-1 rounded bg-[#eff4ff] text-[#006a61] font-semibold border border-[#006a61]/30">
              Faithfulness: 96.8%
            </span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Inspection Grid */}
      <div className="px-4 lg:px-6 py-6 flex flex-col gap-6 max-w-[1600px] w-full mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Column 1: Citizen Request & Structured Entity */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden">
              <div className="px-4 py-2.5 bg-[#eff4ff] border-b border-[#e5eeff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0b1c30]">
                    record_voice_over
                  </span>
                  <span className="font-semibold text-[14px] text-[#0b1c30]">
                    Citizen Request &amp; Structured Entity
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-semibold">
                  SRC: Mobile Grievance
                </span>
              </div>

              <div className="p-4 flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                      Unstructured Ingest Narrative
                    </span>
                    <span className="font-mono text-[11px] text-[#006a61] font-semibold">
                      Recorded in Marathi + Hindi
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-[#dce9ff] relative leading-relaxed">
                    <p className="italic">
                      “Our primary health centre does not have clean drinking water and the borewell is not working for the past three weeks. Patients coming with fever and dehydration are having to purchase bottled water from private stalls 2km away.”
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#dce9ff] flex items-center justify-between font-mono text-[11px] text-[#45464d]">
                      <span>Geo: 18.1856° N, 76.0416° E</span>
                      <span className="text-[#006a61] font-semibold">Audio &amp; Text Synced</span>
                    </div>
                  </div>
                </div>

                {/* Automated Entity Dissection (NER) */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                    Automated Entity Dissection (NER)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
                      <span className="text-[11px] text-[#76777d]">Problem Domain</span>
                      <span className="text-[13px] text-[#0b1c30] font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                          water_drop
                        </span>
                        Drinking Water Deficit
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
                      <span className="text-[11px] text-[#76777d]">Critical Asset</span>
                      <span className="text-[13px] text-[#0b1c30] font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[16px] text-[#ba1a1a]">
                          local_hospital
                        </span>
                        Primary Health Centre (PHC)
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
                      <span className="text-[11px] text-[#76777d]">Administrative Jurisdiction</span>
                      <span className="text-[13px] text-[#0b1c30] font-semibold mt-0.5">
                        Ward 4, Dharashiv, MH
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex flex-col">
                      <span className="text-[11px] text-[#76777d]">Stated Citizen Impact</span>
                      <span className="text-[13px] text-[#0b1c30] font-semibold mt-0.5">
                        85 HHs + PHC Inflow
                      </span>
                    </div>
                  </div>
                </div>

                {/* Human Verification Node */}
                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#006a61]">
                      verified_user
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[12px] text-[#0b1c30] font-semibold leading-tight">
                        Human Verification Node
                      </span>
                      <span className="text-[11px] text-[#45464d]">
                        Validated via OTP signature &amp; local corporator log
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] text-[11px] font-semibold">
                    Confirmed by Citizen
                  </span>
                </div>

                {/* Geohash Map Thumbnail */}
                <div className="rounded-lg overflow-hidden relative shadow-xs border border-[#dce9ff]">
                  <div
                    className="w-full h-32 bg-cover bg-center"
                    style={{ backgroundImage: `url('${ASSETS.mapBackground}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e] via-transparent to-transparent flex items-end p-2.5">
                    <div className="flex items-center justify-between w-full text-[11px]">
                      <span className="text-[#ffffff] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                        Dharashiv District PHC Cluster
                      </span>
                      <span className="font-mono text-[#89f5e7]">Geohash: te2c9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Retrieved Public Evidence */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-[#eff4ff] border-b border-[#e5eeff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0b1c30]">
                    database
                  </span>
                  <span className="font-semibold text-[14px] text-[#0b1c30]">
                    Retrieved Public Evidence
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-semibold">
                  FAISS Cosine &gt; 0.82
                </span>
              </div>

              <div className="p-4 flex flex-col gap-4">
                {/* Chunk 1: JJM */}
                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      <span>Verified Public Dataset (Updated Q3 2024)</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#006a61] font-semibold">
                      sim: 0.892
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[14px] text-[#0b1c30]">
                      District-wise Rural Household Tap Water Coverage
                    </h3>
                    <span className="font-mono text-[11px] text-[#45464d]">
                      Source: Open Government Data (OGD) / Jal Jeevan Mission
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#ffffff] border border-[#dce9ff] flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">
                      OGD-JJM-2024-MH-01
                    </span>
                    <span className="font-mono text-[11px] text-[#76777d]">Chunk #8812</span>
                  </div>

                  <div className="p-2 rounded bg-[#e5eeff] flex flex-col gap-1 border border-[#dce9ff]">
                    <span className="text-[11px] text-[#76777d]">Recorded Municipal Metric</span>
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[14px] font-bold text-[#ba1a1a]">
                        50.76% tap coverage
                      </span>
                      <span className="font-mono text-[11px] text-[#45464d]">
                        State Average: 78.4%
                      </span>
                    </div>
                    <div className="w-full bg-[#dce9ff] h-2 rounded-full overflow-hidden mt-0.5">
                      <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '50.76%' }}></div>
                    </div>
                  </div>

                  <div className="pt-0.5 flex items-center justify-between text-[11px] text-[#45464d]">
                    <span className="flex items-center gap-1 text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[15px]">link</span> Ingested via data.gov.in API
                    </span>
                    <span className="font-mono">Vector Hash: 7c3f..18</span>
                  </div>
                </div>

                {/* Chunk 2: NHM */}
                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] text-[11px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">policy</span> Health Ministry Audit
                    </span>
                    <span className="font-mono text-[11px] text-[#45464d] font-semibold">
                      sim: 0.835
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[14px] text-[#0b1c30]">
                      District Health Infrastructure &amp; Water Provision Audit
                    </h3>
                    <span className="font-mono text-[11px] text-[#45464d]">
                      Source: National Health Mission (NHM) Facility Survey
                    </span>
                  </div>

                  <div className="p-2 rounded bg-[#ffffff] border border-[#dce9ff] flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">
                      NHM-INFRA-MH-2023
                    </span>
                    <span className="font-mono text-[11px] text-[#76777d]">Audit Table 4.B</span>
                  </div>

                  <div className="p-2.5 rounded bg-[#e5eeff] text-[12px] text-[#0b1c30] leading-relaxed border border-[#dce9ff]">
                    <span className="text-[11px] text-[#76777d] block font-semibold mb-0.5">
                      Audited Finding:
                    </span>
                    “14% of peripheral health posts in Dharashiv sub-district report intermittent
                    groundwater drawdown and seasonal borewell failure in dry months (Feb-June).”
                  </div>

                  <div className="pt-0.5 flex items-center justify-between text-[11px] text-[#45464d]">
                    <span className="flex items-center gap-1 text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[15px]">table_chart</span> NHM Annual Archive
                    </span>
                    <span className="font-mono">Indexed: 12 Nov 2024</span>
                  </div>
                </div>

                {/* Rejected documents banner */}
                <div className="p-3 rounded-lg bg-[#dce9ff] border border-[#cbdbf5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#45464d]">
                      manage_search
                    </span>
                    <span className="text-[12px] text-[#0b1c30] font-medium">
                      8 additional ungrounded documents rejected (similarity &lt; 0.70)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFilterLogModal(true)}
                    className="font-mono text-[11px] text-[#006a61] font-semibold hover:underline cursor-pointer"
                  >
                    View Filter Log
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: AI-Assisted Grounded Analysis */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-[#eff4ff] border-b border-[#e5eeff] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0b1c30]">
                    psychology
                  </span>
                  <span className="font-semibold text-[14px] text-[#0b1c30]">
                    AI-Assisted Grounded Analysis
                  </span>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#000000] text-[#ffffff] font-semibold">
                  Gemini 1.5
                </span>
              </div>

              <div className="p-4 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                    Synthesized Grounded Observations
                  </span>

                  {/* Observation 1 */}
                  <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Observation 1 • Macro Supply Deficit Corroborated</span>
                    </div>
                    <p className="text-[13px] text-[#0b1c30] leading-relaxed">
                      The available public dataset records rural household tap-water coverage for
                      Dharashiv at <span className="font-mono font-bold text-[#ba1a1a]">50.76%</span> for
                      the referenced reporting period, indicating a verified structural water deficit in
                      the district{' '}
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[11px] font-semibold">
                        OGD-JJM-2024-MH-01
                      </span>.
                    </p>
                  </div>

                  {/* Observation 2 */}
                  <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-[12px] text-[#006a61] font-semibold">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>Observation 2 • Vulnerable Health Asset Risk</span>
                    </div>
                    <p className="text-[13px] text-[#0b1c30] leading-relaxed">
                      District health audits report intermittent groundwater depletion in peripheral
                      medical centers during Q2/Q3{' '}
                      <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#dce9ff] text-[#0b1c30] font-mono text-[11px] font-semibold">
                        NHM-INFRA-MH-2023
                      </span>. The citizen's complaint regarding non-functional borewell infrastructure
                      directly conforms with documented seasonal aquifer drawdown patterns.
                    </p>
                  </div>
                </div>

                {/* CRITICAL POLICY: MISSING GROUND EVIDENCE */}
                <div className="p-3 rounded-lg bg-[#ffdad6] text-[#93000a] border border-[#ffdad6] shadow-xs flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">
                      warning
                    </span>
                    <span className="text-[12px] font-bold uppercase tracking-wider">
                      Critical Policy: Missing Ground Evidence
                    </span>
                  </div>
                  <p className="text-[12px] leading-relaxed">
                    Available public evidence does not establish whether the specific Ward 4 primary
                    health centre has an active borewell motor malfunction or dedicated municipal water
                    tanker allocation. On-ground verification by local junior engineer required.
                  </p>
                  <div className="p-2 rounded bg-[#ffffff] text-[#0b1c30] font-mono text-[11px] flex items-center justify-between border border-[#ffdad6]">
                    <span>Guardrail: Zero Hallucination Mode</span>
                    <span className="text-[#ba1a1a] font-semibold">1 Claim Withheld</span>
                  </div>
                </div>

                {/* Priority Signal Score */}
                <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
                      Priority Signal Score
                    </span>
                    <span className="text-[18px] text-[#0b1c30] font-bold">8.4 / 10</span>
                  </div>
                  <div className="w-full bg-[#dce9ff] h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-[#ba1a1a] h-full" style={{ width: '45%' }} title="Hazard: 4.5"></div>
                    <div className="bg-[#006a61] h-full" style={{ width: '25%' }} title="Facility Sensitivity: 2.5"></div>
                    <div className="bg-[#565e74] h-full" style={{ width: '14%' }} title="Demographic Density: 1.4"></div>
                  </div>
                  <div className="flex justify-between font-mono text-[11px] text-[#45464d] pt-0.5">
                    <span>PHC Hazard: 4.5</span>
                    <span>Vuln Index: 2.5</span>
                    <span>Inflow: 1.4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Groundedness & Transparency Pipeline Execution Section */}
        <div className="bg-[#ffffff] rounded-xl shadow-xs border border-[#e5eeff] overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#eff4ff] border-b border-[#e5eeff] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-[#006a61]">
                account_tree
              </span>
              <div>
                <h2 className="font-semibold text-[15px] text-[#0b1c30]">
                  Groundedness &amp; Transparency Pipeline Execution
                </h2>
                <p className="text-[12px] text-[#45464d]">
                  Deterministic transformation from citizen telemetry to verified administrative dispatch
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-medium border border-[#cbdbf5]">
                Total Pipeline Latency: 482ms
              </span>
              <button
                type="button"
                onClick={() => setInspectorExpanded(!inspectorExpanded)}
                className="px-2.5 py-1 rounded hover:bg-[#dce9ff] text-[#45464d] text-[12px] font-semibold flex items-center gap-1 transition-colors border border-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {inspectorExpanded ? 'expand_less' : 'visibility'}
                </span>
                <span>{inspectorExpanded ? 'Collapse Inspector' : 'Expand Inspector'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-6">
            {/* Horizontal Interactive Steps Ribbon */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[860px] flex items-center justify-between relative py-2">
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#dce9ff] z-0"></div>

                {/* Node 1 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex items-center justify-center text-[#0b1c30] group-hover:bg-[#000000] group-hover:text-[#ffffff] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0b1c30] mt-2">Citizen Input</span>
                  <span className="font-mono text-[10px] text-[#76777d] mt-0.5">“धाराशिव PHC पानी”</span>
                </div>

                {/* Node 2 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex items-center justify-center text-[#0b1c30] group-hover:bg-[#000000] group-hover:text-[#ffffff] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">translate</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0b1c30] mt-2">MiniLM-L12</span>
                  <span className="font-mono text-[10px] text-[#76777d] mt-0.5">384-dim Dense Vec</span>
                </div>

                {/* Node 3 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex items-center justify-center text-[#0b1c30] group-hover:bg-[#000000] group-hover:text-[#ffffff] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">hub</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0b1c30] mt-2">FAISS Search</span>
                  <span className="font-mono text-[10px] text-[#76777d] mt-0.5">IndexIVFFlat Cos</span>
                </div>

                {/* Node 4 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex items-center justify-center text-[#0b1c30] group-hover:bg-[#000000] group-hover:text-[#ffffff] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">filter_alt</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0b1c30] mt-2">Ward Metadata</span>
                  <span className="font-mono text-[10px] text-[#76777d] mt-0.5">GeoID Filter: W-04</span>
                </div>

                {/* Node 5 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#86f2e4] border border-[#006a61] shadow-xs flex items-center justify-center text-[#005049] group-hover:bg-[#006a61] group-hover:text-[#ffffff] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#006a61] mt-2">Evidence Match</span>
                  <span className="font-mono text-[10px] text-[#006a61] font-semibold mt-0.5">
                    OGD + NHM Docs
                  </span>
                </div>

                {/* Node 6 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#131b2e] shadow-xs flex items-center justify-center text-[#ffffff] group-hover:bg-[#000000] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">cognition</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0b1c30] mt-2">Gemini 1.5 Ground</span>
                  <span className="font-mono text-[10px] text-[#76777d] mt-0.5">No Hallucinations</span>
                </div>

                {/* Node 7 */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-[130px] group cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-[#dce9ff] border border-[#cbdbf5] shadow-xs flex items-center justify-center text-[#0b1c30] group-hover:bg-[#000000] group-hover:text-[#ffffff] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#0b1c30] mt-2">Civic Signal</span>
                  <span className="font-mono text-[10px] text-[#006a61] font-semibold mt-0.5">
                    Priority: 8.4
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded telemetry metrics inspector */}
            {inspectorExpanded && (
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#dce9ff] grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#76777d] uppercase tracking-wider font-semibold">
                    Embedding Distance Metric
                  </span>
                  <div className="font-mono text-[13px] text-[#0b1c30] font-bold">
                    L2 = 0.284 • Cosine Angle: 19.4°
                  </div>
                  <p className="text-[11px] text-[#45464d]">
                    High semantic convergence between colloquial complaint and ministerial gazettes.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#76777d] uppercase tracking-wider font-semibold">
                    Vector DB Index Spec
                  </span>
                  <div className="font-mono text-[13px] text-[#0b1c30] font-bold">
                    FAISS IVFFlat (nlist=64, nprobe=8)
                  </div>
                  <p className="text-[11px] text-[#45464d]">
                    Scanned 12,410 regional records in 38 milliseconds.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#76777d] uppercase tracking-wider font-semibold">
                    Statutory Guardrail Compliance
                  </span>
                  <div className="font-mono text-[13px] text-[#006a61] font-bold">
                    RTI Section 4(1)(b) Deterministic
                  </div>
                  <p className="text-[11px] text-[#45464d]">
                    Complete auditable derivation preserved in cryptographic sign-off packet.
                  </p>
                </div>
              </div>
            )}

            {/* Claims Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Claims Supported */}
              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#dce9ff]">
                  <span className="font-semibold text-[14px] text-[#006a61] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Claims Supported by Evidence (2)
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-semibold">
                    100% Corroborated
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded bg-[#ffffff] border border-[#dce9ff] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006a61] mt-0.5">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[#0b1c30] font-semibold">
                        Acute macro municipal drinking water deficit in Dharashiv region.
                      </span>
                      <span className="font-mono text-[11px] text-[#45464d] mt-0.5">
                        Supported by JJM district tap coverage figure (50.76% vs 78.4% state average).
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#ffffff] border border-[#dce9ff] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-[#006a61] mt-0.5">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[#0b1c30] font-semibold">
                        Peripheral healthcare facilities vulnerable to dry-season water interruptions.
                      </span>
                      <span className="font-mono text-[11px] text-[#45464d] mt-0.5">
                        Supported by NHM 2023 Infrastructure Audit Report Section 4.B (14% PHC drawdown rate).
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claims Requiring Additional Field Evidence */}
              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-[#dce9ff]">
                  <span className="font-semibold text-[14px] text-[#93000a] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
                      assignment_late
                    </span>
                    Claims Requiring Additional Field Evidence (1)
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-semibold">
                    Pending Physical Audit
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded bg-[#ffffff] border border-[#dce9ff] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[16px] text-[#ba1a1a] mt-0.5">
                      pending
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13px] text-[#0b1c30] font-semibold">
                        Ward 4 PHC borewell pump motor physical mechanical failure.
                      </span>
                      <span className="font-mono text-[11px] text-[#45464d] mt-0.5">
                        No open telemetry exists for local motor switchboards. Dispatching Junior Engineer Inspection Token.
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#e5eeff] border border-[#dce9ff] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#45464d]">
                        schedule_send
                      </span>
                      <span className="text-[12px] text-[#0b1c30] font-semibold">
                        Automated Dispatch: JE Water Works Ticket #WW-DHR-882
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-[#006a61] font-bold">
                      SLA: 24 Hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Interventions Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#eff4ff]">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(
                      'Evidence Dossier Generating',
                      'Compiling OGD-JJM and NHM verified artifacts into cryptographically sealed PDF.'
                    )
                  }
                  className="px-4 py-2 rounded bg-[#000000] text-[#ffffff] text-[13px] font-semibold flex items-center gap-2 shadow-xs hover:bg-[#213145] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  <span>Export Evidence Dossier (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-4 py-2 rounded bg-[#dce9ff] text-[#0b1c30] text-[13px] font-semibold flex items-center gap-2 hover:bg-[#cbdbf5] transition-colors border border-[#cbdbf5] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download JSON Provenance</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onShowToast(
                      'Marked for External Review',
                      'Sent to Divisional Commissioner Grievance Cell with high-priority audit tags.',
                      'warning'
                    )
                  }
                  className="px-4 py-2 rounded bg-[#eff4ff] text-[#ba1a1a] hover:bg-[#ffdad6] text-[13px] font-semibold flex items-center gap-1.5 transition-colors border border-[#dce9ff] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                  <span>Flag for Municipal Audit</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onShowToast(
                      'Tanker Requisition Dispatched',
                      'Water Works Emergency Cell notified: 2x 5000L auxiliary tankers routed to Ward 4 PHC.',
                      'success'
                    )
                  }
                  className="px-4 py-2 rounded bg-[#006a61] text-[#ffffff] hover:bg-[#005049] text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  <span>Emergency Tanker Dispatch</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Log Modal */}
      {showFilterLogModal && (
        <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#ffffff] rounded-xl shadow-2xl max-w-lg w-full p-5 border border-[#dce9ff] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#76777d] text-[20px]">
                  filter_list
                </span>
                <h3 className="font-semibold text-[16px] text-[#0b1c30]">
                  RAG Document Rejection Log
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterLogModal(false)}
                className="text-[#76777d] hover:text-[#0b1c30] p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-[12px] text-[#45464d] leading-relaxed">
              NagrikLens applies strict cosine similarity thresholds (&ge; 0.82) to prevent
              hallucinatory or spurious public record matches.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                { name: 'National Highways Authority Toll Log 2022', sim: 0.612, reason: 'Distance &gt; 12km' },
                { name: 'MSEDCL Industrial Power Billing 2023', sim: 0.584, reason: 'Domain mismatch' },
                { name: 'State Forest Conservation Survey MH-08', sim: 0.521, reason: 'Category mismatch' },
                { name: 'District Fisheries Reservoir Volume 2021', sim: 0.490, reason: 'Outdated temporal frame' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between text-[11px]"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#0b1c30]">{item.name}</span>
                    <span className="text-[#76777d]">{item.reason}</span>
                  </div>
                  <span className="font-mono text-[#ba1a1a] font-semibold">sim: {item.sim}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowFilterLogModal(false)}
                className="px-4 py-1.5 rounded bg-[#000000] text-[#ffffff] text-[12px] font-semibold"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </LocalizedTree>
  );
};
