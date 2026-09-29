import React from 'react';
import { AppLanguage, UserRole } from '../../types';
import { ASSETS } from '../../data/mockData';

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
  return (
    <div className="p-4 lg:p-6 max-w-[1540px] mx-auto w-full space-y-6">
      <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-2">
        <div className="flex items-center gap-1.5 text-[#006a61] font-mono text-[11px] uppercase font-semibold">
          <span className="material-symbols-outlined text-[16px]">settings</span>
          <span>Preferences &amp; User Configuration</span>
        </div>
        <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">
          Platform Settings
        </h1>
        <p className="text-[13px] text-[#45464d] max-w-3xl leading-relaxed">
          Configure interface language, active access tier, telemetry alerts, and statutory data export formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
          <h2 className="font-bold text-[16px] text-[#0b1c30] pb-2 border-b border-[#eff4ff]">
            Researcher Identity &amp; Credentials
          </h2>
          <div className="flex items-center gap-4">
            <img
              alt="Dr. Anita Sharma profile"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#006a61]"
              src={ASSETS.profile}
            />
            <div className="space-y-0.5">
              <h3 className="font-bold text-[16px] text-[#0b1c30]">Dr. Anita Sharma</h3>
              <p className="font-mono text-[12px] text-[#006a61] font-semibold">
                Badge: CIVIC-RES-409
              </p>
              <p className="text-[12px] text-[#76777d]">
                Senior Civic Researcher, Dharashiv District Observatory
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              Active Operational Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Citizen', 'Analyst', 'Admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    onRoleChange(role);
                    onShowToast('Role Updated', `Switched active operational view to ${role}.`);
                  }}
                  className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-colors ${
                    activeRole === role
                      ? 'bg-[#000000] text-[#ffffff] shadow-xs'
                      : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#dce9ff] border border-[#dce9ff]'
                  }`}
                >
                  {role} View
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Language & Accessibility */}
        <div className="bg-[#ffffff] p-5 rounded-xl shadow-xs border border-[#e5eeff] space-y-4">
          <h2 className="font-bold text-[16px] text-[#0b1c30] pb-2 border-b border-[#eff4ff]">
            Language &amp; Multi-Dialect Preference
          </h2>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#76777d]">
              Default Regional Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'EN' as AppLanguage, label: 'English (EN)' },
                { code: 'HI' as AppLanguage, label: 'हिन्दी (Hindi)' },
                { code: 'GU' as AppLanguage, label: 'ગુજરાતી (Gujarati)' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(item.code);
                    onShowToast('Language Updated', `Active display language set to ${item.label}.`);
                  }}
                  className={`py-2 px-3 rounded-lg text-[13px] font-semibold transition-colors ${
                    language === item.code
                      ? 'bg-[#006a61] text-[#ffffff] shadow-xs'
                      : 'bg-[#eff4ff] text-[#45464d] hover:bg-[#dce9ff] border border-[#dce9ff]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#0b1c30]">
                  Audio Dialect Transcription
                </div>
                <div className="text-[11px] text-[#76777d]">
                  Enable local Marathi/Hindi ASR speech-to-text pipeline
                </div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#006a61]" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#0b1c30]">
                  Zero Synthetic Completion Guardrail
                </div>
                <div className="text-[11px] text-[#76777d]">
                  Strictly block AI text generation when public citations are absent
                </div>
              </div>
              <input type="checkbox" defaultChecked disabled className="w-4 h-4 accent-[#006a61]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
