/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Pay & Overtime Rule Engine
 * Evaluates shifts into base pay, overtime pay, and generates step-by-step
 * transparent formula breakdown for worker dignity.
 * Uses integer minor units (paise; ₹1 = 100 paise) to eliminate floating-point rounding errors.
 */

export interface PayEngineConfig {
  dailyThresholdHours: number; // e.g. 8.0
  weeklyThresholdHours: number; // e.g. 48.0
  overtimeMultiplier: number; // e.g. 1.5
  breakDeductionMinutes: number; // e.g. 30
  graceMinutes: number; // e.g. 15
  roundingMode: 'nearest_rupee' | 'floor_rupee' | 'exact_paise';
}

export interface ShiftInput {
  id: string;
  workerId: string;
  startTimeUtc: string; // ISO string
  endTimeUtc: string; // ISO string
  hourlyRatePaise: number;
}

export interface PayCalculationResult {
  regularHoursTotal: number;
  overtimeHoursTotal: number;
  basePaise: number;
  overtimePaise: number;
  grossPaise: number;
  roundingAdjustmentPaise: number;
  netPaise: number;
  formulaTrace: string[];
  shiftsAnalyzedCount: number;
}

/**
 * Calculates duration in decimal hours between two UTC timestamps,
 * taking into account mandatory break deduction.
 */
export function calculateShiftDurationHours(
  startUtc: string,
  endUtc: string,
  breakMinutes: number = 0
): number {
  const start = new Date(startUtc).getTime();
  const end = new Date(endUtc).getTime();
  if (end <= start) return 0;

  const rawMinutes = (end - start) / (1000 * 60);
  const netMinutes = Math.max(0, rawMinutes - breakMinutes);
  return Math.round((netMinutes / 60) * 100) / 100; // 2 decimal places
}

/**
 * Evaluates a set of completed shifts for a single worker across a pay period.
 * Guarantees that daily overtime hours are never double-counted against weekly overtime.
 */
export function evaluateWorkerPayroll(
  shifts: ShiftInput[],
  config: PayEngineConfig
): PayCalculationResult {
  let regularHoursTotal = 0;
  let dailyOvertimeHoursTotal = 0;
  let basePaiseAccumulated = 0;
  let overtimePaiseAccumulated = 0;
  const trace: string[] = [];

  trace.push(`[Rule Engine] Evaluating ${shifts.length} shifts with Daily OT Threshold = ${config.dailyThresholdHours}h, Weekly OT Threshold = ${config.weeklyThresholdHours}h, Multiplier = ${config.overtimeMultiplier}x.`);

  // Sort shifts chronologically
  const sortedShifts = [...shifts].sort(
    (a, b) => new Date(a.startTimeUtc).getTime() - new Date(b.startTimeUtc).getTime()
  );

  let accumulatedWeeklyRegularHours = 0;

  for (const shift of sortedShifts) {
    const netHours = calculateShiftDurationHours(
      shift.startTimeUtc,
      shift.endTimeUtc,
      config.breakDeductionMinutes
    );

    if (netHours <= 0) continue;

    // Check daily threshold
    const dailyRegular = Math.min(netHours, config.dailyThresholdHours);
    const dailyOT = Math.max(0, netHours - config.dailyThresholdHours);

    // Check if adding this daily regular breaches weekly threshold
    let shiftRegular = dailyRegular;
    let shiftWeeklyOT = 0;

    if (accumulatedWeeklyRegularHours + dailyRegular > config.weeklyThresholdHours) {
      const allowedUnderWeekly = Math.max(0, config.weeklyThresholdHours - accumulatedWeeklyRegularHours);
      shiftRegular = allowedUnderWeekly;
      shiftWeeklyOT = dailyRegular - allowedUnderWeekly;
    }

    accumulatedWeeklyRegularHours += shiftRegular;

    const shiftTotalOT = dailyOT + shiftWeeklyOT;
    regularHoursTotal += shiftRegular;
    dailyOvertimeHoursTotal += shiftTotalOT;

    // Calculate money in integer paise
    const shiftBasePaise = Math.round(shiftRegular * shift.hourlyRatePaise);
    const otRatePaise = Math.round(shift.hourlyRatePaise * config.overtimeMultiplier);
    const shiftOtPaise = Math.round(shiftTotalOT * otRatePaise);

    basePaiseAccumulated += shiftBasePaise;
    overtimePaiseAccumulated += shiftOtPaise;

    trace.push(
      `Shift ${shift.id.slice(0, 8)} (${new Date(shift.startTimeUtc).toLocaleDateString()}): ` +
      `${netHours.toFixed(2)}h total (${shiftRegular.toFixed(2)}h regular @ ₹${(shift.hourlyRatePaise / 100).toFixed(2)} + ` +
      `${shiftTotalOT.toFixed(2)}h OT @ ₹${(otRatePaise / 100).toFixed(2)}) = ` +
      `₹${((shiftBasePaise + shiftOtPaise) / 100).toFixed(2)}`
    );
  }

  const rawGrossPaise = basePaiseAccumulated + overtimePaiseAccumulated;
  let finalNetPaise = rawGrossPaise;
  let roundingAdjustment = 0;

  // Apply configurable rounding
  if (config.roundingMode === 'nearest_rupee') {
    // Nearest multiple of 100 paise (₹1)
    finalNetPaise = Math.round(rawGrossPaise / 100) * 100;
    roundingAdjustment = finalNetPaise - rawGrossPaise;
  } else if (config.roundingMode === 'floor_rupee') {
    finalNetPaise = Math.floor(rawGrossPaise / 100) * 100;
    roundingAdjustment = finalNetPaise - rawGrossPaise;
  }

  trace.push(
    `Summary: ${regularHoursTotal.toFixed(2)} regular hrs (₹${(basePaiseAccumulated / 100).toFixed(2)}) + ` +
    `${dailyOvertimeHoursTotal.toFixed(2)} OT hrs (₹${(overtimePaiseAccumulated / 100).toFixed(2)}). ` +
    `Gross: ₹${(rawGrossPaise / 100).toFixed(2)}. Rounding (${config.roundingMode}): ₹${(roundingAdjustment / 100).toFixed(2)}. Net: ₹${(finalNetPaise / 100).toFixed(2)}.`
  );

  return {
    regularHoursTotal: Math.round(regularHoursTotal * 100) / 100,
    overtimeHoursTotal: Math.round(dailyOvertimeHoursTotal * 100) / 100,
    basePaise: basePaiseAccumulated,
    overtimePaise: overtimePaiseAccumulated,
    grossPaise: rawGrossPaise,
    roundingAdjustmentPaise: roundingAdjustment,
    netPaise: finalNetPaise,
    formulaTrace: trace,
    shiftsAnalyzedCount: sortedShifts.length,
  };
}
