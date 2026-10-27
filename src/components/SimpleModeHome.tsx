/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Simple Mode Home View (Inclusive Low-Literacy Interface)
 * Presents AT MOST 4 large, high-contrast, illustrated tiles.
 * Designed for low-literacy users with >=18px typography, >=48px tap targets,
 * visual icons, color pairing, and direct audio read-aloud buttons.
 */

import React from 'react';
import { store, AppState } from '../server/store.ts';
import { t, formatINR } from '../i18n/index.ts';
import { speakText } from '../utils/speech.ts';
import {
  Clock,
  Wallet,
  AlertTriangle,
  ShieldCheck,
  Volume2,
  CheckCircle2,
  LogIn,
  LogOut,
} from 'lucide-react';

interface SimpleModeHomeProps {
  state: AppState;
  setActiveTab: (tab: string) => void;
}

export const SimpleModeHome: React.FC<SimpleModeHomeProps> = ({ state, setActiveTab }) => {
  const worker = state.workers.find((w) => w.id === state.currentUserId);
  const activeShift = state.shifts.find(
    (s) => s.workerId === state.currentUserId && s.status === 'IN_PROGRESS'
  );

  const muruganPayslip = state.payslips.find((p) => p.workerId === state.currentUserId);
  const takeHomeFormatted = muruganPayslip ? formatINR(muruganPayslip.netPaise) : '₹ 0';

  const playCheckInVoicePrompt = () => {
    const text = activeShift
      ? state.currentLanguage === 'ta'
        ? 'நீங்கள் தற்போது பணியில் உள்ளீர்கள். வெளியேற இங்கு தட்டவும்.'
        : state.currentLanguage === 'hi'
        ? 'आप वर्तमान में ड्यूटी पर हैं। चेक आउट के लिए यहाँ दबाएं।'
        : 'You are currently on duty. Tap here to check out.'
      : state.currentLanguage === 'ta'
      ? 'வருகை பதிவு செய்ய இங்கு தட்டவும்.'
      : state.currentLanguage === 'hi'
      ? 'ड्यूटी शुरू करने और चेक इन के लिए यहाँ दबाएं।'
      : 'Tap here to check in and start your shift.';
    speakText(text, state.currentLanguage);
  };

  const playPayVoicePrompt = () => {
    const text = state.currentLanguage === 'ta'
      ? `உங்கள் நிகர ஊதியம் ${takeHomeFormatted}. விவரங்களைக் கேட்க தட்டவும்.`
      : state.currentLanguage === 'hi'
      ? `आपका वेतन ${takeHomeFormatted} है। विवरण देखने हेतु यहाँ दबाएं।`
      : `Your take home pay is ${takeHomeFormatted}. Tap to hear breakdown.`;
    speakText(text, state.currentLanguage);
  };

  const playHazardVoicePrompt = () => {
    const text = state.currentLanguage === 'ta'
      ? 'பணியிடத்தில் ஏதேனும் ஆபத்து அல்லது சேதம் இருந்தால் புகார் செய்ய இங்கு தட்டவும்.'
      : state.currentLanguage === 'hi'
      ? 'कार्यस्थल पर किसी भी खतरे की सूचना देने के लिए यहाँ दबाएं।'
      : 'Tap here to report any dangerous or unsafe condition.';
    speakText(text, state.currentLanguage);
  };

  const playDataVoicePrompt = () => {
    const text = state.currentLanguage === 'ta'
      ? 'உங்களைப் பற்றி என்னென்ன தகவல்கள் பதிவு செய்யப்பட்டுள்ளன என்பதை அறிய இங்கு தட்டவும்.'
      : state.currentLanguage === 'hi'
      ? 'आपके बारे में क्या जानकारी दर्ज है, यह जानने के लिए यहाँ दबाएं।'
      : 'Tap here to see all information recorded about you.';
    speakText(text, state.currentLanguage);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      {/* Header with worker name and audio welcome */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-sm font-bold uppercase tracking-wider text-emerald-400">
            {t('mode.simple', state.currentLanguage)}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            {worker?.fullName}
          </h1>
          <p className="text-base text-slate-300 font-medium">{worker?.designation}</p>
        </div>
        <button
          onClick={() => {
            const welcome = state.currentLanguage === 'ta'
              ? `வணக்கம் ${worker?.fullName}. நீங்கள் எளிய முறையில் உள்ளீர்கள்.`
              : state.currentLanguage === 'hi'
              ? `नमस्ते ${worker?.fullName}। आप सरल मोड में हैं।`
              : `Hello ${worker?.fullName}. You are in Simple Mode.`;
            speakText(welcome, state.currentLanguage);
          }}
          className="p-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-white shadow-md transition active:scale-95"
          aria-label="Listen to welcome"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>

      {/* 4 Large Accessible Action Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tile 1: Check In / Out */}
        <div className="relative group">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`w-full min-h-[160px] p-5 rounded-3xl border-3 flex flex-col justify-between text-left transition active:scale-95 shadow-xl ${
              activeShift
                ? 'bg-amber-950/40 border-amber-500 text-white hover:bg-amber-900/40'
                : 'bg-emerald-950/40 border-emerald-500 text-white hover:bg-emerald-900/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  activeShift ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {activeShift ? <LogOut className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                  activeShift ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {activeShift ? t('status.on_duty', state.currentLanguage) : t('status.off_duty', state.currentLanguage)}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight">
                {activeShift ? t('action.checkout', state.currentLanguage) : t('action.checkin', state.currentLanguage)}
              </h2>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                {activeShift ? 'Tap to finish duty' : 'Tap to scan gate QR'}
              </p>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playCheckInVoicePrompt();
            }}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-slate-300"
            aria-label="Listen to check in prompt"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tile 2: My Pay */}
        <div className="relative group">
          <button
            onClick={() => setActiveTab('payslip')}
            className="w-full min-h-[160px] p-5 rounded-3xl border-3 bg-blue-950/40 border-blue-500 text-white hover:bg-blue-900/40 flex flex-col justify-between text-left transition active:scale-95 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 text-slate-950 flex items-center justify-center font-bold">
                <Wallet className="w-8 h-8" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Formula OK
              </span>
            </div>

            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase block">
                {t('payslip.net_pay', state.currentLanguage)}
              </span>
              <h2 className="text-2xl font-black text-white">{takeHomeFormatted}</h2>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playPayVoicePrompt();
            }}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-slate-300"
            aria-label="Listen to pay summary"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tile 3: Report Hazard */}
        <div className="relative group">
          <button
            onClick={() => setActiveTab('safety')}
            className="w-full min-h-[160px] p-5 rounded-3xl border-3 bg-rose-950/40 border-rose-500 text-white hover:bg-rose-900/40 flex flex-col justify-between text-left transition active:scale-95 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-rose-500 text-slate-950 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Anonymous
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black">
                {t('nav.safety', state.currentLanguage)}
              </h2>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                Report broken equipment / danger
              </p>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playHazardVoicePrompt();
            }}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-slate-300"
            aria-label="Listen to hazard reporting prompt"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Tile 4: What is recorded about me (Privacy & Dignity) */}
        <div className="relative group">
          <button
            onClick={() => setActiveTab('my_data')}
            className="w-full min-h-[160px] p-5 rounded-3xl border-3 bg-purple-950/40 border-purple-500 text-white hover:bg-purple-900/40 flex flex-col justify-between text-left transition active:scale-95 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-purple-500 text-slate-950 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Dignity
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black">
                {t('nav.my_data', state.currentLanguage)}
              </h2>
              <p className="text-sm text-slate-300 font-semibold mt-0.5">
                Inspect your profile & records
              </p>
            </div>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playDataVoicePrompt();
            }}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-700 rounded-xl text-slate-300"
            aria-label="Listen to my data prompt"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Switch to standard mode footer button */}
      <div className="text-center pt-2">
        <button
          onClick={() => store.setSimpleMode(false)}
          className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition"
        >
          Switch to Standard View (with full calendars & tables)
        </button>
      </div>
    </div>
  );
};
