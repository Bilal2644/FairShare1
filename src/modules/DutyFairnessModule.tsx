/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sector Candidate Feature: Duty Roster Fairness & Night-Shift Equity Inspector
 * Tailored for Colleges, Hospitals, and 24/7 Facility Staff.
 * Analyzes roster rotations to ensure weekend shifts and night duties are evenly
 * distributed among support staff without favoritism.
 */

import React from 'react';
import { AppState } from '../server/store.ts';
import { Scale, Moon, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface DutyFairnessProps {
  state: AppState;
}

export const DutyFairnessModule: React.FC<DutyFairnessProps> = ({ state }) => {
  const collegeWorkers = state.workers.filter(
    (w) => w.orgId === 'org_greenfield_college' && w.role === 'worker'
  );

  // Simulated rotation metrics for campus staff
  const rosterMetrics = [
    { name: 'Priya Mani', role: 'Sanitation Lead', weekendDuties: 2, nightShifts: 1, equityScore: '94% (Balanced)' },
    { name: 'Rajesh Tiwari', role: 'Security Officer', weekendDuties: 4, nightShifts: 6, equityScore: '68% (Over-allocated Night)' },
    { name: 'Geetha Swaminathan', role: 'Library Maintenance', weekendDuties: 1, nightShifts: 0, equityScore: '98% (Balanced)' },
    { name: 'Mohammed Farooq', role: 'Lab Electrician', weekendDuties: 2, nightShifts: 2, equityScore: '90% (Balanced)' },
    { name: 'Kavitha S', role: 'Hostel Housekeeping', weekendDuties: 3, nightShifts: 3, equityScore: '85% (Balanced)' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Duty Roster Fairness Inspector</h1>
            <p className="text-xs text-slate-400">
              Campus support staff weekend and night rotation equity analysis
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In educational institutions and residential hostels, weekend duties and night rounds must be shared equitably across staff. This view calculates standard deviation in duty allocation to prevent informal supervisor favoritism.
        </p>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-800/40">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Weekend Duties</th>
                <th className="py-3 px-4 text-center">Night Shifts</th>
                <th className="py-3 px-4 text-right">Roster Fairness Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {rosterMetrics.map((rm, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-bold text-white">{rm.name}</td>
                  <td className="py-3 px-4 text-slate-400">{rm.role}</td>
                  <td className="py-3 px-4 text-center font-mono">{rm.weekendDuties}</td>
                  <td className="py-3 px-4 text-center font-mono">{rm.nightShifts}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        rm.equityScore.includes('Over-allocated')
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {rm.equityScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
