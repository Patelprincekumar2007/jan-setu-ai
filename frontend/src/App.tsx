/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavigationTab, UserRole, AppLanguage, CitizenReport } from './types';
import { INITIAL_REPORTS } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast, ToastMessage } from './components/Toast';
import { ReportModal } from './components/ReportModal';

// Views
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
import { createCitizenRequestApi, CitizenRequestInput, CitizenRequestRecord } from './api/requests';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('Analyst');
  const [language, setLanguage] = useState<AppLanguage>('EN');
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_REPORTS);
  const [citizenRequests, setCitizenRequests] = useState<CitizenRequestRecord[]>([]);
  const [selectedReport, setSelectedReport] = useState<CitizenReport>(INITIAL_REPORTS[0]);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

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
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
          onLanguageChange={setLanguage}
          onNavigate={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Dynamic View Content */}
        <main className="w-full pt-16 flex-1 flex flex-col">
          {currentTab === 'dashboard' && (
            <DashboardView
              reports={reports}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onSelectReportForInspection={(report) => setSelectedReport(report)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'report-a-problem' && (
            <ReportProblemView
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'priority-insights' && (
            <PriorityInsightsView onShowToast={showToast} />
          )}

          {currentTab === 'data-sources' && (
            <DataSourcesView onShowToast={showToast} />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsView onShowToast={showToast} />
          )}

          {currentTab === 'my-reports' && (
            <MyReportsView
              reports={reports}
              requests={citizenRequests}
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectReport={(report) => setSelectedReport(report)}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          )}

          {currentTab === 'how-it-works' && (
            <HowItWorksView
              onNavigate={(tab) => {
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentTab === 'tech-architecture' && <TechArchitectureView />}

          {currentTab === 'system-monitoring' && (
            <SystemMonitoringView onShowToast={showToast} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              language={language}
              onLanguageChange={setLanguage}
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              onShowToast={showToast}
            />
          )}
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
  );
}
