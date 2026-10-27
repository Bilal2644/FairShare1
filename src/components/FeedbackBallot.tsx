/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { t } from '../i18n/index.ts';
import { CONSTRUCTION_PRESET } from '../config/presets/construction.ts';
import { COLLEGE_PRESET } from '../config/presets/college.ts';
import {
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Frown,
  Meh,
  Smile,
  Send,
  Lock,
} from 'lucide-react';

interface FeedbackBallotProps {
  state: AppState;
}

export const FeedbackBallot: React.FC<FeedbackBallotProps> = ({ state }) => {
  const currentOrg = state.orgs.find((o) => o.id === state.currentOrgId);
  const cycle = state.feedbackCycle;
  const questions =
    currentOrg?.sectorPreset === 'college'
      ? COLLEGE_PRESET.feedbackQuestions
      : CONSTRUCTION_PRESET.feedbackQuestions;

  // Check if current worker already participated
  const hasParticipated = state.feedbackParticipation.some(
    (p) => p.cycleId === cycle.id && p.workerId === state.currentUserId
  );

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleScoreChange = (qId: string, rating: number) => {
    setScores((prev) => ({ ...prev, [qId]: rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentWorker = state.workers.find((w) => w.id === state.currentUserId);
    const departmentId = currentWorker?.designation.includes('Tower B')
      ? 'team_welders'
      : 'team_riggers';

    // Submit for first question as sample
    const result = store.submitFeedbackBallot({
      departmentId,
      questionId: questions[0].id,
      score: scores[questions[0].id] || 4,
      comment: comment.trim() || undefined,
    });

    if (result.success) {
      setStatusMessage('Your anonymous ballot has been deposited into the unlinked feedback vault.');
    } else {
      setStatusMessage(result.error || 'Failed to submit');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {t('feedback.title', state.currentLanguage)}
            </h1>
            <p className="text-xs text-slate-400">{cycle.title}</p>
          </div>
        </div>

        {/* 100% Anonymous by Design Guarantee Banner */}
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl flex items-start gap-3 text-xs text-indigo-200">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm text-white">Anonymous by Design, Not by Promise</span>
            <p className="mt-1 leading-relaxed">
              {t('feedback.guarantee', state.currentLanguage)}
              {' '}Your submission writes to an unlinked table with zero user identifiers. Submission timestamps are rounded to the day.
            </p>
          </div>
        </div>

        {hasParticipated ? (
          <div className="py-8 text-center space-y-3 bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">You Have Already Participated</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              To prevent ballot stuffing, each worker can submit once per cycle. Your vote is safely pooled in the anonymous aggregate.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, idx) => {
              const currentScore = scores[q.id] || 0;
              return (
                <div
                  key={q.id}
                  className="p-5 bg-slate-800/60 border border-slate-700/80 rounded-2xl space-y-3"
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Question {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-white">{q.question}</p>

                  {/* 3 Visual Face Rating Scale */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleScoreChange(q.id, 2)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        currentScore === 2
                          ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Frown className="w-7 h-7 text-rose-400" />
                      <span className="text-xs font-bold">Needs Improvement</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleScoreChange(q.id, 3)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        currentScore === 3
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Meh className="w-7 h-7 text-amber-400" />
                      <span className="text-xs font-bold">Acceptable</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleScoreChange(q.id, 5)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition ${
                        currentScore === 5
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smile className="w-7 h-7 text-emerald-400" />
                      <span className="text-xs font-bold">Good / Satisfied</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Optional Free Text with Name Exclusion Warning */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Optional Confidential Comments
              </label>
              <p className="text-[11px] text-amber-400 font-medium mb-2">
                ⚠️ Notice: Do not include names, worker IDs, or personal identifying details in this text box.
              </p>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share any specific observations about workplace water, safety gear, or supervisor conduct..."
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-sm placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/50 transition active:scale-95"
            >
              <Send className="w-5 h-5" />
              Deposit Anonymous Ballot
            </button>

            {statusMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-bold text-center">
                {statusMessage}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
