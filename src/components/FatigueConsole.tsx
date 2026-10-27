/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { store, AppState } from '../server/store.ts';
import { Clock, ShieldAlert, CheckCircle2, Moon, AlertTriangle } from 'lucide-react';

interface FatigueConsoleProps {
  state: AppState;
}

export const FatigueConsole: React.FC<FatigueConsoleProps> = ({ state }) => {
  const alerts = state.fatigueAlerts.filter((a) => a.orgId === state.currentOrgId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-white">Fatigue & Overwork Prevention Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configurable health thresholds: max daily hours, minimum turnaround rest, and consecutive days worked
        </p>
      </div>

      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{alert.workerName}</h2>
                    <span className="text-[11px] text-slate-400 font-mono">Shift ID: #{alert.shiftId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-amber-300 bg-slate-800 px-2.5 py-1 rounded-xl">
                    {alert.ruleId}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
                <span className="font-bold text-slate-200 block">{alert.ruleDescription}</span>
                <p className="text-slate-300">
                  Threshold limit: <strong>{alert.thresholdValue} {alert.unit}</strong> | Actual value logged: <strong className="text-rose-400">{alert.actualValue} {alert.unit}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 text-slate-400 text-[11px]">
                <span>Logged at: {new Date(alert.createdAt).toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Snoozed alert for 4 hours')}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-semibold"
                  >
                    Snooze 4h
                  </button>
                  <button
                    onClick={() => alert('Acknowledged by supervisor. Supportive check-in scheduled.')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
                  >
                    Acknowledge & Schedule Rest
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 bg-slate-900 border border-slate-800 rounded-3xl text-center text-slate-400 text-xs">
            No active fatigue or overwork threshold alerts.
          </div>
        )}
      </div>
    </div>
  );
};
