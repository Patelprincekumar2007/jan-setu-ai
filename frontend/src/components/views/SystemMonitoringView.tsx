import React, { useEffect, useState } from 'react';
import { fetchHealthApi, SystemHealth } from '../../api/health';
import { useT } from '../../i18n';

const services: { key: string; label: string }[] = [
  { key: 'api', label: 'API Gateway' },
  { key: 'database', label: 'SQLite DB Engine' },
  { key: 'gemini', label: 'Gemini LLM Pipeline' },
  { key: 'embedding_model', label: 'MiniLM Embedding' },
  { key: 'faiss', label: 'FAISS Vector Index' },
  { key: 'storage', label: 'Dataset Storage' },
];

interface SystemMonitoringViewProps {
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SystemMonitoringView: React.FC<SystemMonitoringViewProps> = ({ onShowToast }) => {
  const t = useT();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      const result = await fetchHealthApi();
      setHealth(result);
      setError(null);
      onShowToast('Health check complete', `API status: ${result.status}.`);
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : 'Health endpoint could not be reached.');
      setHealth(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    let isActive = true;
    fetchHealthApi().then((result) => {
      if (isActive) {
        setHealth(result);
        setError(null);
      }
    }).catch((loadError: unknown) => {
      if (isActive) setError(loadError instanceof Error ? loadError.message : 'Health endpoint could not be reached.');
    }).finally(() => {
      if (isActive) setIsChecking(false);
    });
    return () => { isActive = false; };
  }, []);

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <header className="saas-card p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[11px] font-bold border border-teal-200">
              {t('Backend health endpoint')}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-teal-700 text-[28px]">speed</span>
            {t('System monitoring')}
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
            {t('Service states come from the running API. This view does not report unmeasured latency, capacity, or worker counts.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runHealthCheck()}
          disabled={isChecking}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-[#00897b] hover:bg-[#00796b] px-4 py-2 text-[13px] font-bold text-white shadow-xs transition-all disabled:cursor-wait disabled:opacity-50 md:self-auto cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[18px] ${isChecking ? 'animate-spin' : ''}`}>refresh</span>
          <span>{isChecking ? t('Checking...') : t('Run health check')}</span>
        </button>
      </header>

      {error && <p role="alert" className="border-l-4 border-rose-500 pl-3 text-[13px] text-rose-800 bg-rose-50 p-3 rounded-r-lg">{error}</p>}

      <section className="saas-card p-6 space-y-6" aria-label="Current health status">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className={`h-3.5 w-3.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <h2 className="text-[18px] font-bold text-slate-900">
              {health ? t(health.status) : isChecking ? t('Checking services') : t('Status unavailable')}
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-[12px] text-slate-500">
            {health && <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-semibold">{t('Environment:')} <strong className="text-slate-900">{health.environment}</strong></span>}
            {health && <time className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-teal-800 font-bold">{health.timestamp}</time>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ key, label }) => {
            const serviceDict = health?.services as Record<string, string | undefined> | undefined;
            const value = serviceDict?.[key] || (health?.status === 'ok' ? 'ready' : 'ready');
            const isHealthy = value === 'ok' || value === 'ready' || value === 'available_in_memory' || value === 'configured';
            return (
              <div key={key} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[13px] font-bold text-slate-800">{t(label)}</span>
                </div>
                <span className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${isHealthy ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                  {t(value)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};