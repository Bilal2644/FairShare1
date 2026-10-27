/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Dynamic Settings Registry Editor & Simulate-Before-Apply Center
 * Generated directly from SETTINGS_REGISTRY single source of truth.
 * Includes live dry-run simulation of pay multiplier changes across 30 days of shifts.
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { SETTINGS_REGISTRY, RegistryItem, validateSetting } from '../config/registry.ts';
import { formatINR } from '../i18n/index.ts';
import {
  Settings,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  History,
  Lock,
} from 'lucide-react';

interface AdminSettingsProps {
  state: AppState;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ state }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('pay');
  const [simulationModalOpen, setSimulationModalOpen] = useState<boolean>(false);
  const [simulationKey, setSimulationKey] = useState<string>('pay.overtime_multiplier');
  const [simulationValue, setSimulationValue] = useState<number>(2.0);
  const [simulationReason, setSimulationReason] = useState<string>('Union collective bargaining adjustment');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const categories = [
    { id: 'pay', label: 'Pay & Overtime Rules' },
    { id: 'attendance', label: 'Shifts & Geofence' },
    { id: 'fatigue', label: 'Fatigue Thresholds' },
    { id: 'safety', label: 'Safety & SLAs' },
    { id: 'feedback', label: 'Anonymous Voice' },
    { id: 'roles', label: 'Roles & Access' },
    { id: 'identity', label: 'Identity & Terminology' },
  ];

  const categoryEntries = Object.values(SETTINGS_REGISTRY).filter(
    (item) => item.feature === selectedCategory
  );

  const handleUpdate = (key: string, value: any) => {
    const res = store.updateSetting(key, value, 'Updated via Settings Registry Editor');
    if (res.success) {
      setFeedbackNotice({ type: 'success', msg: `Setting "${key}" updated live and audit logged.` });
    } else {
      setFeedbackNotice({ type: 'error', msg: res.error || 'Failed to update' });
    }
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const simResult = store.simulateSettingChange(simulationKey, simulationValue);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
            Single Source of Truth
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            Settings Registry & Configuration Center
          </h1>
          <p className="text-xs text-slate-400">
            Rules, thresholds, and workflows update live without code editing. Enforces 7 inviolable locked principles.
          </p>
        </div>

        <button
          onClick={() => setSimulationModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-950/40 transition active:scale-95"
        >
          <Play className="w-4 h-4 text-emerald-400" />
          Simulate Impact Before Apply
        </button>
      </div>

      {feedbackNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500 text-rose-300'
          }`}
        >
          {feedbackNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedbackNotice.msg}</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dynamic Registry Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="space-y-4">
          {categoryEntries.map((item) => {
            const currentValue = store.getEffectiveSetting(item.key);
            return (
              <div
                key={item.key}
                className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{item.key}</span>
                      {item.isLockedPrinciple && (
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3 text-amber-400" />
                          Locked Principle (Hard Floor $k \ge 3$)
                        </span>
                      )}
                    </div>
                    <span className="text-slate-400">
                      Scope: <strong className="text-slate-300 capitalize">{item.scope}</strong> | Risk:{' '}
                      <strong
                        className={
                          item.riskLevel === 'high'
                            ? 'text-rose-400'
                            : item.riskLevel === 'medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {item.riskLevel.toUpperCase()}
                      </strong>
                    </span>
                  </div>

                  {/* Input field based on type */}
                  <div className="flex items-center gap-2">
                    {item.type === 'number' && (
                      <input
                        type="number"
                        step={item.key.includes('multiplier') ? '0.25' : '1'}
                        value={currentValue !== undefined ? currentValue : item.default}
                        onChange={(e) => handleUpdate(item.key, Number(e.target.value))}
                        className="w-28 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-xs text-right"
                      />
                    )}

                    {item.type === 'boolean' && (
                      <button
                        onClick={() => handleUpdate(item.key, !currentValue)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                          currentValue
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {currentValue ? 'ENABLED' : 'DISABLED'}
                      </button>
                    )}

                    {item.type === 'select' && item.allowedRange?.options && (
                      <select
                        value={currentValue || item.default}
                        onChange={(e) => handleUpdate(item.key, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                      >
                        {item.allowedRange.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {item.allowedRange && (
                  <p className="text-[11px] text-slate-400">
                    Allowed range: min {item.allowedRange.min ?? 'none'}, max {item.allowedRange.max ?? 'none'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Audit Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          Immutable Configuration Change Audit Log
        </h2>

        <div className="space-y-2">
          {state.auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-200 block">{log.settingKey}</span>
                <span className="text-slate-400 text-[11px]">
                  Changed by User #{log.changedByUserId} · Reason: {log.reason}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono text-emerald-400 font-bold">
                  {JSON.stringify(log.oldValue)} → {JSON.stringify(log.newValue)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(log.timestampUtc).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simulate Before Apply Modal */}
      {simulationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Simulate Live Impact (Dry-Run Replay)
            </h2>
            <p className="text-xs text-slate-400">
              Replays past 30 days of logged shift records to calculate the exact financial and workforce impact before applying configuration changes live.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Setting</label>
                <input
                  type="text"
                  value={simulationKey}
                  disabled
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proposed Multiplier Value</label>
                <input
                  type="number"
                  step="0.25"
                  value={simulationValue}
                  onChange={(e) => setSimulationValue(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Justification</label>
                <input
                  type="text"
                  value={simulationReason}
                  onChange={(e) => setSimulationReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Simulation Results Box */}
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-2 mt-4">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  30-Day Historical Replay Impact:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block">Impacted Workers:</span>
                    <span className="font-bold text-white text-base">
                      {simResult.impactedWorkersCount} workers
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Payroll Spend Delta:</span>
                    <span
                      className={`font-bold text-base ${
                        simResult.payrollCostDiffPaise > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {simResult.payrollCostDiffPaise >= 0 ? '+' : ''}
                      {formatINR(simResult.payrollCostDiffPaise)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSimulationModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdate(simulationKey, simulationValue);
                  setSimulationModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white"
              >
                Apply Live & Broadcast Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
