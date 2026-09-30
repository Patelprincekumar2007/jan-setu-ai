import React from 'react';
import { NavigationTab, UserRole } from '../types';
import { ASSETS } from '../data/mockData';
import { useT } from '../i18n';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  activeRole,
  onRoleChange,
  isMobileOpen,
  onCloseMobile,
}) => {
  const t = useT();

  const navItems: { group: string; items: { id: NavigationTab; label: string; icon: string }[] }[] = [
    {
      group: 'CORE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'home' },
        { id: 'report-a-problem', label: 'Report a Problem', icon: 'notifications_active' },
        { id: 'explore-issues', label: 'Explore Issues', icon: 'explore' },
        { id: 'evidence-explorer', label: 'Evidence Explorer', icon: 'layers' },
        { id: 'priority-insights', label: 'Priority Insights', icon: 'trending_up' },
      ],
    },
    {
      group: 'DATA & RESEARCH',
      items: [
        { id: 'data-sources', label: 'Data Sources', icon: 'dataset' },
        { id: 'analytics', label: 'Analytics', icon: 'insights' },
        { id: 'my-reports', label: 'My Reports', icon: 'description' },
      ],
    },
    {
      group: 'PLATFORM',
      items: [
        { id: 'how-it-works', label: 'How It Works', icon: 'account_tree' },
        { id: 'tech-architecture', label: 'Tech Architecture', icon: 'developer_board' },
        { id: 'system-monitoring', label: 'System Monitoring', icon: 'security' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#08101d] border-r border-[#1a2b44] z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#16253b] bg-[#070d18]">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00c49f] to-[#0284c7] flex items-center justify-center shadow-[0_0_12px_rgba(0,196,159,0.35)]">
                <span className="material-symbols-outlined text-[20px] text-[#070d18] font-bold">hub</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] text-[#ffffff] tracking-tight leading-tight">
                  NagrikLens AI
                </span>
                <span className="font-mono text-[10px] text-[#2dd4bf] tracking-wider uppercase font-semibold">
                  Civic Intelligence
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#162b45] text-[#94a3b8] font-mono text-[11px] font-semibold border border-[#233d60]">
              v1.2
            </span>
          </div>

          {/* Active Role status pill */}
          <div className="px-4 pt-3.5 pb-2">
            <div className="bg-[#0e1c30] rounded-lg p-2 flex items-center justify-between border border-[#1b3152]">
              <span className="font-semibold text-[10px] text-[#94a3b8] uppercase tracking-wider pl-1 font-mono">
                {t('Active Role')}
              </span>
              <div className="relative">
                <select
                  value={activeRole}
                  onChange={(e) => onRoleChange(e.target.value as UserRole)}
                  aria-label={t('Active Role')}
                  className="appearance-none bg-[#0a2f32] text-[#2dd4bf] font-semibold text-[11px] px-2.5 py-1 pr-6 rounded-md border border-[#145d58] cursor-pointer outline-none hover:bg-[#0d3b3f] transition-colors"
                >
                  <option value="Analyst">{t('Analyst')}</option>
                  <option value="Executive">{t('Executive')}</option>
                  <option value="Field Officer">{t('Field Officer')}</option>
                  <option value="Citizen">{t('Citizen')}</option>
                </select>
                <span className="material-symbols-outlined text-[14px] text-[#2dd4bf] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  arrow_drop_down
                </span>
              </div>
            </div>
          </div>

          {/* Navigation link groups */}
          <nav className="flex flex-col px-3 py-1 gap-1">
            {navItems.map((group) => (
              <div key={group.group} className="flex flex-col mt-2">
                <div className="px-3 pt-2 pb-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                  {t(group.group)}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#0e2d36] text-[#2dd4bf] font-semibold border-l-3 border-[#00c49f] shadow-[0_0_12px_rgba(0,196,159,0.15)]'
                            : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#112138]'
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                            isActive ? 'text-[#2dd4bf]' : 'text-[#64748b] group-hover:text-[#94a3b8]'
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="truncate">{t(item.label)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom promo / community card */}
        <div className="p-3 m-3 rounded-xl bg-gradient-to-t from-[#060c16] to-[#0e1b30] border border-[#1b3152] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#00c49f]/10 via-transparent to-transparent opacity-80" />
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[#2dd4bf]">
              <span className="material-symbols-outlined text-[16px]">location_city</span>
              <span className="font-bold text-[12px] text-white">Better Cities.</span>
            </div>
            <p className="text-[11px] text-[#94a3b8] leading-tight">
              Stronger Communities.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
