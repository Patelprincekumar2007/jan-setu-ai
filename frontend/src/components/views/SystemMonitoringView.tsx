import React, { useEffect, useState } from 'react';
import { fetchHealthApi, SystemHealth } from '../../api/health';
import { useT } from '../../i18n';

const services: { key: string; label: string; desc: string }[] = [
  { key: 'api', label: 'API Gateway', desc: 'FastAPI HTTP service & route handling' },
  { key: 'database', label: 'SQLite DB Engine', desc: 'Relational data persistence & requests' },
  { key: 'gemini', label: 'Gemini LLM Pipeline', desc: 'Evidence-grounded RAG reasoning' },
  { key: 'embedding_model', label: 'MiniLM Embedding', desc: 'Sentence transformer semantic vectors' },
  { key: 'faiss', label: 'FAISS Vector Index', desc: 'Public knowledge retrieval index' },
  { key: 'storage', label: 'Dataset Storage', desc: 'Ingested government open dataset records' },
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
      onShowToast('Health check complete', `API status: ${result.status}.`, 'success');
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

  const isSystemOperational = health?.status === 'ok' || health?.status === 'healthy';
  const isSystemDegraded = health?.status === 'degraded';

  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <header className="saas-card p-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 font-mono text-[11px] font-bold border border-teal-200">
              {t('Backend Health Endpoint: /health')}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-teal-700 text-[28px]">speed</span>
            {t('System monitoring')}
          </h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-slate-600">
            {t('Service states are verified directly via the live API health check endpoint. This view displays authentic connection and readiness telemetry.')}
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

      {error && (
        <div role="alert" className="border-l-4 border-rose-500 pl-4 text-[13px] text-rose-800 bg-rose-50 p-4 rounded-r-lg space-y-1">
          <p className="font-bold">{t('Health probe notice')}: {error}</p>
          <p className="text-[12px] text-rose-700">
            {t('If the backend is waking from cold standby on Render free tier, please wait a few seconds and run the health check again.')}
          </p>
        </div>
      )}

      <section className="saas-card p-6 space-y-6" aria-label="Current health status">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span
              className={`h-3.5 w-3.5 rounded-full ${
                isSystemOperational
                  ? 'bg-emerald-500'
                  : isSystemDegraded
                  ? 'bg-amber-500'
                  : isChecking
                  ? 'bg-slate-400 animate-pulse'
                  : 'bg-rose-500'
              }`}
            />
            <h2 className="text-[18px] font-bold text-slate-900">
              {health
                ? isSystemOperational
                  ? t('Operational')
                  : isSystemDegraded
                  ? t('Degraded')
                  : t(health.status)
                : isChecking
                ? t('Checking services...')
                : t('Status unavailable')}
            </h2>
          </div>
          <div className="flex items-center gap-3 font-mono text-[12px] text-slate-500">
            {health && (
              <span className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-semibold">
                {t('Environment:')} <strong className="text-slate-900">{health.environment}</strong>
              </span>
            )}
            {health?.timestamp && (
              <time className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 text-teal-800 font-bold">
                {health.timestamp}
              </time>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ key, label, desc }) => {
            const serviceDict = health?.services as Record<string, string | undefined> | undefined;
            const rawValue = serviceDict?.[key];
            const value = rawValue || (health ? (isSystemOperational ? 'ready' : 'unavailable') : isChecking ? 'checking...' : 'unavailable');
            const isHealthy = ['ok', 'ready', 'connected', 'configured', 'available', 'accessible', 'in_memory'].includes(value.toLowerCase());
            const isDegraded = ['degraded', 'uninitialized', 'not_configured'].includes(value.toLowerCase());

            return (
              <div key={key} className="flex flex-col justify-between gap-2 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isHealthy
                          ? 'bg-emerald-500'
                          : isDegraded
                          ? 'bg-amber-500'
                          : isChecking
                          ? 'bg-slate-400 animate-pulse'
                          : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[13px] font-bold text-slate-800">{t(label)}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : isDegraded
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : isChecking
                        ? 'bg-slate-100 text-slate-600 border-slate-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {t(value)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal pl-5">{t(desc)}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};