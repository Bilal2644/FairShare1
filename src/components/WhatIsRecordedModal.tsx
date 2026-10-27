/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Worker Dignity & Data Transparency: "What is recorded about me"
 * Aligned with Locked Principle #2: Workers have an inviolable right to inspect
 * every datum and timestamp recorded about them by the organization.
 */

import React from 'react';
import { AppState } from '../server/store.ts';
import { t } from '../i18n/index.ts';
import {
  ShieldCheck,
  Download,
  Clock,
  MapPin,
  Lock,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

interface WhatIsRecordedProps {
  state: AppState;
}

export const WhatIsRecordedModal: React.FC<WhatIsRecordedProps> = ({ state }) => {
  const worker = state.workers.find((w) => w.id === state.currentUserId);
  const myShifts = state.shifts.filter((s) => s.workerId === state.currentUserId);
  const myPayslips = state.payslips.filter((p) => p.workerId === state.currentUserId);
  const myHazards = state.hazards.filter((h) => h.reporterWorkerId === state.currentUserId);

  const handleDownloadMyData = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      workerProfile: {
        workerCode: worker?.workerCode,
        fullName: worker?.fullName,
        designation: worker?.designation,
        dailyBaseWagePaise: worker?.dailyBaseWagePaise,
      },
      shiftsCount: myShifts.length,
      shifts: myShifts,
      payslips: myPayslips,
      namedHazards: myHazards,
      anonymousGuarantees: {
        anonymousFeedbackInCycle: 'Stored in separate unlinked vault without user identifier.',
        continuousLocationTracking: 'Never collected. Only instantaneous check-in coordinates stored.',
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fairshift_data_${worker?.workerCode || 'worker'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                What is Recorded About Me
              </h1>
              <p className="text-xs text-slate-400">
                Worker Dignity, GDPR & DPDP Aligned Transparency
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadMyData}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            {t('action.download_data', state.currentLanguage)}
          </button>
        </div>

        {/* Dignity Guarantee Note */}
        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-purple-300 block text-sm mb-1">
            FairShift Transparency Promise:
          </span>
          This system belongs to worker dignity, not surveillance. You have an absolute right to review all information saved regarding your labor, time, and wages. No supervisor can hide formula calculations or your shift attendance timestamps.
        </div>

        {/* 1. Profile Data */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-purple-400">
            <User className="w-3.5 h-3.5" />
            Your Identity Record
          </span>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-500 block">Full Name:</span>
              <span className="font-semibold text-white">{worker?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Worker Code:</span>
              <span className="font-semibold text-white">#{worker?.workerCode}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Designation:</span>
              <span className="font-semibold text-white">{worker?.designation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Base Daily Wage:</span>
              <span className="font-semibold text-emerald-400">
                ₹{((worker?.dailyBaseWagePaise || 0) / 100).toFixed(2)} / day
              </span>
            </div>
          </div>
        </div>

        {/* 2. Attendance & Geolocation Facts */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-emerald-400">
            <MapPin className="w-3.5 h-3.5" />
            Location & Shifts
          </span>
          <p className="text-slate-300">
            We record <strong>{myShifts.length} shift check-ins</strong>.
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>• <strong>Location Readout:</strong> GPS coordinates are captured ONLY at the exact second of check-in and check-out to verify gate arrival.</p>
            <p>• <strong>Zero Background Tracking:</strong> This app NEVER tracks your movement or location during work or outside work hours.</p>
          </div>
        </div>

        {/* 3. Feedback Anonymity Architecture */}
        <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-2 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-indigo-400">
            <Lock className="w-3.5 h-3.5" />
            Anonymous Voice Verification
          </span>
          <p className="text-slate-300">
            When you complete survey ballots, the response is mathematically unlinked:
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>• The system only records: <em>"Worker #{worker?.workerCode} has submitted"</em> to avoid double-voting.</p>
            <p>• Your scores and comments are deposited in a disconnected vault table with NO worker identifier.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
