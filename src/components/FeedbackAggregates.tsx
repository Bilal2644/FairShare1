/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { aggregateFeedbackScores, checkDifferencingSafety } from '../engines/anonymity.ts';
import {
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Smile,
  Frown,
  Meh,
  Users,
  Lock,
} from 'lucide-react';

interface FeedbackAggregatesProps {
  state: AppState;
}

export const FeedbackAggregates: React.FC<FeedbackAggregatesProps> = ({ state }) => {
  const [selectedDept, setSelectedDept] = useState<string>('team_welders');
  const floor = store.getEffectiveSetting<number>('feedback.anonymity_threshold_floor') || 5;

  const result = aggregateFeedbackScores(state.feedbackResponses, selectedDept, floor);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
          Anonymous Sentiment Vault
        </span>
        <h1 className="text-2xl font-black text-white mt-1">
          Workforce Feedback Aggregates
        </h1>
        <p className="text-xs text-slate-400">
          Enforces mathematical small-cell suppression ($k \ge 3$) and differencing attack protection
        </p>
      </div>

      {/* Department Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedDept('team_welders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            selectedDept === 'team_welders'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Tower B Welders (8 Responses - Sample Above Floor)
        </button>
        <button
          onClick={() => setSelectedDept('team_riggers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            selectedDept === 'team_riggers'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Pier 4 Riggers (2 Responses - Under Threshold Floor)
        </button>
      </div>

      {/* Aggregate Results Card or Suppression Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white capitalize">
              {selectedDept.replace('_', ' ')}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Active Anonymity Floor: <strong className="text-white">k = {floor}</strong>
          </span>
        </div>

        {result.isSuppressed ? (
          /* Small-Cell Suppression Demonstration */
          <div className="p-8 bg-rose-950/30 border-2 border-rose-500/60 rounded-3xl text-center space-y-3">
            <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Aggregates Suppressed for Privacy</h3>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              {result.suppressionReason}
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto pt-2">
              <strong>Technical Explanation:</strong> With fewer than {floor} respondents, individual responses could be correlated to shifts or team members present. The system blocks score reveals until more workers participate.
            </p>
          </div>
        ) : (
          /* Aggregate Summary */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Average Rating</span>
                <div className="text-3xl font-black text-emerald-400 mt-1">
                  {result.averageScore} <span className="text-sm text-slate-400">/ 5.0</span>
                </div>
              </div>
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Ballots</span>
                <div className="text-3xl font-black text-white mt-1">
                  {result.totalResponsesCount}
                </div>
              </div>
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase font-semibold">Positive %</span>
                <div className="text-3xl font-black text-indigo-400 mt-1">
                  {Math.round(((result.distribution?.positiveCount || 0) / result.totalResponsesCount) * 100)}%
                </div>
              </div>
            </div>

            {/* Shuffled Anonymized Feedback Comments */}
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Scrubbed & Shuffled Worker Observations (Order Randomized)
              </h3>
              <div className="space-y-2">
                {result.sampleComments?.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-slate-300 italic"
                  >
                    "{c}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
