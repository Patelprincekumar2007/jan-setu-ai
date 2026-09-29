import React, { useEffect, useState } from 'react';
import { fetchHealthApi, SystemHealth } from '../../api/health';
import { useT } from '../../i18n';

const services: { key: keyof SystemHealth['services']; label: string }[] = [
  { key: 'api', label: 'API' },
  { key: 'database', label: 'Database' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'embedding_model', label: 'Embedding model' },
  { key: 'faiss', label: 'FAISS index' },
  { key: 'storage', label: 'File storage' },
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
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#dce9ff] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase text-[#006a61]">{t('Backend health endpoint')}</p>
          <h1 className="mt-1 text-[24px] font-bold text-[#0b1c30]">{t('System monitoring')}</h1>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-[#45464d]">
            {t('Service states come from the running API. This view does not report unmeasured latency, capacity, or worker counts.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void runHealthCheck()}
          disabled={isChecking}
          className="inline-flex items-center gap-2 self-start border border-[#006a61] px-4 py-2 text-[13px] font-semibold text-[#005049] hover:bg-[#e7f5f1] disabled:cursor-wait disabled:opacity-50 md:self-auto"
        >
          <span className={`material-symbols-outlined text-[18px] ${isChecking ? 'animate-spin' : ''}`}>refresh</span>
          <span>{isChecking ? t('Checking...') : t('Run health check')}</span>
        </button>
      </header>

      {error && <p role="alert" className="border-l-2 border-[#ba1a1a] pl-3 text-[13px] text-[#93000a]">{error}</p>}

      <section className="space-y-3" aria-label="Current health status">
        <div className="flex flex-wrap items-center gap-3 border-y border-[#dce9ff] py-4">
          <span className={`h-2.5 w-2.5 ${health?.status === 'healthy' ? 'bg-[#006a61]' : 'bg-[#ba1a1a]'}`} />
          <h2 className="text-[17px] font-semibold text-[#0b1c30]">
            {health ? t(health.status) : isChecking ? t('Checking services') : t('Status unavailable')}
          </h2>
          {health && <span className="text-[12px] text-[#76777d]">{t('Environment:')} {health.environment}</span>}
          {health && <time className="text-[12px] text-[#76777d]">{health.timestamp}</time>}
        </div>
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ key, label }) => {
            const value = health?.services[key] ?? 'unknown';
            const isHealthy = value === 'ok' || value === 'ready' || value === 'available_in_memory' || value === 'configured';
            return (
              <div key={key} className="flex items-center justify-between gap-3 border-b border-[#eff4ff] py-3">
                <span className="text-[13px] text-[#45464d]">{t(label)}</span>
                <span className={`font-mono text-[12px] font-semibold ${isHealthy ? 'text-[#005049]' : 'text-[#93000a]'}`}>{t(value)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};