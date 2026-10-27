/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { ShiftRecord } from '../types/index.ts';
import {
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface SupervisorRosterProps {
  state: AppState;
}

export const SupervisorRoster: React.FC<SupervisorRosterProps> = ({ state }) => {
  const currentOrg = state.orgs.find((o) => o.id === state.currentOrgId);
  const currentSite = state.sites.find((s) => s.orgId === state.currentOrgId) || state.sites[0];
  const [searchTerm, setSearchTerm] = useState<string>('');

  const orgShifts = state.shifts.filter((s) => s.orgId === state.currentOrgId);
  const activeShifts = orgShifts.filter((s) => s.status === 'IN_PROGRESS');

  const filteredActive = activeShifts.filter((s) => {
    const worker = state.workers.find((w) => w.id === s.workerId);
    return (
      worker?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker?.workerCode.includes(searchTerm) ||
      worker?.designation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
            {currentSite.name}
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            Real-Time Attendance Roster
          </h1>
          <p className="text-xs text-slate-400">
            Current on-site headcount, check-in method, and geofence verification status
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search worker or role..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Active On-Site Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Currently On Duty ({filteredActive.length} workers)
          </h2>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            Live Gate Stream
          </span>
        </div>

        {filteredActive.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-800/40">
                <tr>
                  <th className="py-3 px-4">Worker</th>
                  <th className="py-3 px-4">Role / Team</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Geofence</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredActive.map((shift) => {
                  const worker = state.workers.find((w) => w.id === shift.workerId);
                  return (
                    <tr key={shift.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white">
                        {worker?.fullName} (#{worker?.workerCode})
                      </td>
                      <td className="py-3 px-4 text-slate-400">{worker?.designation}</td>
                      <td className="py-3 px-4 font-mono text-emerald-300">
                        {new Date(shift.startTimeUtc).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 uppercase text-[10px] text-slate-300 font-mono">
                          {shift.checkInMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Within Gate
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => store.checkOut(shift.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold"
                        >
                          Manual Check-Out
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No workers currently clocked in.
          </div>
        )}
      </div>
    </div>
  );
};
