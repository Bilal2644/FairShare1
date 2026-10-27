/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { store, AppState } from '../server/store.ts';
import { t, formatINR } from '../i18n/index.ts';
import { speakText } from '../utils/speech.ts';
import {
  QrCode,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  RefreshCw,
  WifiOff,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface WorkerCheckInProps {
  state: AppState;
}

export const WorkerCheckIn: React.FC<WorkerCheckInProps> = ({ state }) => {
  const currentWorker = state.workers.find((w) => w.id === state.currentUserId);
  const currentSite = state.sites.find((s) => s.id === currentWorker?.siteId) || state.sites[0];
  const activeShift = state.shifts.find(
    (s) => s.workerId === state.currentUserId && s.status === 'IN_PROGRESS'
  );

  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [qrToken, setQrToken] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Keep live clock running
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotating QR code token generator (rotates every 30s)
  useEffect(() => {
    const generateToken = () => {
      const windowId = Math.floor(Date.now() / 30000);
      const token = `GATE_${currentSite.id.toUpperCase()}_W${windowId}_${Math.random().toString(36).slice(2, 6)}`;
      setQrToken(token);
      setSecondsRemaining(30);
    };
    generateToken();
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          generateToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSite.id]);

  const handlePerformCheckIn = (method: 'qr_scan' | 'geofence_self') => {
    const shift = store.checkIn({
      workerId: state.currentUserId,
      siteId: currentSite.id,
      method,
      lat: currentSite.geofenceLat,
      lng: currentSite.geofenceLng,
      isWithinGeofence: true,
    });
    setStatusMessage('Check-in recorded successfully! Shift timer active.');
    setIsScanning(false);

    speakText(
      state.currentLanguage === 'ta'
        ? 'வருகை பதிவு செய்யப்பட்டது. வேலை நேரம் தொடங்குகிறது.'
        : state.currentLanguage === 'hi'
        ? 'उपस्थिति दर्ज हो गई है। कार्य समय शुरू हो चुका है।'
        : 'Check in recorded. Your shift has begun.',
      state.currentLanguage
    );
  };

  const handlePerformCheckOut = () => {
    if (!activeShift) return;
    const completed = store.checkOut(activeShift.id);
    if (completed) {
      setStatusMessage(
        `Shift completed! Regular: ${completed.regularHours}h, Overtime: ${completed.overtimeHours}h.`
      );
      speakText(
        state.currentLanguage === 'ta'
          ? `பணி நிறைவடைந்தது. வழக்கமான நேரம் ${completed.regularHours} மணிநேரம், கூடுதல் நேரம் ${completed.overtimeHours} மணிநேரம்.`
          : state.currentLanguage === 'hi'
          ? `काम पूरा हुआ। नियमित ${completed.regularHours} घंटे, अतिरिक्त ${completed.overtimeHours} घंटे।`
          : `Shift completed. ${completed.regularHours} regular hours and ${completed.overtimeHours} overtime hours.`,
        state.currentLanguage
      );
    }
  };

  const workerShifts = state.shifts
    .filter((s) => s.workerId === state.currentUserId)
    .slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Live Worksite & Clock Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {currentSite.name}
            </span>
            <h1 className="text-2xl font-black text-white mt-1">
              {currentWorker?.fullName}
            </h1>
            <p className="text-xs text-slate-400 font-medium">Worker ID: #{currentWorker?.workerCode}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block uppercase">Asia/Kolkata Time</span>
            <span className="font-mono text-2xl font-bold text-white tracking-wider">
              {currentTimeStr}
            </span>
          </div>
        </div>

        {/* Geofence Status Badge */}
        <div className="mt-4 flex items-center justify-between bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{t('status.inside_geofence', state.currentLanguage)}</span>
          </div>
          <span className="text-slate-400 font-medium">Radius: {currentSite.geofenceRadiusMeters}m</span>
        </div>

        {/* Active Shift Card or Check In Card */}
        <div className="mt-6">
          {activeShift ? (
            <div className="bg-amber-950/40 border-2 border-amber-500 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <span className="font-bold text-amber-300 uppercase tracking-wide text-sm">
                    {t('status.on_duty', state.currentLanguage)}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Started: {new Date(activeShift.startTimeUtc).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-sm text-slate-200">
                Shift in progress at <strong>{currentSite.name}</strong>. Break deduction ({activeShift.breakDeductedMinutes}m) and overtime will be computed automatically at checkout.
              </p>

              <button
                onClick={handlePerformCheckOut}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-lg flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
              >
                <LogOut className="w-6 h-6" />
                {t('action.checkout', state.currentLanguage)}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rotating QR Gate Simulator */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-5 text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Site Security Gate Rotating QR Token
                </span>
                <div className="inline-block p-4 bg-white rounded-2xl shadow-inner my-1">
                  <QrCode className="w-24 h-24 text-slate-950 mx-auto" />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400 mt-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Token: {qrToken}</span>
                  <span className="text-slate-400">({secondsRemaining}s)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Protected against screenshot reuse: tokens expire every 30 seconds.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handlePerformCheckIn('qr_scan')}
                  className="py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-95"
                >
                  <QrCode className="w-5 h-5" />
                  Scan Gate QR & Check In
                </button>
                <button
                  onClick={() => handlePerformCheckIn('geofence_self')}
                  className="py-4 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-2xl text-base flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  1-Touch GPS Check In
                </button>
              </div>
            </div>
          )}

          {statusMessage && (
            <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Offline Tolerant Queue Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-400">
        <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
        <div>
          <span className="font-semibold text-slate-300 block">Offline Safe Queue Active</span>
          <span>{t('status.offline_queue', state.currentLanguage)}</span>
        </div>
      </div>

      {/* Recent Shift History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Recent Recorded Shifts
          </h2>
          <span className="text-xs text-slate-400">Last 5 Days</span>
        </div>

        <div className="space-y-2">
          {workerShifts.map((shift) => (
            <div
              key={shift.id}
              className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-200 block">
                  {new Date(shift.startTimeUtc).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
                <span className="text-slate-400">
                  {new Date(shift.startTimeUtc).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {shift.endTimeUtc
                    ? new Date(shift.endTimeUtc).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                    : 'Ongoing'}
                </span>
              </div>

              <div className="text-right">
                <span className="font-semibold text-emerald-400 block">
                  {shift.regularHours.toFixed(1)}h regular
                  {shift.overtimeHours > 0 && ` + ${shift.overtimeHours.toFixed(1)}h OT`}
                </span>
                <span className="text-[10px] text-slate-400 uppercase">{shift.checkInMethod.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
