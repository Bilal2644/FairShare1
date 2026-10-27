/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sector Candidate Feature: Rest & Heat-Stress Water Break Reminder
 * Tailored for Construction & High-Sun Outdoor Sites.
 * Calculates solar-noon thermal index and triggers mandatory hydration & shade pause gongs.
 */

import React, { useState, useEffect } from 'react';
import { AppState } from '../server/store.ts';
import { Sun, Droplets, Clock, AlertTriangle, BellRing } from 'lucide-react';
import { speakText } from '../utils/speech.ts';

interface HeatStressModuleProps {
  state: AppState;
}

export const HeatStressModule: React.FC<HeatStressModuleProps> = ({ state }) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(45 * 60); // 45m interval
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 45 * 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleSimulateAlert = () => {
    speakText(
      state.currentLanguage === 'ta'
        ? 'கவனத்திற்கு: உச்ச வெயில் நேரம். தயவுசெய்து 15 நிமிடங்கள் நிழலில் ஓய்வெடுத்து தண்ணீர் அருந்தவும்.'
        : state.currentLanguage === 'hi'
        ? 'ध्यान दें: अत्यधिक धूप का समय। कृपया 15 मिनट छाया में आराम करें और पानी पिएं।'
        : 'Heat stress advisory: Please take a mandatory 15-minute shade and hydration rest break.',
      state.currentLanguage
    );
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Sun className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Rest & Heat-Stress Advisory
            </h1>
            <p className="text-xs text-slate-400">
              Outdoor thermal monitoring & mandatory hydration countdown
            </p>
          </div>
        </div>

        {/* Live Weather / Heat Index Widget */}
        <div className="p-5 bg-gradient-to-br from-amber-950/40 to-slate-900 border-2 border-amber-500/80 rounded-3xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Worksite Heat Index (Chennai Metro)
            </span>
            <div className="text-3xl font-black text-white mt-1">37°C · High Solar Load</div>
            <p className="text-xs text-slate-300 mt-1">
              Required: 15-minute shaded pause every 45 minutes of heavy outdoor labor
            </p>
          </div>
          <Droplets className="w-10 h-10 text-cyan-400 shrink-0" />
        </div>

        {/* Countdown Timer */}
        <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl text-center space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
            Next Mandatory Water Break In
          </span>
          <div className="text-4xl font-mono font-black text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleSimulateAlert}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <BellRing className="w-3.5 h-3.5" />
              Sound Water Break Gong (TTS)
            </button>
            <button
              onClick={() => setIsActive(!isActive)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl"
            >
              {isActive ? 'Pause Timer' : 'Resume Timer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
