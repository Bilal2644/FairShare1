/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Reactive Store & API Emulator for FairShift
 * Maintains relational consistency, audit trail, RBAC boundaries, and rule execution.
 */

import {
  Organization,
  Site,
  WorkerProfile,
  ShiftRecord,
  Payslip,
  HazardReport,
  FatigueAlert,
  FeedbackCycle,
  FeedbackParticipation,
  FeedbackResponse,
  PayQuery,
  SettingsAuditEntry,
  RetentionRiskItem,
  Role,
  Language,
  TextSize,
  ThemeMode,
} from '../types/index.ts';
import {
  SEED_ORGS,
  SEED_SITES,
  SEED_WORKERS,
  generateSeedShifts,
  SEED_HAZARDS,
  SEED_FATIGUE_ALERTS,
  SEED_FEEDBACK_CYCLE,
  SEED_PARTICIPATION,
  SEED_FEEDBACK_RESPONSES,
  SEED_PAY_QUERIES,
} from './seedData.ts';
import { CONSTRUCTION_PRESET } from '../config/presets/construction.ts';
import { COLLEGE_PRESET } from '../config/presets/college.ts';
import { evaluateWorkerPayroll } from '../engines/pay.ts';
import { evaluateWorkerFatigue } from '../engines/fatigue.ts';
import { evaluateWorkerFrictionRisk } from '../engines/risk.ts';
import { aggregateFeedbackScores, AggregateSentimentResult } from '../engines/anonymity.ts';
import { SETTINGS_REGISTRY, validateSetting, resolveSetting } from '../config/registry.ts';
import {
  syncShiftToFirestore,
  syncHazardToFirestore,
  syncFeedbackToFirestore,
  syncPayQueryToFirestore,
} from './firebaseSync.ts';

export interface AppState {
  currentOrgId: string;
  currentUserId: string; // Worker or Admin ID
  currentUserRole: Role;
  currentLanguage: Language;
  currentTextSize: TextSize;
  currentTheme: ThemeMode;
  simpleMode: boolean;

  orgs: Organization[];
  sites: Site[];
  workers: WorkerProfile[];
  shifts: ShiftRecord[];
  payslips: Payslip[];
  payQueries: PayQuery[];
  hazards: HazardReport[];
  fatigueAlerts: FatigueAlert[];
  feedbackCycle: FeedbackCycle;
  feedbackParticipation: FeedbackParticipation[];
  feedbackResponses: FeedbackResponse[];
  settingsOverrides: Record<string, Record<string, any>>; // orgId -> { key: value }
  auditLogs: SettingsAuditEntry[];
  offlineQueueCount: number;
}

const STORAGE_KEY = 'fairshift_app_state_v1';

