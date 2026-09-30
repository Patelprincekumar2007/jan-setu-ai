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
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 flex flex-col gap-5 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <span className="material-symbols-outlined text-[20px]">add_alert</span>
            </div>
            <h2 className="font-bold text-[18px] text-slate-900">
              {t('File New Community Telemetry')}
            </h2>
          </div>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-600 uppercase font-mono">
                {t('Sector Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg p-2.5 text-[13px] text-slate-900 outline-none cursor-pointer"
              >
                <option value="Water">Water Supply</option>
                <option value="Roads">Roads &amp; Connectivity</option>
                <option value="Healthcare">Healthcare Facilities</option>
                <option value="Sanitation">Sanitation &amp; Drainage</option>
                <option value="Electricity">Street Lighting &amp; Power</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-600 uppercase font-mono">
                {t('Location Anchor')}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg p-2.5 text-[13px] text-slate-900 outline-none"
                placeholder="Ward / Street / Landmark"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-600 uppercase font-mono">
              {t('Problem Narrative')}
            </label>
            <textarea
              rows={4}
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              className="bg-slate-50 border border-slate-300 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-lg p-3 text-[13px] text-slate-900 outline-none resize-none placeholder:text-slate-400"
              placeholder={t('Describe the issue in Marathi, Hindi, or English (e.g. Ward 4 PHC borewell pressure drop during morning OPD operations)...')}
              required
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5 text-teal-700 font-medium">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Vector Grounding will link OGD &amp; JJM datasets automatically.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[13px] font-semibold transition-colors cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#00897b] hover:bg-[#00796b] text-white text-[13px] font-bold transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>}
              <span>{isSubmitting ? t('Submitting...') : t('Submit Telemetry')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
