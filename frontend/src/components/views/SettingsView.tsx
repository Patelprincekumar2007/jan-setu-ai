import React from 'react';
import { AppLanguage, UserRole } from '../../types';
import { ASSETS } from '../../data/mockData';
import { useT } from '../../i18n';

interface SettingsViewProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onShowToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  onLanguageChange,
  activeRole,
  onRoleChange,
  onShowToast,
}) => {
  const t = useT();
  return (
    <div className="p-4 lg:p-6 max-w-[1600px] mx-auto w-full space-y-6 min-h-screen bg-[#f0f4f9] text-slate-900 pb-16 font-sans">
      <div className="saas-card p-6 space-y-2">
        <div className="flex items-center gap-2 text-teal-700 font-mono text-[11px] uppercase font-bold">
          <span className="material-symbols-outlined text-[18px]">settings</span>
          <span>{t('Preferences and User Configuration')}</span>
        </div>
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          {t('Platform Settings')}
        </h1>
        <p className="text-[13px] text-slate-600 max-w-3xl leading-relaxed">
          {t('Configure interface language, active access tier, telemetry alerts, and statutory data export formats.')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <div className="saas-card p-6 space-y-5">
          <h2 className="font-bold text-[16px] text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700 text-[20px]">badge</span>
            {t('Researcher Identity and Credentials')}
          </h2>
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <img
              alt="Civic Analyst Profile"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#00897b]"
              src={ASSETS.profile}
            />
            <div className="space-y-0.5">
              <h3 className="font-bold text-[17px] text-slate-900">Civic Data Analyst</h3>
              <p className="font-mono text-[12px] text-teal-800 font-bold">
                Session: Verified Analyst
              </p>
              <p className="text-[12px] text-slate-500">
                Civic Intelligence and Open Data Observatory
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {t('Active Operational Role')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['Citizen', 'Analyst', 'Admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onRoleChange(role);
                    onShowToast('Role Updated', `Switched active operational view to ${role}.`);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                    activeRole === role
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {t(role)} {t('View')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language & Accessibility */}
        <div className="saas-card p-6 space-y-5">
          <h2 className="font-bold text-[16px] text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-700 text-[20px]">translate</span>
            {t('Language and Multi-Dialect Preference')}
          </h2>

          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
              {t('Default Regional Language')}
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { code: 'EN' as AppLanguage, label: `${t('English')} (EN)` },
                { code: 'HI' as AppLanguage, label: `${t('Hindi')} (Hindi)` },
                { code: 'GU' as AppLanguage, label: `${t('Gujarati')} (Gujarati)` },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(item.code);
                    onShowToast(t('Language Updated'), `${t('Language')}: ${item.label}.`);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                    language === item.code
                      ? 'bg-[#00897b] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <div className="text-[13px] font-bold text-slate-900">
                  Audio Dialect Transcription
                </div>
                <div className="text-[11px] text-slate-500">
                  Enable local Marathi, Hindi, and Gujarati ASR speech-to-text pipeline
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#00897b] cursor-pointer" />
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <div className="text-[13px] font-bold text-slate-900">
                  Zero Synthetic Completion Guardrail
                </div>
                <div className="text-[11px] text-slate-500">
                  Strictly block AI text generation when public citations are absent
                </div>
              </div>
              <input type="checkbox" defaultChecked disabled className="w-4 h-4 accent-[#00897b]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
