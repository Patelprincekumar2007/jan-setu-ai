import React from 'react';
import { NavigationTab, UserRole } from '../types';
import { ASSETS } from '../data/mockData';

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
  const navItems: { group: string; items: { id: NavigationTab; label: string; icon: string }[] }[] = [
    {
      group: 'Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
        { id: 'report-a-problem', label: 'Report a Problem', icon: 'add_alert' },
        { id: 'explore-issues', label: 'Explore Issues', icon: 'explore' },
        { id: 'evidence-explorer', label: 'Evidence Explorer', icon: 'database' },
        { id: 'priority-insights', label: 'Priority Insights', icon: 'trending_up' },
      ],
    },
    {
      group: 'Data & Research',
      items: [
        { id: 'data-sources', label: 'Data Sources', icon: 'layers' },
        { id: 'analytics', label: 'Analytics', icon: 'query_stats' },
        { id: 'my-reports', label: 'My Reports', icon: 'description' },
      ],
    },
    {
      group: 'Platform',
      items: [
        { id: 'how-it-works', label: 'How It Works', icon: 'account_tree' },
        { id: 'tech-architecture', label: 'Tech Architecture', icon: 'terminal' },
        { id: 'system-monitoring', label: 'System Monitoring', icon: 'verified_user' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#ffffff] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand header */}
          <div className="h-16 px-4 flex items-center justify-between bg-[#eff4ff] border-b border-[#e5eeff]">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              <img
                alt="NagrikLens AI Brand Logo"
                className="h-8 w-auto object-contain"
                src={ASSETS.logo}
                onError={(e) => {
                  // Fallback if image blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="flex flex-col">
                <span className="font-semibold text-[15px] text-[#0b1c30] tracking-tight leading-tight">
                  NagrikLens AI
                </span>
                <span className="font-mono text-[11px] text-[#006a61] tracking-wider uppercase font-semibold">
                  Civic Intelligence
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#45464d] font-mono text-[11px] uppercase font-semibold">
              v1.2
            </span>
          </div>

          {/* Active Role status pill */}
          <div className="px-4 py-2.5">
            <div className="bg-[#eff4ff] rounded p-1 flex items-center justify-between">
              <span className="font-semibold text-[11px] text-[#45464d] uppercase tracking-wider pl-1.5">
                Active Role
              </span>
              <span className="px-2 py-0.5 rounded bg-[#86f2e4] text-[#005049] font-semibold text-[11px]">
                {activeRole} View
              </span>
            </div>
          </div>

          {/* Navigation link groups */}
          <nav className="flex flex-col px-2 py-1 gap-0.5">
            {navItems.map((group) => (
              <div key={group.group} className="flex flex-col">
                <div className="px-2.5 pt-3 pb-1 font-semibold text-[11px] uppercase tracking-wider text-[#76777d]">
                  {group.group}
                </div>
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
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors text-[14px] ${
                        isActive
                          ? 'bg-[#131b2e] text-[#ffffff] font-semibold shadow-xs'
                          : 'text-[#45464d] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isActive ? 'text-[#89f5e7]' : 'text-[#76777d]'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Role Switcher & Profile Bar */}
        <div className="p-2.5 bg-[#eff4ff] border-t border-[#e5eeff] flex flex-col gap-2">
          {/* Quick Role Switcher Buttons */}
          <div className="bg-[#ffffff] rounded p-1 flex items-center justify-between border border-[#dce9ff]">
            {(['Citizen', 'Analyst', 'Admin'] as UserRole[]).map((role) => {
              const isSelected = activeRole === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => onRoleChange(role)}
                  className={`flex-1 py-1 text-center text-[11px] font-semibold rounded transition-colors ${
                    isSelected
                      ? 'bg-[#000000] text-[#ffffff] shadow-xs'
                      : 'text-[#45464d] hover:text-[#0b1c30] hover:bg-[#dce9ff]'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          {/* User Profile Bar */}
          <div
            className="flex items-center gap-2.5 p-1.5 rounded bg-[#ffffff] border border-[#dce9ff] cursor-pointer hover:bg-[#f8f9ff] transition-colors"
            onClick={() => onNavigate('settings')}
            title="View Profile Settings"
          >
            <img
              alt="Dr. Anita Sharma profile"
              className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#006a61]"
              src={ASSETS.profile}
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] text-[#0b1c30] truncate font-semibold leading-tight">
                Dr. Anita Sharma
              </span>
              <span className="text-[11px] text-[#45464d] truncate leading-tight">
                {activeRole === 'Citizen'
                  ? 'Ward 4 Resident'
                  : activeRole === 'Admin'
                  ? 'Chief Municipal Commissioner'
                  : 'Civic Researcher'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[#76777d] text-[18px]">
              unfold_more
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
