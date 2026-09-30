import React, { useState } from 'react';
import { AppLanguage, NavigationTab } from '../types';
import { ASSETS } from '../data/mockData';
import { useT } from '../i18n';

interface HeaderProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenMobileMenu: () => void;
  onOpenReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  onNavigate,
  onOpenMobileMenu,
  onOpenReportModal,
}) => {
  const t = useT();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Dharashiv District');
  const [unreadCount, setUnreadCount] = useState(1);

  const notifications = [
    {
      id: 1,
      title: 'JJM Telemetry Stream Corroborated',
      desc: 'Ward 4 PHC pipeline flow data verified against OGD baseline records.',
      time: '12m ago',
      unread: true,
      tab: 'evidence-explorer' as NavigationTab,
    },
    {
      id: 2,
      title: 'Priority Signal Alert (72/100)',
      desc: 'Ward 4 Water Infrastructure Deficit marked for municipal engineer dispatch.',
      time: '24m ago',
      unread: false,
      tab: 'priority-insights' as NavigationTab,
    },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white border-b border-slate-200 shadow-xs z-40 px-4 lg:px-6 flex items-center justify-between gap-4 font-sans">
      {/* Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          title={t('Open Menu')}
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Global Search Bar with Cmd+K Badge */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-1.5 rounded-lg w-full border border-slate-200 focus-within:border-[#00897b] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#00897b]/20 transition-all">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">
            search
          </span>
          <input
            className="bg-transparent w-full outline-none text-[13px] text-slate-800 placeholder:text-slate-400"
            placeholder={t('Search datasets, reports, wards, or ask a question...')}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                onNavigate('explore-issues');
              }
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700 text-[16px]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white text-slate-500 font-mono text-[10px] font-semibold border border-slate-200 shadow-2xs">
              ⌘ K
            </kbd>
          )}
        </div>
      </div>

      {/* Right Control Cluster */}
      <div className="flex items-center gap-3 shrink-0">
        {/* District Selector Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] font-medium text-slate-700 shadow-2xs">
          <span className="material-symbols-outlined text-[16px] text-rose-500">
            location_on
          </span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            aria-label="Select Geographic District Scope"
            className="bg-transparent text-slate-700 font-semibold text-[12px] outline-none cursor-pointer pr-1"
          >
            <option value="Dharashiv District">Dharashiv District</option>
            <option value="Pune District">Pune District</option>
            <option value="Nagpur District">Nagpur District</option>
            <option value="Nashik District">Nashik District</option>
          </select>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-[11px]">
          {(['EN', 'HI', 'GU'] as AppLanguage[]).map((lang) => {
            const isCurrent = language === lang;
            const label = lang === 'EN' ? 'EN' : lang === 'HI' ? 'हिन्दी' : 'ગુજરાતી';
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded-md transition-all font-semibold cursor-pointer ${
                  isCurrent
                    ? 'text-slate-900 bg-white shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) setUnreadCount(0);
            }}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors relative cursor-pointer shadow-2xs"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-slate-200 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-[13px] text-slate-800">Notifications</span>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Live Telemetry</span>
              </div>
              <div className="flex flex-col gap-1.5 mt-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onNavigate(n.tab);
                      setShowNotifications(false);
                    }}
                    className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[12px] text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="relative">
            <img
              src={ASSETS.profile}
              alt="Dr. Anita Sharma"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-600/30"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="hidden xl:flex flex-col text-left leading-tight">
            <span className="font-bold text-[13px] text-slate-900 tracking-tight">
              Dr. Anita Sharma
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              Analyst • <span className="text-[#00897b] font-bold">CIVIC-RES-409</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
