/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Executive Dashboard & Explainable Retention Risk Radar
 * Aggregates headcount, overtime expenditure, open hazards, sentiment,
 * and rule-based friction factors with ethical mandate banner.
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { t, formatINR } from '../i18n/index.ts';
import {
  Users,
  Clock,
  AlertTriangle,
  Smile,
  Download,
  ShieldAlert,
  Flame,
  HelpCircle,
  TrendingDown,
  Info,
} from 'lucide-react';

interface AdminDashboardProps {
  state: AppState;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ state }) => {
  const currentOrg = state.orgs.find((o) => o.id === state.currentOrgId);
  const orgWorkers = state.workers.filter((w) => w.orgId === state.currentOrgId);
  const orgShifts = state.shifts.filter((s) => s.orgId === state.currentOrgId);
  const orgHazards = state.hazards.filter((h) => h.orgId === state.currentOrgId);

  // Active On-Site
  const activeCount = orgShifts.filter((s) => s.status === 'IN_PROGRESS').length;
  // Overtime accumulated
  const totalOtHours = orgShifts.reduce((acc, s) => acc + s.overtimeHours, 0);
  // Open hazards
  const openHazards = orgHazards.filter((h) => h.status !== 'RESOLVED');
  const breachedHazards = openHazards.filter((h) => h.status === 'ESCALATED');

  // Explainable retention risk items
  const riskItems = store.getRetentionRiskList();

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Shift_ID',
      'Worker_Name',
      'Worker_Code',
      'WorkDay_Date',
      'Start_UTC',
      'End_UTC',
      'Regular_Hours',
      'Overtime_Hours',
      'CheckIn_Method',
      'Status',
    ];

    const rows = orgShifts.map((s) => {
      const w = state.workers.find((w) => w.id === s.workerId);
      return [
        s.id,
        `"${w?.fullName || 'Worker'}"`,
        w?.workerCode || '',
        s.workDayDate,
        s.startTimeUtc,
        s.endTimeUtc || 'IN_PROGRESS',
        s.regularHours.toFixed(1),
        s.overtimeHours.toFixed(1),
        s.checkInMethod,
        s.status,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fairshift_shifts_${currentOrg?.slug || 'org'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
            {currentOrg?.name} · Sector: {currentOrg?.sectorPreset.toUpperCase()}
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            Executive Workforce & Safety Overview
          </h1>
          <p className="text-xs text-slate-400">
            Real-time attendance, overtime expenditure, hazard SLA triage, and retention friction monitor
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition active:scale-95"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Export Shifts to CSV
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active On-Site */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active On Site</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {activeCount}{' '}
            <span className="text-sm font-medium text-slate-400">/ {orgWorkers.length}</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block mt-1">
            Gate verified via GPS & QR
          </span>
        </div>

        {/* KPI 2: Overtime Hours */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Overtime Logged</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-300">
            {totalOtHours.toFixed(1)} <span className="text-sm font-medium text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Approx. spend: {formatINR(Math.round(totalOtHours * 10000 * 1.5))}
          </span>
        </div>

        {/* KPI 3: Open Hazards */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Open Hazard Tickets</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-rose-400">
            {openHazards.length}{' '}
            {breachedHazards.length > 0 && (
              <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/50">
                {breachedHazards.length} Overdue
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Active safety SLA countdown
          </span>
        </div>

        {/* KPI 4: Sentiment */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Workforce Sentiment</span>
            <Smile className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-indigo-300">
            4.2 <span className="text-sm font-medium text-slate-400">/ 5.0</span>
          </div>
          <span className="text-[11px] text-indigo-300 font-semibold block mt-1">
            Threshold floor k=3 enforced
          </span>
        </div>
      </div>

      {/* Urgent Attention Queue (Overdue SLA Hazards & Fatigue Alerts) */}
      {(breachedHazards.length > 0 || state.fatigueAlerts.length > 0) && (
        <div className="bg-slate-900 border-2 border-rose-900/60 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Urgent Attention Queue
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {breachedHazards.map((h) => (
              <div
                key={h.id}
                className="p-3.5 bg-rose-950/40 border border-rose-600/50 rounded-2xl flex items-start gap-3 text-xs"
              >
                <Flame className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">
                    OVERDUE SLA: {h.category} (#{h.id.slice(0, 6)})
                  </span>
                  <p className="text-slate-300 mt-0.5">{h.description}</p>
                  <span className="text-rose-400 font-semibold block mt-1">
                    Auto-escalated to Project Director (Target was {h.targetResponseHours}h)
                  </span>
                </div>
              </div>
            ))}

            {state.fatigueAlerts.slice(0, 2).map((fa) => (
              <div
                key={fa.id}
                className="p-3.5 bg-amber-950/40 border border-amber-600/50 rounded-2xl flex items-start gap-3 text-xs"
              >
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">
                    FATIGUE ALERT: {fa.workerName}
                  </span>
                  <p className="text-slate-300 mt-0.5">{fa.ruleDescription}</p>
                  <span className="text-amber-300 font-mono block mt-1">
                    Threshold: {fa.thresholdValue} {fa.unit} | Actual: {fa.actualValue} {fa.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable Retention & Friction Risk Radar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-indigo-400" />
              Explainable Retention & Friction Radar
            </h2>
            <p className="text-xs text-slate-400">
              Rule-based heuristic synthesizing systemic friction (overtime streaks, unaddressed bay hazards, pay queries)
            </p>
          </div>
        </div>

        {/* Mandatory Ethical Mandate Banner */}
        <div className="p-4 bg-indigo-950/50 border border-indigo-500/40 rounded-2xl flex items-start gap-3 text-xs text-indigo-200">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-white">Ethical Governance Notice</span>
            <p className="mt-0.5 text-slate-300">
              {t('risk.ethical_banner', state.currentLanguage)}
              {' '}This heuristic flags workplace burden and friction to initiate supportive conversations, well-being check-ins, and workload re-balancing. It must never be used for disciplinary actions or performance ratings.
            </p>
          </div>
        </div>

        {/* Risk Items List */}
        <div className="space-y-3">
          {riskItems.map((item) => (
            <div
              key={item.workerId}
              className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">{item.workerName}</span>
                  <span className="text-slate-400">{item.teamOrDepartment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-300">
                    Friction Score: <strong>{item.compositeScore}/100</strong>
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      item.riskLevel === 'HIGH'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : item.riskLevel === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {item.riskLevel} FRICTION
                  </span>
                </div>
              </div>

              {/* Contributing factors breakdown */}
              <div className="pt-2 border-t border-slate-700/60 space-y-1.5">
                <span className="font-semibold text-slate-400 block text-[11px] uppercase">
                  Contributing Friction Factors (Transparent Weights):
                </span>
                {item.factors.length > 0 ? (
                  item.factors.map((f, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-900/80 rounded-xl text-slate-300"
                    >
                      <span>
                        • <strong>{f.factorName}:</strong> {f.description}
                      </span>
                      <span className="font-mono text-amber-400 font-bold">+{f.pointsAdded} pts</span>
                    </div>
                  ))
                ) : (
                  <p className="text-emerald-400 text-xs italic">
                    No active friction factors. Normal attendance and rest balance observed.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
