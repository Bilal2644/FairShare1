/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateShiftDurationHours,
  evaluateWorkerPayroll,
  PayEngineConfig,
  ShiftInput,
} from './pay.ts';

test('calculateShiftDurationHours deducts break time accurately', () => {
  // 08:00 to 17:00 = 9 hours. 30 min break => 8.5 hours
  const start = '2026-10-26T08:00:00.000Z';
  const end = '2026-10-26T17:00:00.000Z';
  const hours = calculateShiftDurationHours(start, end, 30);
  assert.equal(hours, 8.5);
});

test('calculateShiftDurationHours handles shifts crossing midnight', () => {
  // 22:00 to 06:30 next day = 8.5 hours. 30 min break => 8.0 hours
  const start = '2026-10-26T22:00:00.000Z';
  const end = '2026-10-27T06:30:00.000Z';
  const hours = calculateShiftDurationHours(start, end, 30);
  assert.equal(hours, 8.0);
});

test('evaluateWorkerPayroll calculates regular vs daily overtime correctly', () => {
  const config: PayEngineConfig = {
    dailyThresholdHours: 8.0,
    weeklyThresholdHours: 48.0,
    overtimeMultiplier: 1.5,
    breakDeductionMinutes: 30,
    graceMinutes: 15,
    roundingMode: 'nearest_rupee',
  };

  // Shift with 10.5h elapsed - 30m break = 10.0h net
  // Expected: 8h regular + 2h overtime
  const shifts: ShiftInput[] = [
    {
      id: 'shift-1',
      workerId: 'w-1',
      startTimeUtc: '2026-10-26T08:00:00.000Z',
      endTimeUtc: '2026-10-26T18:30:00.000Z',
      hourlyRatePaise: 10000, // ₹100/hr = 10,000 paise
    },
  ];

  const result = evaluateWorkerPayroll(shifts, config);
  assert.equal(result.regularHoursTotal, 8.0);
  assert.equal(result.overtimeHoursTotal, 2.0);
  // Base: 8 * 10,000 = 80,000 paise (₹800)
  // OT: 2 * 15,000 = 30,000 paise (₹300)
  // Net: 110,000 paise (₹1,100)
  assert.equal(result.basePaise, 80000);
  assert.equal(result.overtimePaise, 30000);
  assert.equal(result.netPaise, 110000);
});

test('evaluateWorkerPayroll does not double count daily overtime against weekly overtime', () => {
  const config: PayEngineConfig = {
    dailyThresholdHours: 8.0,
    weeklyThresholdHours: 40.0,
    overtimeMultiplier: 1.5,
    breakDeductionMinutes: 0,
    graceMinutes: 0,
    roundingMode: 'nearest_rupee',
  };

  // 5 days of 10-hour shifts (total 50 hours)
  // Daily regular per day = 8h (total 40h regular)
  // Daily OT per day = 2h (total 10h daily OT)
  // Weekly threshold is 40h. Regular hours reached 40h exactly.
  // Total regular must be 40h, total OT must be 10h (no double counting).
  const shifts: ShiftInput[] = [];
  for (let i = 1; i <= 5; i++) {
    shifts.push({
      id: `shift-day-${i}`,
      workerId: 'w-1',
      startTimeUtc: `2026-10-2${i}T08:00:00.000Z`,
      endTimeUtc: `2026-10-2${i}T18:00:00.000Z`,
      hourlyRatePaise: 10000,
    });
  }

  const result = evaluateWorkerPayroll(shifts, config);
  assert.equal(result.regularHoursTotal, 40.0);
  assert.equal(result.overtimeHoursTotal, 10.0);
});

test('evaluateWorkerPayroll applies nearest rupee integer rounding', () => {
  const config: PayEngineConfig = {
    dailyThresholdHours: 8.0,
    weeklyThresholdHours: 48.0,
    overtimeMultiplier: 1.5,
    breakDeductionMinutes: 0,
    graceMinutes: 0,
    roundingMode: 'nearest_rupee',
  };

  // 1 hour at rate of ₹99.75 (9975 paise)
  const shifts: ShiftInput[] = [
    {
      id: 'shift-odd-cents',
      workerId: 'w-1',
      startTimeUtc: '2026-10-26T08:00:00.000Z',
      endTimeUtc: '2026-10-26T09:00:00.000Z',
      hourlyRatePaise: 9975,
    },
  ];

  const result = evaluateWorkerPayroll(shifts, config);
  assert.equal(result.grossPaise, 9975);
  // Nearest rupee to 9975 paise is 10000 paise (₹100)
  assert.equal(result.netPaise, 10000);
  assert.equal(result.roundingAdjustmentPaise, 25);
});
