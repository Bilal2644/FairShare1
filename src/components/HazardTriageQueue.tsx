/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { HazardReport } from '../types/index.ts';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Flame,
  Shield,
  ArrowRight,
} from 'lucide-react';

interface HazardTriageQueueProps {
  state: AppState;
}

export const HazardTriageQueue: React.FC<HazardTriageQueueProps> = ({ state }) => {
  const hazards = state.hazards.filter((h) => h.orgId === state.currentOrgId);
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});

  const handleUpdateStatus = (
    hazardId: string,
    status: HazardReport['status']
  ) => {
    store.updateHazardStatus(hazardId, status, resolutionNotes[hazardId]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-white">Hazard & Safety Triage Queue</h1>
        <p className="text-xs text-slate-400 mt-1">
          Automated SLA monitoring, escalation ladder for breached targets, and verified rectification log
        </p>
      </div>

      <div className="space-y-4">
        {hazards.map((h) => {
          const isBreached = h.status === 'ESCALATED';
          return (
            <div
              key={h.id}
              className={`p-5 rounded-3xl border transition shadow-lg ${
                isBreached
                  ? 'bg-rose-950/30 border-rose-600/80'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      h.severity === 'CRITICAL'
                        ? 'bg-rose-600 text-white'
                        : h.severity === 'HIGH'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {h.severity}
                  </span>
                  <h2 className="text-base font-bold text-white">{h.category}</h2>
                  <span className="text-xs text-slate-400">#{h.id.slice(0, 6)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      h.status === 'ESCALATED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500 animate-pulse'
                        : h.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>
              </div>

              <div className="py-3 text-xs text-slate-300 space-y-1">
                <p className="text-sm font-medium text-white">{h.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-slate-400 pt-1">
                  <span>Reporter: <strong>{h.reporterName}</strong></span>
                  <span>Target SLA: <strong>{h.targetResponseHours}h</strong></span>
                  <span>Created: {new Date(h.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {isBreached && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-rose-300 text-xs font-semibold flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>
                    SLA Breached! Ticket automatically escalated to Executive Project Director. Immediate site inspection required.
                  </span>
                </div>
              )}

              {/* Status transition controls */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <input
                  type="text"
                  placeholder="Enter resolution notes (e.g. Scaffolding clamp bolted and re-certified)..."
                  value={resolutionNotes[h.id] || ''}
                  onChange={(e) =>
                    setResolutionNotes({ ...resolutionNotes, [h.id]: e.target.value })
                  }
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white placeholder:text-slate-500 text-xs"
                />

                <div className="flex items-center gap-2">
                  {h.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleUpdateStatus(h.id, 'INSPECTING')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl"
                    >
                      Start Inspection
                    </button>
                  )}
                  {(h.status === 'INSPECTING' || h.status === 'ESCALATED') && (
                    <button
                      onClick={() => handleUpdateStatus(h.id, 'RECTIFYING')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                    >
                      Rectification in Progress
                    </button>
                  )}
                  {h.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(h.id, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Safe & Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