function initializeFreshState(): AppState {
  const initialShifts = generateSeedShifts();

  // Pre-generate Payslips for Murugan and Priya
  const murugan = SEED_WORKERS.find((w) => w.id === 'w_murugan')!;
  const muruganShifts = initialShifts.filter((s) => s.workerId === 'w_murugan');
  const muruganPay = evaluateWorkerPayroll(
    muruganShifts.map((s) => ({
      id: s.id,
      workerId: s.workerId,
      startTimeUtc: s.startTimeUtc,
      endTimeUtc: s.endTimeUtc!,
      hourlyRatePaise: murugan.hourlyBaseWagePaise,
    })),
    {
      dailyThresholdHours: 8.0,
      weeklyThresholdHours: 48.0,
      overtimeMultiplier: 1.5,
      breakDeductionMinutes: 30,
      graceMinutes: 15,
      roundingMode: 'nearest_rupee',
    }
  );

  const initialPayslips: Payslip[] = [
    {
      id: 'ps_murugan_sep',
      orgId: 'org_metro_infra',
      workerId: 'w_murugan',
      payPeriodId: 'pp_oct_2026',
      payPeriodLabel: 'October 2026 (Monthly Run)',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      regularHoursTotal: muruganPay.regularHoursTotal,
      overtimeHoursTotal: muruganPay.overtimeHoursTotal,
      basePaise: muruganPay.basePaise,
      overtimePaise: muruganPay.overtimePaise,
      allowancesPaise: 250000, // ₹2,500 High-elevation hazard allowance
      deductionsPaise: 40000, // ₹400 safety kit deduction
      netPaise: muruganPay.netPaise + 250000 - 40000,
      ruleVersion: 'v1.0.0-construction',
      formulaSnapshotJson: JSON.stringify(muruganPay.formulaTrace),
      lineItems: [
        {
          id: 'li_base',
          labelKey: 'payslip.base_pay',
          hours: muruganPay.regularHoursTotal,
          ratePaise: murugan.hourlyBaseWagePaise,
          amountPaise: muruganPay.basePaise,
          type: 'base',
        },
        {
          id: 'li_ot',
          labelKey: 'payslip.ot_pay',
          hours: muruganPay.overtimeHoursTotal,
          ratePaise: Math.round(murugan.hourlyBaseWagePaise * 1.5),
          amountPaise: muruganPay.overtimePaise,
          type: 'overtime',
        },
        {
          id: 'li_hazard_allowance',
          labelKey: 'payslip.allowances',
          amountPaise: 250000,
          type: 'allowance',
        },
        {
          id: 'li_kit_deduction',
          labelKey: 'payslip.deductions',
          amountPaise: -40000,
          type: 'deduction',
        },
      ],
      isLocked: true,
      createdAt: '2026-10-25T00:00:00.000Z',
    },
  ];

  return {
    currentOrgId: 'org_metro_infra',
    currentUserId: 'w_murugan', // Default to Murugan K for inclusive worker view
    currentUserRole: 'worker',
    currentLanguage: 'ta',
    currentTextSize: 'normal',
    currentTheme: 'standard',
    simpleMode: false,

    orgs: SEED_ORGS,
    sites: SEED_SITES,
    workers: SEED_WORKERS,
    shifts: initialShifts,
    payslips: initialPayslips,
    payQueries: SEED_PAY_QUERIES,
    hazards: SEED_HAZARDS,
    fatigueAlerts: SEED_FATIGUE_ALERTS,
    feedbackCycle: SEED_FEEDBACK_CYCLE,
    feedbackParticipation: SEED_PARTICIPATION,
    feedbackResponses: SEED_FEEDBACK_RESPONSES,
    settingsOverrides: {
      org_metro_infra: { ...CONSTRUCTION_PRESET.settings },
      org_greenfield_college: { ...COLLEGE_PRESET.settings },
    },
    auditLogs: [
      {
        id: 'audit_init_1',
        orgId: 'org_metro_infra',
        changedByUserId: 'w_vikram_admin',
        settingKey: 'attendance.grace_minutes',
        oldValue: 10,
        newValue: 15,
        reason: 'Adjusted for morning gate queue clearance',
        timestampUtc: '2026-10-01T08:00:00.000Z',
      },
    ],
    offlineQueueCount: 0,
  };
}

