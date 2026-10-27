/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store, AppState } from './server/store.ts';
import { Navbar } from './components/Navbar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { SimpleModeHome } from './components/SimpleModeHome.tsx';
import { WorkerCheckIn } from './components/WorkerCheckIn.tsx';
import { WorkerPayslip } from './components/WorkerPayslip.tsx';
import { HazardReportModal } from './components/HazardReportModal.tsx';
import { FeedbackBallot } from './components/FeedbackBallot.tsx';
import { WhatIsRecordedModal } from './components/WhatIsRecordedModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { SupervisorRoster } from './components/SupervisorRoster.tsx';
import { HazardTriageQueue } from './components/HazardTriageQueue.tsx';
import { FatigueConsole } from './components/FatigueConsole.tsx';
import { FeedbackAggregates } from './components/FeedbackAggregates.tsx';
import { AdminSettings } from './components/AdminSettings.tsx';
import { HeatStressModule } from './modules/HeatStressModule.tsx';
import { DutyFairnessModule } from './modules/DutyFairnessModule.tsx';

export default function App() {
  const [state, setState] = useState<AppState>(store.getState());
  const [activeTab, setActiveTab] = useState<string>('checkin');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return unsubscribe;
  }, []);

  // Update default tab when role switches
  useEffect(() => {
    if (state.currentUserRole === 'worker') {
      const adminTabs = ['dashboard', 'roster', 'hazards_queue', 'fatigue_console', 'feedback_aggregates', 'duty_fairness', 'settings'];
      if (adminTabs.includes(activeTab)) {
        setActiveTab(state.simpleMode ? 'home' : 'checkin');
      }
    } else {
      const workerTabs = ['home', 'checkin', 'payslip', 'safety', 'feedback', 'my_data', 'heat_breaks'];
      if (workerTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [state.currentUserRole, state.simpleMode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      <Navbar
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="flex-1 py-4 sm:py-6">
        {state.currentUserRole === 'worker' && state.simpleMode && activeTab !== 'home' && (
          <div className="max-w-2xl mx-auto px-4 mb-4">
            <button
              onClick={() => setActiveTab('home')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              ← திரும்பவும் 4 பெரிய கட்டங்களுக்குச் செல் (Back to 4 Large Tiles)
            </button>
          </div>
        )}

        {/* If Simple Mode is active for a worker, show high-contrast 4-tile view */}
        {state.currentUserRole === 'worker' && state.simpleMode && activeTab === 'home' ? (
          <SimpleModeHome state={state} setActiveTab={setActiveTab} />
        ) : (
          <>
            {/* Worker Views */}
            {activeTab === 'checkin' && <WorkerCheckIn state={state} />}
            {activeTab === 'payslip' && <WorkerPayslip state={state} />}
            {activeTab === 'safety' && <HazardReportModal state={state} />}
            {activeTab === 'feedback' && <FeedbackBallot state={state} />}
            {activeTab === 'my_data' && <WhatIsRecordedModal state={state} />}
            {activeTab === 'heat_breaks' && <HeatStressModule state={state} />}

            {/* Admin & Supervisor Views */}
            {activeTab === 'dashboard' && <AdminDashboard state={state} />}
            {activeTab === 'roster' && <SupervisorRoster state={state} />}
            {activeTab === 'hazards_queue' && <HazardTriageQueue state={state} />}
            {activeTab === 'fatigue_console' && <FatigueConsole state={state} />}
            {activeTab === 'feedback_aggregates' && <FeedbackAggregates state={state} />}
            {activeTab === 'duty_fairness' && <DutyFairnessModule state={state} />}
            {activeTab === 'settings' && <AdminSettings state={state} />}
          </>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>FairShift Platform · Aligned with UN SDG 8 (Decent Work & Economic Growth)</p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Configurable across Construction, Colleges, Hospitals, and Factories · Indian Minor-Unit Currency (Paise) Precision
        </p>
      </footer>

      <LoginModal
        state={state}
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
