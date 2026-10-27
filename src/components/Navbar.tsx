/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { store, AppState } from '../server/store.ts';
import { t } from '../i18n/index.ts';
import { Language, Role, TextSize } from '../types/index.ts';
import {
  Globe,
  RotateCcw,
  Sparkles,
  Users,
  ShieldAlert,
  Building,
  GraduationCap,
  Accessibility,
  Volume2,
} from 'lucide-react';

interface NavbarProps {
  state: AppState;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ state, activeTab, setActiveTab, onOpenLogin }) => {
  const currentWorker = state.workers.find((w) => w.id === state.currentUserId);
  const currentOrg = state.orgs.find((o) => o.id === state.currentOrgId);
  const isConstruction = currentOrg?.sectorPreset === 'construction';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
      {/* Top Banner: Quick sector switch, Role switch, Language & Demo Reset */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            FairShift · SDG 8
          </span>
          <span className="text-slate-600">|</span>
          {/* Sector Switcher */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => store.setSector('org_metro_infra')}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition ${
                isConstruction ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Building className="w-3 h-3" />
              Construction Site
            </button>
            <button
              onClick={() => store.setSector('org_greenfield_college')}
              className={`px-2 py-1 rounded flex items-center gap-1 font-medium transition ${
                !isConstruction ? 'bg-blue-500 text-white font-bold shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              College / Campus
            </button>
          </div>
        </div>

        {/* Right tools: Language, Text size, Simple mode toggle, Demo Reset, User profile */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Language selection */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <Globe className="w-3 h-3 ml-1.5 text-slate-400" />
            {(['en', 'ta', 'hi'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => store.setLanguage(lang)}
                className={`px-2 py-0.5 rounded text-xs font-semibold uppercase transition ${
                  state.currentLanguage === lang ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'ta' ? 'தமிழ்' : lang === 'hi' ? 'हिंदी' : 'EN'}
              </button>
            ))}
          </div>

          {/* Simple Mode Toggle */}
          <button
            onClick={() => {
              const next = !state.simpleMode;
              store.setSimpleMode(next);
              setActiveTab(next ? 'home' : 'checkin');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
              state.simpleMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Toggle high-contrast large icon simple mode"
          >
            <Accessibility className="w-3.5 h-3.5" />
            <span>{state.simpleMode ? '✓ Simple Mode (Active)' : 'Simple Mode (Off)'}</span>
          </button>

          {/* User Account / Role switcher button */}
          <button
            onClick={onOpenLogin}
            className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
          >
            <Users className="w-3 h-3 text-emerald-400" />
            <span>
              {currentWorker?.fullName} ({t(`role.${currentWorker?.role}`, state.currentLanguage)})
            </span>
            <span className="text-slate-500">▼</span>
          </button>

          {/* Reset Demo */}
          <button
            onClick={() => {
              if (window.confirm('Reset all shifts, hazards, and feedback back to baseline demo state?')) {
                store.resetToSeed();
              }
            }}
            className="px-2 py-1 rounded text-xs text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-800/60 flex items-center gap-1 transition"
            title="Reset database to deterministic seed"
          >
            <RotateCcw className="w-3 h-3" />
            {t('action.reset_demo', state.currentLanguage)}
          </button>
        </div>
      </div>

      {/* Main Nav Tabs: Contextually adapted to Role */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto">
        <nav className="flex items-center gap-1 py-1">
          {/* Worker Navigation */}
          {state.currentUserRole === 'worker' ? (
            <>
              <button
                onClick={() => setActiveTab('checkin')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'checkin' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.checkin', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('payslip')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'payslip' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.payslip', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('safety')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'safety' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.safety', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'feedback' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.feedback', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('my_data')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'my_data' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.my_data', state.currentLanguage)}
              </button>
              {isConstruction ? (
                <button
                  onClick={() => setActiveTab('heat_breaks')}
                  className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                    activeTab === 'heat_breaks' ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-400' : 'text-amber-300 hover:text-white'
                  }`}
                >
                  {t('nav.heat_breaks', state.currentLanguage)}
                </button>
              ) : null}
            </>
          ) : (
            /* Admin / Supervisor Navigation */
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'dashboard' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.dashboard', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('roster')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'roster' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.roster', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('hazards_queue')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'hazards_queue' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.hazards_queue', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('fatigue_console')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'fatigue_console' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.fatigue_console', state.currentLanguage)}
              </button>
              <button
                onClick={() => setActiveTab('feedback_aggregates')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'feedback_aggregates' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.feedback', state.currentLanguage)}
              </button>
              {!isConstruction ? (
                <button
                  onClick={() => setActiveTab('duty_fairness')}
                  className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                    activeTab === 'duty_fairness' ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-blue-300 hover:text-white'
                  }`}
                >
                  {t('nav.duty_fairness', state.currentLanguage)}
                </button>
              ) : null}
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-md font-medium text-sm transition ${
                  activeTab === 'settings' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t('nav.settings', state.currentLanguage)}
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
