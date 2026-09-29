import React, { useState } from 'react';
import { CitizenReport } from '../types';
import { useT } from '../i18n';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Partial<CitizenReport>) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const t = useT();
  const [category, setCategory] = useState<'Water' | 'Roads' | 'Healthcare' | 'Electricity' | 'Sanitation'>('Water');
  const [location, setLocation] = useState('Dharashiv Ward 4, Near Primary Health Centre');
  const [narrative, setNarrative] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        category,
        location,
        ward: 'Ward 4',
        title: `${category} infrastructure disruption at ${location}`,
        narrative,
        priorityScore: category === 'Water' ? 72 : category === 'Roads' ? 58 : 45,
        priorityLabel: category === 'Water' ? 'Priority: 72/100 (High Attention)' : 'Priority: 58/100 (Moderate Hazard)',
        similarityScore: 0.942,
        groundingDoc: 'OGD-JJM-2024 / MahaGIS Ward 4 Schematics',
        groundingAgency: 'Open Government Data Platform',
        status: 'Active Under Review',
        evidenceFound: true,
      });
      setIsSubmitting(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#ffffff] rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-[#dce9ff] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006a61] text-[24px]">
              add_alert
            </span>
            <h2 className="font-semibold text-[20px] text-[#0b1c30]">
              {t('File New Community Telemetry')}
            </h2>
          </div>
          <button
            type="button"
            className="text-[#76777d] hover:text-[#0b1c30] p-1 rounded"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-[13px] text-[#45464d] leading-relaxed">
          {t('Provide infrastructure details in any language. The NagrikLens pipeline will structure entities and pull matching OGD public data.')}
        </p>

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              {t('Incident Category')}
            </label>
            <select
              className="bg-[#eff4ff] text-[#0b1c30] text-[14px] rounded p-2 outline-none border border-[#dce9ff] focus:border-[#006a61]"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="Water">{t('Water Infrastructure (Leakage, Dry Borewell, Contamination)')}</option>
              <option value="Roads">{t('Roads & Transport (Pothole, Subsidence, Culvert)')}</option>
              <option value="Electricity">{t('Electricity & Microgrid (Outage, Line Sag)')}</option>
              <option value="Sanitation">{t('Public Sanitation & Solid Waste Drainage')}</option>
              <option value="Healthcare">{t('Healthcare Facilities (Equipment, Water, Cold Storage)')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              {t('Ward / Location Identifier')}
            </label>
            <input
              className="bg-[#eff4ff] text-[#0b1c30] text-[14px] rounded p-2 outline-none border border-[#dce9ff] focus:border-[#006a61]"
              placeholder={t('e.g., Dharashiv Ward 4, Near Primary Health Centre')}
              required
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              {t('Problem Narrative')}
            </label>
            <textarea
              className="bg-[#eff4ff] text-[#0b1c30] text-[14px] rounded p-2 outline-none border border-[#dce9ff] focus:border-[#006a61]"
              placeholder={t('Describe the physical observation (supports English, हिन्दी, मराठी, ગુજરાતી)...')}
              required
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
            />
          </div>

          <div className="p-2 rounded bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between font-mono text-[11px] text-[#45464d]">
            <span>{t('Targeting vector database:')}</span>
            <span className="text-[#006a61] font-semibold">OGD-MahaGIS-2024 / FAISS v2.4</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              className="px-4 py-2 rounded text-[#45464d] hover:text-[#0b1c30] text-[13px] font-medium"
              onClick={onClose}
              type="button"
            >
              {t('Cancel')}
            </button>
            <button
              className="px-4 py-2 rounded bg-[#006a61] text-[#ffffff] text-[13px] font-semibold hover:bg-[#005049] transition-colors shadow-sm flex items-center gap-1.5"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    sync
                  </span>
                  <span>{t('Extracting Entities...')}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    verified
                  </span>
                  <span>{t('Submit & Run RAG Extraction')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
