/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { t, formatINR } from '../i18n/index.ts';
import { speakText, stopSpeaking } from '../utils/speech.ts';
import { PayQueryModal } from './PayQueryModal.tsx';
import {
  Wallet,
  Volume2,
  VolumeX,
  Lock,
  HelpCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';

interface WorkerPayslipProps {
  state: AppState;
}

export const WorkerPayslip: React.FC<WorkerPayslipProps> = ({ state }) => {
  const currentWorker = state.workers.find((w) => w.id === state.currentUserId);
  const payslip = state.payslips.find((p) => p.workerId === state.currentUserId) || state.payslips[0];
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState<boolean>(false);

  const workerQueries = state.payQueries.filter((q) => q.workerId === state.currentUserId);

  const handleReadAloud = () => {
    if (isPlayingVoice) {
      stopSpeaking();
      setIsPlayingVoice(false);
      return;
    }

    const netFormatted = formatINR(payslip.netPaise);
    const regHours = payslip.regularHoursTotal;
    const otHours = payslip.overtimeHoursTotal;

    const speechText =
      state.currentLanguage === 'ta'
        ? `உங்கள் நிகர ஊதியம் ${netFormatted}. நீங்கள் ${regHours} மணிநேரம் வழக்கமான பணியும், ${otHours} மணிநேரம் கூடுதல் பணியும் செய்துள்ளீர்கள்.`
        : state.currentLanguage === 'hi'
        ? `आपका शुद्ध वेतन ${netFormatted} है। आपने ${regHours} नियमित घंटे और ${otHours} अतिरिक्त घंटे काम किया है।`
        : `Your take home pay is ${netFormatted}. You worked ${regHours} regular hours and ${otHours} overtime hours.`;

    setIsPlayingVoice(true);
    speakText(speechText, state.currentLanguage, 0.95, () => {
      setIsPlayingVoice(false);
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Payslip Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                {payslip.payPeriodLabel}
              </span>
              {payslip.isLocked && (
                <span className="flex items-center gap-1 text-[11px] font-semibold bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 border border-slate-700">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Period Locked & Audited
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {currentWorker?.fullName}
            </h1>
            <p className="text-xs text-slate-400">
              Rule Version: <span className="font-mono text-emerald-300">{payslip.ruleVersion}</span>
            </p>
          </div>

          {/* Voice Readout Button */}
          <button
            onClick={handleReadAloud}
            className={`px-4 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 transition shadow-md active:scale-95 ${
              isPlayingVoice
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isPlayingVoice ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingVoice ? 'Stop Speaking' : t('action.listen', state.currentLanguage)}</span>
          </button>
        </div>

        {/* Take Home Highlight */}
        <div className="my-6 p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-2 border-emerald-500/80 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              {t('payslip.net_pay', state.currentLanguage)}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
              {formatINR(payslip.netPaise)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct deposit into bank minor-unit ledger
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-8 h-8" />
          </div>
        </div>

        {/* Summary Hours Statistics */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <span className="text-xs text-slate-400 block">{t('payslip.regular_hours', state.currentLanguage)}</span>
            <span className="text-xl font-black text-white">{payslip.regularHoursTotal.toFixed(1)} hrs</span>
          </div>
          <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
            <span className="text-xs text-amber-400 font-semibold block">{t('payslip.overtime_hours', state.currentLanguage)}</span>
            <span className="text-xl font-black text-amber-300">{payslip.overtimeHoursTotal.toFixed(1)} hrs</span>
          </div>
        </div>

        {/* Transparent Formula Step-by-Step Breakdown */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {t('payslip.formula_explanation', state.currentLanguage)}
          </h2>

          <div className="space-y-2">
            {payslip.lineItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-200 block text-sm">
                    {idx + 1}. {t(item.labelKey, state.currentLanguage, item.labelKey)}
                  </span>
                  {item.hours && item.ratePaise ? (
                    <span className="text-slate-400">
                      {item.hours.toFixed(1)} hrs × {formatINR(item.ratePaise)}/hr
                    </span>
                  ) : null}
                </div>
                <div
                  className={`text-sm font-black ${
                    item.amountPaise < 0 ? 'text-rose-400' : 'text-emerald-300'
                  }`}
                >
                  {item.amountPaise < 0 ? `- ${formatINR(Math.abs(item.amountPaise))}` : `+ ${formatINR(item.amountPaise)}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Query Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">Notice an issue with hours or deductions?</p>
          <button
            onClick={() => setIsQueryModalOpen(true)}
            className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {t('action.raise_query', state.currentLanguage)}
          </button>
        </div>
      </div>

      {/* Pay Inquiries / Dispute Status History */}
      {workerQueries.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-3">Your Pay Inquiries & Resolutions</h2>
          <div className="space-y-3">
            {workerQueries.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white capitalize">{q.queryType.replace('_', ' ')}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      q.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
                <p className="text-slate-300 italic">"{q.message}"</p>
                {q.resolutionNote && (
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 text-emerald-300">
                    <span className="font-bold block">Supervisor Resolution:</span>
                    <span>{q.resolutionNote}</span>
                    {q.adjustmentPaise ? (
                      <span className="font-black block mt-1">
                        Adjustment Credited: +{formatINR(q.adjustmentPaise)}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <PayQueryModal
        state={state}
        payslipId={payslip.id}
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
      />
    </div>
  );
};
