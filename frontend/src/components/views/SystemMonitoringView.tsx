import React from 'react';

interface SystemMonitoringViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SystemMonitoringView: React.FC<SystemMonitoringViewProps> = ({ onShowToast }) => {
  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Live Health Telemetry Stream</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight mt-0.5">
            System Monitoring &amp; Infrastructure Health
          </h1>
          <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
            Real-time status of vector databases, NLP inference nodes, API gateways, and municipal queue workers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onShowToast('Health Probe Triggered', 'All 18 node ping cycles returned HTTP 200 OK.')}
          className="px-4 py-2 rounded-lg bg-[#000000] text-[#ffffff] text-[13px] font-semibold hover:bg-[#213145] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start md:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
          <span>Run Health Check</span>
        </button>
      </div>

      {/* Cluster Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[14px] text-[#0b1c30]">Vector Grounding Node #1</span>
            <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold">
              HEALTHY
            </span>
          </div>
          <div className="font-mono text-[12px] text-[#45464d] space-y-1">
            <div className="flex justify-between">
              <span>Memory Utilization:</span>
              <strong className="text-[#0b1c30]">4.2 GB / 16 GB</strong>
            </div>
            <div className="flex justify-between">
              <span>FAISS Index P95:</span>
              <strong className="text-[#006a61]">42ms</strong>
            </div>
            <div className="flex justify-between">
              <span>Loaded Chunks:</span>
              <strong className="text-[#0b1c30]">12,410</strong>
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[14px] text-[#0b1c30]">Multilingual NLP Node #74</span>
            <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold">
              READY
            </span>
          </div>
          <div className="font-mono text-[12px] text-[#45464d] space-y-1">
            <div className="flex justify-between">
              <span>Model State:</span>
              <strong className="text-[#0b1c30]">Warm (In-Memory)</strong>
            </div>
            <div className="flex justify-between">
              <span>Inference Latency:</span>
              <strong className="text-[#006a61]">142ms</strong>
            </div>
            <div className="flex justify-between">
              <span>Active Workers:</span>
              <strong className="text-[#0b1c30]">8 Cores</strong>
            </div>
          </div>
        </div>

        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[14px] text-[#0b1c30]">Audit Trail Ledger</span>
            <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-mono text-[11px] font-semibold">
              SYNCED
            </span>
          </div>
          <div className="font-mono text-[12px] text-[#45464d] space-y-1">
            <div className="flex justify-between">
              <span>Cryptographic Block:</span>
              <strong className="text-[#0b1c30]">#91,204</strong>
            </div>
            <div className="flex justify-between">
              <span>Integrity Hash:</span>
              <strong className="text-[#006a61]">SHA-256 Valid</strong>
            </div>
            <div className="flex justify-between">
              <span>Failed Dispatches:</span>
              <strong className="text-[#006a61]">0</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
