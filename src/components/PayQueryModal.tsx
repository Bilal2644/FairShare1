/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { PayQuery } from '../types/index.ts';
import { HelpCircle, Send, X, Mic, CheckCircle } from 'lucide-react';

interface PayQueryModalProps {
  state: AppState;
  payslipId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PayQueryModal: React.FC<PayQueryModalProps> = ({
  state,
  payslipId,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [queryType, setQueryType] = useState<PayQuery['queryType']>('missing_overtime');
  const [message, setMessage] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    store.submitPayQuery({
      payslipId,
      queryType,
      message,
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Ask a Question About Pay</h2>
            <p className="text-xs text-slate-400">Direct, safe query channel to site supervisor</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Inquiry Submitted</h3>
            <p className="text-xs text-slate-300">
              Your inquiry has been logged in the supervisor's Pay Queue with an SLA target.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Issue Type
              </label>
              <select
                value={queryType}
                onChange={(e) => setQueryType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm"
              >
                <option value="missing_overtime">Missing Overtime Hours</option>
                <option value="rate_dispute">Base Wage Rate Dispute</option>
                <option value="deduction_query">Unrecognized Deduction</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">
                Explanation / Details
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. On Thursday night pouring shift, I worked until 06:00 AM, but only 1h overtime was counted..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm placeholder:text-slate-500"
                required
              />
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center gap-2 text-xs text-slate-400">
              <Mic className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Voice Note simulator: Audio attached automatically if recorded.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
            >
              <Send className="w-4 h-4" />
              Submit Query to Payroll Team
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
