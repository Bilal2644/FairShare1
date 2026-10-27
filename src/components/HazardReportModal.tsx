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
  AlertTriangle,
  Camera,
  Mic,
  Shield,
  ShieldOff,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HazardReportModalProps {
  state: AppState;
}

export const HazardReportModal: React.FC<HazardReportModalProps> = ({ state }) => {
  const currentOrg = state.orgs.find((o) => o.id === state.currentOrgId);
  const categories =
    currentOrg?.sectorPreset === 'college'
      ? COLLEGE_PRESET.hazardCategories
      : CONSTRUCTION_PRESET.hazardCategories;

  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0].label);
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [description, setDescription] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [photoAttached, setPhotoAttached] = useState<boolean>(false);
  const [audioAttached, setAudioAttached] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const report = store.submitHazard({
      category: selectedCategory,
      severity,
      description,
      isAnonymous,
      photoUrl: photoAttached ? 'data:image/jpeg;base64,simulated_clean_exif_image' : undefined,
    });

    setSubmittedMessage(
      `Hazard #${report.id.slice(0, 6)} reported. Target SLA inspection within ${report.targetResponseHours} hours.`
    );
    setDescription('');
    setPhotoAttached(false);
    setAudioAttached(false);

    setTimeout(() => {
      setSubmittedMessage(null);
    }, 4000);
  };

  // Recent reports for current org/user to view pictorial timeline
  const reports = state.hazards.filter((h) => h.orgId === state.currentOrgId).slice(0, 4);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Hazard Submission Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              {t('nav.safety', state.currentLanguage)}
            </h1>
            <p className="text-xs text-slate-400">
              Voice, text, or photo incident reporting with guaranteed anonymity protection
            </p>
          </div>
        </div>

        {submittedMessage && (
          <div className="mb-4 p-4 bg-emerald-950/60 border border-emerald-500 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{submittedMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Visual Category Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Step 1: Select Hazard Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`p-3 rounded-2xl text-left border text-xs font-semibold flex flex-col justify-between transition ${
                    selectedCategory === cat.label
                      ? 'bg-rose-950/60 border-rose-500 text-white shadow'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 mb-1" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Severity Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Severity Level (Affects Response SLA)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 px-1 text-center rounded-xl font-bold text-xs uppercase border transition ${
                    severity === lvl
                      ? lvl === 'CRITICAL'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : lvl === 'HIGH'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Description & Media Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Step 2: Describe Unsafe Condition
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Scaffolding clamp loose on Pier 4 level 3, swinging in the wind..."
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-sm placeholder:text-slate-500"
              required
            />

            {/* Media Toggles */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                onClick={() => setPhotoAttached(!photoAttached)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                  photoAttached
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                {photoAttached ? '✓ Photo Attached (EXIF Stripped)' : 'Attach Photo'}
              </button>
              <button
                type="button"
                onClick={() => setAudioAttached(!audioAttached)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition ${
                  audioAttached
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                {audioAttached ? '✓ 15s Voice Note Attached' : 'Record Voice Note'}
              </button>
            </div>
          </div>

          {/* Step 3: Identity Option (Anonymous vs Named) */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Step 3: Identity Protection
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`flex-1 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition ${
                  isAnonymous
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Keep Anonymous (No name stored)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`flex-1 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition ${
                  !isAnonymous
                    ? 'bg-indigo-950/60 border-indigo-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <ShieldOff className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Include My Name</span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-xl shadow-rose-950/50 transition active:scale-95"
          >
            <Send className="w-5 h-5" />
            Submit Safety Report
          </button>
        </form>
      </div>

      {/* Pictorial Status Timeline for Recent Hazards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          Recent Safety Incident Status & SLA Tracking
        </h2>

        <div className="space-y-4">
          {reports.map((rep) => {
            const isBreached = rep.status === 'ESCALATED';
            return (
              <div
                key={rep.id}
                className="p-4 bg-slate-800/60 border border-slate-700 rounded-2xl space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-sm block">{rep.category}</span>
                    <span className="text-slate-400">Reporter: {rep.reporterName}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                      rep.status === 'ESCALATED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                        : rep.status === 'RESOLVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {rep.status}
                  </span>
                </div>

                <p className="text-slate-300">{rep.description}</p>

                {/* Pictorial Timeline (Circle -> Diamond -> Square -> Checkmark) */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-emerald-400">● Submitted</span>
                  <span>→</span>
                  <span className={rep.status !== 'SUBMITTED' ? 'font-medium text-emerald-400' : ''}>◆ Inspecting</span>
                  <span>→</span>
                  <span className={rep.status === 'RECTIFYING' || rep.status === 'RESOLVED' ? 'font-medium text-emerald-400' : ''}>■ Rectifying</span>
                  <span>→</span>
                  <span className={rep.status === 'RESOLVED' ? 'font-bold text-emerald-400' : ''}>✔ Resolved</span>
                </div>

                {isBreached && (
                  <div className="p-2 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>SLA breach: Target {rep.targetResponseHours}h response exceeded. Escalated to Project Director.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
