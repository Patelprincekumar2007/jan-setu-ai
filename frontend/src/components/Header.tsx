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
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: 1,
      title: 'JJM Telemetry Stream Synced',
      desc: 'Ward 4 PHC pipeline flow data corroborated (Chunk #8812).',
      time: '12m ago',
      unread: true,
      tab: 'evidence-explorer' as NavigationTab,
    },
    {
      id: 2,
      title: 'Priority Signal Alert (72/100)',
      desc: 'Ward 4 Water Infrastructure Deficit marked for Junior Engineer dispatch.',
      time: '24m ago',
      unread: true,
      tab: 'priority-insights' as NavigationTab,
    },
    {
      id: 3,
      title: 'Resolved Sanitation Notice',
      desc: 'ZP High School drain blockage closed per Municipal Order #2024-DHA-904.',
      time: '2d ago',
      unread: false,
      tab: 'dashboard' as NavigationTab,
    },
  ];

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#f8f9ff]/85 backdrop-blur-xl border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-4 lg:px-6 flex items-center justify-between gap-3">
      {/* Mobile hamburger & search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#dce9ff] lg:hidden"
          title={t('Open Menu')}
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Global Search Bar */}
        <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-1.5 rounded w-full border border-[#dce9ff] focus-within:border-[#006a61] transition-colors">
          <span className="material-symbols-outlined text-[#76777d] text-[20px]">
            search
          </span>
          <input
            className="bg-transparent w-full outline-none text-[13px] text-[#0b1c30] placeholder:text-[#76777d]"
            placeholder={t('Search datasets, municipal reports, or Ward GeoIDs...')}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                onNavigate('explore-issues');
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[#76777d] hover:text-[#0b1c30] text-[16px]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Demo Mode Badge */}
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-[#e5eeff] text-[#45464d] font-mono text-[11px] font-semibold whitespace-nowrap border border-[#dce9ff]">
          {t('Demo Mode')}
        </span>
      </div>

      {/* Right control cluster: Language, Notifications, User profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language switcher */}
        <div className="flex items-center bg-[#eff4ff] border border-[#dce9ff] rounded p-0.5 text-[12px]">
          {(['EN', 'HI', 'GU'] as AppLanguage[]).map((lang) => {
            const isCurrent = language === lang;
            const label = lang === 'EN' ? 'EN' : lang === 'HI' ? 'हिन्दी' : 'ગુજરાતી';
            return (
              <button
                key={lang}
                type="button"
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-0.5 rounded transition-all font-semibold ${
                  isCurrent
                    ? 'text-[#0b1c30] bg-[#ffffff] shadow-xs'
                    : 'text-[#45464d] hover:text-[#0b1c30]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Notifications toggle button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) setUnreadCount(0);
            }}
            className="relative p-1.5 rounded hover:bg-[#dce9ff] transition-colors text-[#45464d] hover:text-[#0b1c30]"
            title={t('Notifications')}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#ffffff] rounded-xl shadow-xl border border-[#dce9ff] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#eff4ff]">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[13px] text-[#0b1c30]">
                    {t('System Telemetry Feeds')}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#eff4ff] text-[#006a61] font-mono text-[10px] font-semibold">
                    LIVE
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-[#76777d] hover:text-[#0b1c30] text-[16px]"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="flex flex-col divide-y divide-[#eff4ff] my-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.tab);
                      setShowNotifications(false);
                    }}
                    className={`py-2 px-1 hover:bg-[#eff4ff] rounded cursor-pointer transition-colors flex flex-col gap-0.5 ${
                      item.unread ? 'bg-[#eff4ff]/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[#0b1c30]">{item.title}</span>
                      <span className="font-mono text-[10px] text-[#76777d]">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-[#45464d] line-clamp-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#eff4ff] flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('system-monitoring');
                    setShowNotifications(false);
                  }}
                  className="text-[#006a61] font-semibold hover:underline"
                >
                  {t('System Monitoring')} →
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-[#76777d] hover:text-[#0b1c30]"
                >
                  {t('Dismiss')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User profile capsule */}
        <div
          className="flex items-center gap-2 pl-1 cursor-pointer"
          onClick={() => onNavigate('settings')}
          title="Account Information"
        >
          <img
            alt="Profile portrait"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[#006a61]"
            src={ASSETS.profile}
          />
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-[13px] text-[#0b1c30] font-semibold leading-none">
              Dr. Anita Sharma
            </span>
            <span className="text-[11px] text-[#006a61] font-mono leading-none mt-1">
              CIVIC-RES-409
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
