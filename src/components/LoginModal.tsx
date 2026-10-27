/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { store, AppState } from '../server/store.ts';
import { WorkerProfile, Role } from '../types/index.ts';
import { Users, Lock, KeyRound, Shield, CheckCircle, X } from 'lucide-react';

interface LoginModalProps {
  state: AppState;
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ state, isOpen, onClose }) => {
  if (!isOpen) return null;

  const currentOrgWorkers = state.workers.filter((w) => w.orgId === state.currentOrgId);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(state.currentUserId);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedWorker = state.workers.find((w) => w.id === selectedWorkerId);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    if (enteredPin !== selectedWorker.pin) {
      setErrorMessage(`Incorrect PIN. (Hint for demo: ${selectedWorker.pin})`);
      return;
    }

    store.setCurrentUser(selectedWorker.id);
    onClose();
  };

  const handleQuickSwitch = (worker: WorkerProfile) => {
    store.setCurrentUser(worker.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Switch Account / Role</h2>
            <p className="text-xs text-slate-400">Low-literacy PIN login & Instant Demo Profile Selection</p>
          </div>
        </div>

        {/* Quick Demo Switcher Grid */}
        <div className="my-4">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            1-Click Demo Profiles ({state.currentOrgId === 'org_metro_infra' ? 'Construction' : 'College'})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {currentOrgWorkers.map((w) => {
              const isCurrent = w.id === state.currentUserId;
              return (
                <button
                  key={w.id}
                  onClick={() => handleQuickSwitch(w)}
                  className={`p-2.5 rounded-xl text-left border flex flex-col justify-between transition ${
                    isCurrent
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{w.fullName}</span>
                    {isCurrent && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                    <span className="capitalize text-emerald-300 font-medium">{w.role.replace('_', ' ')}</span>
                    <span className="font-mono text-[11px] bg-slate-900 px-1 rounded">PIN: {w.pin}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual PIN pad for mobile worker simulation */}
        <div className="pt-3 border-t border-slate-800">
          <p className="text-xs text-slate-400 mb-2">
            Simulate Worker Physical Badge / 4-Digit PIN Authentication:
          </p>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="flex gap-2">
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white flex-1"
              >
                {currentOrgWorkers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.workerCode} - {w.fullName} ({w.role})
                  </option>
                ))}
              </select>
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="4-digit PIN"
                className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white text-center font-mono tracking-widest"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 font-medium">{errorMessage}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <KeyRound className="w-4 h-4" />
              Authenticate & Launch Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
