/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { NavigationTab, UserRole, AppLanguage, CitizenReport } from './types';
import { INITIAL_REPORTS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';
import { ReportModal } from './components/ReportModal';

// Views and Pages
import { DashboardView } from './components/views/DashboardView';
import { ReportProblemView } from './components/views/ReportProblemView';
import { EvidenceExplorerView } from './components/views/EvidenceExplorerView';
import { ExploreIssuesView } from './components/views/ExploreIssuesView';
import { PriorityInsightsView } from './components/views/PriorityInsightsView';
import { DataSourcesView } from './components/views/DataSourcesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { MyReportsView } from './components/views/MyReportsView';
import { HowItWorksView } from './components/views/HowItWorksView';
import { TechArchitectureView } from './components/views/TechArchitectureView';
import { SystemMonitoringView } from './components/views/SystemMonitoringView';
import { SettingsView } from './components/views/SettingsView';
import { DatasetsPage } from './pages/DatasetsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

import { createCitizenRequestApi, CitizenRequestInput, CitizenRequestRecord } from './api/requests';
import { LanguageContext, LocalizedTree } from './i18n';

export const getTabFromPath = (path: string): NavigationTab => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';
  switch (cleanPath) {
    case '/':
    case '/dashboard':
      return 'dashboard';
    case '/submit':
      return 'report-a-problem';
    case '/track':
      return 'my-reports';
    case '/datasets':
      return 'datasets';
    case '/privacy-policy':
      return 'privacy-policy';
    case '/terms':
      return 'terms';
    case '/explore-issues':
      return 'explore-issues';
    case '/evidence-explorer':
      return 'evidence-explorer';
    case '/priority-insights':
      return 'priority-insights';
    case '/data-sources':
      return 'data-sources';
    case '/analytics':
      return 'analytics';
    case '/how-it-works':
      return 'how-it-works';
    case '/tech-architecture':
      return 'tech-architecture';
    case '/system-monitoring':
      return 'system-monitoring';
    case '/settings':
      return 'settings';
    default:
      return 'dashboard';
  }
};

export const getPathFromTab = (tab: NavigationTab): string => {
  switch (tab) {
    case 'dashboard':
      return '/dashboard';
    case 'report-a-problem':
      return '/submit';
    case 'my-reports':
      return '/track';
    case 'datasets':
      return '/datasets';
    case 'privacy-policy':
      return '/privacy-policy';
    case 'terms':
      return '/terms';
    default:
      return `/${tab}`;
  }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'dashboard';
  });
  const [activeRole, setActiveRole] = useState<UserRole>('Analyst');
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const savedLanguage = localStorage.getItem('nagriklens_language');
    return savedLanguage === 'HI' || savedLanguage === 'GU' ? savedLanguage : 'EN';
  });
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
  const [citizenRequests, setCitizenRequests] = useState<CitizenRequestRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport>(INITIAL_REPORTS[0]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath(window.location.pathname);
      setCurrentTab(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'HI' ? 'hi' : language === 'GU' ? 'gu' : 'en';
    localStorage.setItem('nagriklens_language', language);
  }, [language]);

  const handleLanguageChange = (nextLanguage: AppLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem('nagriklens_language', nextLanguage);
  };

  const handleNavigate = (tab: NavigationTab, updateHistory = true) => {
    setCurrentTab(tab);
    if (updateHistory && typeof window !== 'undefined') {
      const targetPath = getPathFromTab(tab);
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setToast({ id, title, desc, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3600);
  };

  const handleAddNewReport = (reportData: Partial<CitizenReport>) => {
    const newReport: CitizenReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      ticketId: `#REP-${Math.floor(8825 + Math.random() * 50)}`,
      category: reportData.category || 'Water',
      title: reportData.title || 'Reported community disruption',
      narrative: reportData.narrative || '',
      location: reportData.location || 'Dharashiv Urban',
      ward: reportData.ward || 'Ward 4',
      geoId: `MH-DHA-${Math.floor(1000 + Math.random() * 9000)}`,
      coordinates: [18.1856, 76.0416],
      timestamp: 'Just now',
      status: 'Active Under Review',
      priorityScore: reportData.priorityScore || 70,
      priorityLabel: reportData.priorityLabel || 'Priority: 70/100 (High Attention)',
      similarityScore: reportData.similarityScore || 0.942,
      groundingDoc: reportData.groundingDoc || 'OGD-JJM-2024 / MahaGIS Registry',
      groundingAgency: reportData.groundingAgency || 'Open Government Data Platform',
      evidenceFound: true,
      householdsAffected: reportData.householdsAffected || 85,
      facilityName: reportData.facilityName || 'Primary Health Centre',
      slaRemaining: '48h avg',
    };

    setReports([newReport, ...reports]);
    setSelectedReport(newReport);
    showToast(
      'Telemetry Report Filed',
      `${newReport.ticketId} dispatched to Ward 4 Queue. OGD vector search completed with 94% similarity.`,
      'success'
    );
  };

  const handleCreateCitizenRequest = async (input: CitizenRequestInput) => {
    const created = await createCitizenRequestApi(input);
    setCitizenRequests((current) => [created, ...current]);
    return created;
  };

  return (
    <LanguageContext.Provider value={language}>
    <div className="min-h-screen bg-[#f0f4f9] text-[#0f172a] flex font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        activeRole={activeRole}
        onRoleChange={setActiveRole}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Global Header */}
        <Header
          language={language}
          onLanguageChange={handleLanguageChange}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Dynamic View Content */}
        <main className="w-full pt-16 flex-1 flex flex-col">
          <LocalizedTree>
          {currentTab === 'dashboard' && (
            <DashboardView
              reports={reports}
              onNavigate={handleNavigate}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onSelectReportForInspection={(report) => setSelectedReport(report)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'report-a-problem' && (
            <ReportProblemView
              onNavigate={handleNavigate}
              onSubmitRequest={handleCreateCitizenRequest}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'evidence-explorer' && (
            <EvidenceExplorerView
              selectedReport={selectedReport}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'explore-issues' && (
            <ExploreIssuesView
              onNavigate={handleNavigate}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'priority-insights' && (
            <PriorityInsightsView onShowToast={showToast} />
          )}

          {currentTab === 'data-sources' && (
            <DataSourcesView onShowToast={showToast} />
          )}

          {currentTab === 'datasets' && (
            <DatasetsPage />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView onShowToast={showToast} />
          )}

          {currentTab === 'my-reports' && (
            <MyReportsView
              reports={reports}
              requests={citizenRequests}
              onNavigate={handleNavigate}
              onSelectReport={(report) => setSelectedReport(report)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {currentTab === 'how-it-works' && (
            <HowItWorksView
              onNavigate={handleNavigate}
            />
          )}

          {currentTab === 'tech-architecture' && <TechArchitectureView />}

          {currentTab === 'system-monitoring' && (
            <SystemMonitoringView onShowToast={showToast} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              language={language}
              onLanguageChange={handleLanguageChange}
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'privacy-policy' && (
            <PrivacyPolicyPage onNavigate={handleNavigate} />
          )}

          {currentTab === 'terms' && (
            <TermsPage onNavigate={handleNavigate} />
          )}
          </LocalizedTree>
        </main>
      </div>

      {/* Global Interactive Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleAddNewReport}
      />

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
    </LanguageContext.Provider>
  );
}