class Store {
  private state: AppState;
  private listeners: Array<() => void> = [];

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): AppState {
    if (typeof window === 'undefined') return initializeFreshState();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load saved state, initializing fresh baseline', e);
    }
    return initializeFreshState();
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Failed to persist state', e);
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): AppState {
    return this.state;
  }

  public resetToSeed() {
    this.state = initializeFreshState();
    this.persist();
  }

  // --- Session & Navigation ---
  public setCurrentUser(workerId: string) {
    const worker = this.state.workers.find((w) => w.id === workerId);
    if (!worker) return;
    this.state.currentUserId = worker.id;
    this.state.currentUserRole = worker.role;
    this.state.currentOrgId = worker.orgId;
    this.state.currentLanguage = worker.preferredLanguage;
    this.persist();
  }

  public setSector(orgId: string) {
    const org = this.state.orgs.find((o) => o.id === orgId);
    if (!org) return;
    this.state.currentOrgId = org.id;
    // Pick first worker of this org matching current role or default
    const matchingWorker = this.state.workers.find(
      (w) => w.orgId === org.id && (w.role === this.state.currentUserRole || w.role === 'worker')
    );
    if (matchingWorker) {
      this.state.currentUserId = matchingWorker.id;
      this.state.currentUserRole = matchingWorker.role;
      this.state.currentLanguage = matchingWorker.preferredLanguage;
    }
    this.persist();
  }

  public setLanguage(lang: Language) {
    this.state.currentLanguage = lang;
    this.persist();
  }

  public setTextSize(size: TextSize) {
    this.state.currentTextSize = size;
    this.persist();
  }

  public setSimpleMode(enabled: boolean) {
    this.state.simpleMode = enabled;
    this.persist();
  }

  // --- Configuration & Settings ---
  public getEffectiveSetting<T>(key: string): T {
    const orgId = this.state.currentOrgId;
    const org = this.state.orgs.find((o) => o.id === orgId);
    const preset = org?.sectorPreset === 'college' ? COLLEGE_PRESET.settings : CONSTRUCTION_PRESET.settings;
    const orgOverrides = this.state.settingsOverrides[orgId] || {};
    return resolveSetting<T>(key, preset, orgOverrides);
  }

  public updateSetting(key: string, value: any, reason: string): { success: boolean; error?: string } {
    const validation = validateSetting(key, value);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const orgId = this.state.currentOrgId;
    if (!this.state.settingsOverrides[orgId]) {
      this.state.settingsOverrides[orgId] = {};
    }

    const oldValue = this.getEffectiveSetting(key);
    this.state.settingsOverrides[orgId][key] = value;

    // Record immutable audit entry
    this.state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      orgId,
      changedByUserId: this.state.currentUserId,
      settingKey: key,
      oldValue,
      newValue: value,
      reason: reason || 'Configuration updated via Admin Registry Center',
      timestampUtc: new Date().toISOString(),
    });

    this.persist();
    return { success: true };
  }

  public simulateSettingChange(key: string, proposedValue: any): {
    impactedWorkersCount: number;
    otHoursDiff: number;
    payrollCostDiffPaise: number;
  } {
    const orgId = this.state.currentOrgId;
    const currentMult = this.getEffectiveSetting<number>('pay.overtime_multiplier');
    const newMult = key === 'pay.overtime_multiplier' ? Number(proposedValue) : currentMult;

    const orgShifts = this.state.shifts.filter((s) => s.orgId === orgId && s.status === 'COMPLETED');
    const totalOTHours = orgShifts.reduce((acc, s) => acc + s.overtimeHours, 0);

    // Approximate average hourly rate ₹100 = 10,000 paise
    const costCurrent = Math.round(totalOTHours * 10000 * currentMult);
    const costNew = Math.round(totalOTHours * 10000 * newMult);

    return {
      impactedWorkersCount: new Set(orgShifts.map((s) => s.workerId)).size,
      otHoursDiff: 0,
      payrollCostDiffPaise: costNew - costCurrent,
    };
  }

  // --- Shifts & Attendance ---
  public checkIn(params: {
    workerId: string;
    siteId: string;
    method: 'qr_scan' | 'geofence_self' | 'supervisor_badge_scan';
    lat?: number;
    lng?: number;
    isWithinGeofence: boolean;
  }): ShiftRecord {
    const nowUtc = new Date().toISOString();
    const todayDate = nowUtc.split('T')[0];

    const newShift: ShiftRecord = {
      id: `shift_${Date.now()}`,
      orgId: this.state.currentOrgId,
      siteId: params.siteId,
      workerId: params.workerId,
      startTimeUtc: nowUtc,
      workDayDate: todayDate,
      status: 'IN_PROGRESS',
      checkInMethod: params.method,
      checkInLat: params.lat,
      checkInLng: params.lng,
      isWithinGeofence: params.isWithinGeofence,
      breakDeductedMinutes: this.getEffectiveSetting<number>('attendance.break_deduction_minutes') || 30,
      regularHours: 0,
      overtimeHours: 0,
      idempotencyKey: `idemp_${Date.now()}_${params.workerId}`,
    };

    this.state.shifts.unshift(newShift);
    this.persist();

    if (typeof window !== 'undefined') {
      syncShiftToFirestore(newShift).catch((err) => console.warn('[FairShift Firestore] syncShift failed:', err));
    }

    return newShift;
  }

  public checkOut(shiftId: string): ShiftRecord | null {
    const shift = this.state.shifts.find((s) => s.id === shiftId);
    if (!shift) return null;

    const nowUtc = new Date().toISOString();
    shift.endTimeUtc = nowUtc;
    shift.status = 'COMPLETED';

    const startMs = new Date(shift.startTimeUtc).getTime();
    const endMs = new Date(nowUtc).getTime();
    const totalMinutes = Math.max(0, (endMs - startMs) / (1000 * 60) - shift.breakDeductedMinutes);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const dailyThreshold = this.getEffectiveSetting<number>('pay.daily_threshold_hours') || 8.0;
    shift.regularHours = Math.min(totalHours, dailyThreshold);
    shift.overtimeHours = Math.max(0, totalHours - dailyThreshold);

    // Evaluate potential fatigue alerts
    const worker = this.state.workers.find((w) => w.id === shift.workerId);
    if (worker) {
      const workerShifts = this.state.shifts.filter((s) => s.workerId === worker.id);
      const fatigueAlerts = evaluateWorkerFatigue(
        workerShifts.map((s) => ({
          id: s.id,
          workerId: s.workerId,
          workerName: worker.fullName,
          startTimeUtc: s.startTimeUtc,
          endTimeUtc: s.endTimeUtc,
          workDayDate: s.workDayDate,
        })),
        {
          maxDailyHours: this.getEffectiveSetting<number>('fatigue.max_daily_hours') || 11.0,
          minRestBetweenShiftsHours: this.getEffectiveSetting<number>('fatigue.min_rest_between_shifts_hours') || 11.0,
          maxConsecutiveDays: this.getEffectiveSetting<number>('fatigue.max_consecutive_days') || 6,
        }
      );

      fatigueAlerts.forEach((fa) => {
        // Deduplicate
        const exists = this.state.fatigueAlerts.some(
          (ea) => ea.workerId === fa.workerId && ea.ruleId === fa.ruleId && ea.shiftId === fa.shiftId
        );
        if (!exists) {
          this.state.fatigueAlerts.unshift({
            id: `fatigue_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            orgId: this.state.currentOrgId,
            workerId: fa.workerId,
            workerName: fa.workerName,
            shiftId: fa.shiftId,
            ruleId: fa.ruleId,
            ruleDescription: fa.ruleDescription,
            thresholdValue: fa.thresholdValue,
            actualValue: fa.actualValue,
            unit: fa.unit,
            severity: fa.severity,
            isAcknowledged: false,
            createdAt: nowUtc,
          });
        }
      });
    }

    this.persist();

    if (typeof window !== 'undefined') {
      syncShiftToFirestore(shift).catch((err) => console.warn('[FairShift Firestore] syncShift failed:', err));
    }

    return shift;
  }

  // --- Safety & Hazards ---
  public submitHazard(params: {
    category: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    isAnonymous: boolean;
    photoUrl?: string;
  }): HazardReport {
    const now = new Date();
    const slaHours = params.severity === 'CRITICAL' ? 2 : params.severity === 'HIGH' ? 4 : 24;
    const breachAt = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();
    const currentUser = this.state.workers.find((w) => w.id === this.state.currentUserId);

    const report: HazardReport = {
      id: `haz_${Date.now()}`,
      orgId: this.state.currentOrgId,
      siteId: currentUser?.siteId || this.state.sites[0].id,
      reporterWorkerId: params.isAnonymous ? null : currentUser?.id,
      reporterName: params.isAnonymous ? 'Anonymous Worker' : currentUser?.fullName,
      isAnonymous: params.isAnonymous,
      category: params.category,
      severity: params.severity,
      description: params.description,
      photoUrl: params.photoUrl,
      status: 'SUBMITTED',
      targetResponseHours: slaHours,
      createdAt: now.toISOString(),
      slaBreachAt: breachAt,
    };

    this.state.hazards.unshift(report);
    this.persist();

    if (typeof window !== 'undefined') {
      syncHazardToFirestore(report).catch((err) => console.warn('[FairShift Firestore] syncHazard failed:', err));
    }

    return report;
  }

  public updateHazardStatus(hazardId: string, status: HazardReport['status'], resolutionNote?: string) {
    const haz = this.state.hazards.find((h) => h.id === hazardId);
    if (!haz) return;
    haz.status = status;
    if (resolutionNote) haz.resolutionNote = resolutionNote;
    if (status === 'RESOLVED') haz.resolvedAt = new Date().toISOString();
    if (status === 'ESCALATED') haz.escalatedAt = new Date().toISOString();
    this.persist();
  }

  // --- Truly Anonymous Feedback ---
  public submitFeedbackBallot(params: {
    departmentId: string;
    questionId: string;
    score: number;
    comment?: string;
  }): { success: boolean; error?: string } {
    const cycle = this.state.feedbackCycle;
    const workerId = this.state.currentUserId;
    const today = new Date().toISOString().split('T')[0];

    // Check if worker already submitted for this cycle (Participation record check)
    const alreadyVoted = this.state.feedbackParticipation.some(
      (p) => p.cycleId === cycle.id && p.workerId === workerId
    );
    if (alreadyVoted) {
      return { success: false, error: 'You have already submitted your response for this active feedback cycle.' };
    }

    // 1. Record participation (No score, no answer)
    this.state.feedbackParticipation.push({
      id: `part_${Date.now()}`,
      cycleId: cycle.id,
      workerId,
      submittedDayBucket: today,
    });

    // 2. Record response in UNLINKED vault (No worker ID)
    const feedbackResponse: FeedbackResponse = {
      id: `fr_${Date.now()}`,
      cycleId: cycle.id,
      departmentOrTeamId: params.departmentId,
      questionId: params.questionId,
      scoreRating: params.score,
      feedbackTextScrubbed: params.comment,
      submittedDayBucket: today,
    };
    this.state.feedbackResponses.push(feedbackResponse);

    this.persist();

    if (typeof window !== 'undefined') {
      syncFeedbackToFirestore(feedbackResponse).catch((err) => console.warn('[FairShift Firestore] syncFeedback failed:', err));
    }

    return { success: true };
  }

  public getSentimentAggregates(departmentId: string): AggregateSentimentResult {
    const floor = this.getEffectiveSetting<number>('feedback.anonymity_threshold_floor') || 5;
    return aggregateFeedbackScores(this.state.feedbackResponses, departmentId, floor);
  }

  // --- Pay Queries ---
  public submitPayQuery(params: {
    payslipId: string;
    queryType: PayQuery['queryType'];
    message: string;
  }): PayQuery {
    const user = this.state.workers.find((w) => w.id === this.state.currentUserId);
    const query: PayQuery = {
      id: `query_${Date.now()}`,
      payslipId: params.payslipId,
      workerId: this.state.currentUserId,
      workerName: user?.fullName || 'Worker',
      queryType: params.queryType,
      message: params.message,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    this.state.payQueries.unshift(query);
    this.persist();

    if (typeof window !== 'undefined') {
      syncPayQueryToFirestore(query).catch((err) => console.warn('[FairShift Firestore] syncPayQuery failed:', err));
    }

    return query;
  }

  public resolvePayQuery(queryId: string, status: PayQuery['status'], note: string, adjustmentPaise: number = 0) {
    const q = this.state.payQueries.find((item) => item.id === queryId);
    if (!q) return;
    q.status = status;
    q.resolutionNote = note;
    q.adjustmentPaise = adjustmentPaise;
    q.resolvedBySupervisorId = this.state.currentUserId;
    q.resolvedAt = new Date().toISOString();
    this.persist();
  }

  // --- Retention Risk Heuristic ---
  public getRetentionRiskList(): RetentionRiskItem[] {
    const orgWorkers = this.state.workers.filter(
      (w) => w.orgId === this.state.currentOrgId && w.role === 'worker'
    );

    return orgWorkers.map((w) => {
      const workerShifts = this.state.shifts.filter((s) => s.workerId === w.id);
      const excessiveOTCount = workerShifts.filter((s) => s.overtimeHours >= 2.0).length;
      const openHazardsCount = this.state.hazards.filter(
        (h) => h.siteId === w.siteId && h.status !== 'RESOLVED'
      ).length;
      const openQueriesCount = this.state.payQueries.filter(
        (pq) => pq.workerId === w.id && pq.status === 'OPEN'
      ).length;

      // Simulated attendance dip for tower B welder team
      const attendanceDrop = w.designation.includes('Tower B Team') ? 22 : 0;

      return evaluateWorkerFrictionRisk({
        workerId: w.id,
        workerName: w.fullName,
        departmentOrTeam: w.designation,
        consecutiveOvertimeShiftsLast14Days: excessiveOTCount,
        openHazardReportsInWorkArea: openHazardsCount,
        unresolvedPayQueriesCount: openQueriesCount,
        attendanceDropPercentage: attendanceDrop,
      });
    });
  }
}

export const store = new Store();
