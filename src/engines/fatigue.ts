/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Fatigue and Overwork Alert Engine
 * Evaluates shift records against safety thresholds.
 * Every alert explicitly attributes the rule that fired, the threshold, and the actual value.
 */

export interface FatigueEngineConfig {
  maxDailyHours: number; // e.g. 11.0
  minRestBetweenShiftsHours: number; // e.g. 11.0
  maxConsecutiveDays: number; // e.g. 6
}

export interface ShiftFatigueInput {
  id: string;
  workerId: string;
  workerName: string;
  startTimeUtc: string;
  endTimeUtc?: string;
  workDayDate: string; // YYYY-MM-DD
}

export interface GeneratedFatigueAlert {
  workerId: string;
  workerName: string;
  shiftId: string;
  ruleId: 'RULE_MAX_DAILY_HOURS' | 'RULE_MIN_REST_BETWEEN_SHIFTS' | 'RULE_MAX_CONSECUTIVE_DAYS';
  ruleDescription: string;
  thresholdValue: number;
  actualValue: number;
  unit: string;
  severity: 'WARNING' | 'CRITICAL';
  workerNudgeText: string;
  adminDetailText: string;
}

export function evaluateWorkerFatigue(
  shifts: ShiftFatigueInput[],
  config: FatigueEngineConfig
): GeneratedFatigueAlert[] {
  const alerts: GeneratedFatigueAlert[] = [];
  const completedShifts = shifts
    .filter((s) => s.endTimeUtc)
    .sort((a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime());

  if (completedShifts.length === 0) return alerts;

  // 1. Check Max Daily Hours for each shift
  for (const shift of completedShifts) {
    const startMs = new Date(shift.startTimeUtc).getTime();
    const endMs = new Date(shift.endTimeUtc!).getTime();
    const durationHours = Math.round(((endMs - startMs) / (1000 * 60 * 60)) * 10) / 10;

    if (durationHours > config.maxDailyHours) {
      alerts.push({
        workerId: shift.workerId,
        workerName: shift.workerName,
        shiftId: shift.id,
        ruleId: 'RULE_MAX_DAILY_HOURS',
        ruleDescription: 'Single shift duration exceeded safe working limits',
        thresholdValue: config.maxDailyHours,
        actualValue: durationHours,
        unit: 'hours',
        severity: durationHours >= config.maxDailyHours + 2 ? 'CRITICAL' : 'WARNING',
        workerNudgeText: `You have completed ${durationHours} hours. Please ensure you take adequate rest and hydration before your next shift.`,
        adminDetailText: `Shift #${shift.id.slice(0, 8)} logged ${durationHours}h, exceeding maximum daily threshold of ${config.maxDailyHours}h.`,
      });
    }
  }

  // 2. Check Minimum Rest Period Between Consecutive Shifts
  for (let i = 0; i < completedShifts.length - 1; i++) {
    const priorShift = completedShifts[i];
    const nextShift = completedShifts[i + 1];

    const priorEndMs = new Date(priorShift.endTimeUtc!).getTime();
    const nextStartMs = new Date(nextShift.startTimeUtc).getTime();
    const restHours = Math.round(((nextStartMs - priorEndMs) / (1000 * 60 * 60)) * 10) / 10;

    if (restHours >= 0 && restHours < config.minRestBetweenShiftsHours) {
      alerts.push({
        workerId: nextShift.workerId,
        workerName: nextShift.workerName,
        shiftId: nextShift.id,
        ruleId: 'RULE_MIN_REST_BETWEEN_SHIFTS',
        ruleDescription: 'Insufficient turnaround rest time between back-to-back shifts',
        thresholdValue: config.minRestBetweenShiftsHours,
        actualValue: restHours,
        unit: 'hours',
        severity: restHours < 8 ? 'CRITICAL' : 'WARNING',
        workerNudgeText: `Your rest turnaround between shifts was ${restHours} hours (recommended min: ${config.minRestBetweenShiftsHours}h). Take light duties if needed.`,
        adminDetailText: `Worker scheduled with only ${restHours}h turnaround between Shift #${priorShift.id.slice(0, 6)} and #${nextShift.id.slice(0, 6)} (Required: ${config.minRestBetweenShiftsHours}h).`,
      });
    }
  }

  // 3. Check Consecutive Working Days
  // Group distinct work days
  const workDays = Array.from(new Set(completedShifts.map((s) => s.workDayDate))).sort();
  let currentStreak = 0;
  let lastDayMs = 0;

  for (const dayStr of workDays) {
    const dayMs = new Date(dayStr).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (lastDayMs === 0 || Math.abs(dayMs - lastDayMs - oneDayMs) < 1000 * 60) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
    lastDayMs = dayMs;

    if (currentStreak > config.maxConsecutiveDays) {
      const triggeringShift = completedShifts.find((s) => s.workDayDate === dayStr);
      alerts.push({
        workerId: shifts[0].workerId,
        workerName: shifts[0].workerName,
        shiftId: triggeringShift?.id || shifts[0].id,
        ruleId: 'RULE_MAX_CONSECUTIVE_DAYS',
        ruleDescription: 'Worker has worked consecutive days without a mandatory rest day off',
        thresholdValue: config.maxConsecutiveDays,
        actualValue: currentStreak,
        unit: 'consecutive days',
        severity: currentStreak >= config.maxConsecutiveDays + 2 ? 'CRITICAL' : 'WARNING',
        workerNudgeText: `You have worked ${currentStreak} consecutive days without a day off. A rest day is vital for your health and safety.`,
        adminDetailText: `Worker has reached ${currentStreak} continuous working days without a scheduled day off (Max threshold: ${config.maxConsecutiveDays} days).`,
      });
      break; // Report highest streak
    }
  }

  return alerts;
}
