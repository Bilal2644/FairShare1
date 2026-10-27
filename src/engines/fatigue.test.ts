/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateWorkerFatigue,
  FatigueEngineConfig,
  ShiftFatigueInput,
} from './fatigue.ts';

const testConfig: FatigueEngineConfig = {
  maxDailyHours: 11.0,
  minRestBetweenShiftsHours: 11.0,
  maxConsecutiveDays: 6,
};

test('evaluateWorkerFatigue flags shift exceeding max daily hours', () => {
  const shifts: ShiftFatigueInput[] = [
    {
      id: 'shift-long',
      workerId: 'w-101',
      workerName: 'Ramesh K',
      startTimeUtc: '2026-10-26T06:00:00.000Z',
      endTimeUtc: '2026-10-26T18:30:00.000Z', // 12.5 hours
      workDayDate: '2026-10-26',
    },
  ];

  const alerts = evaluateWorkerFatigue(shifts, testConfig);
  assert.equal(alerts.length, 1);
  assert.equal(alerts[0].ruleId, 'RULE_MAX_DAILY_HOURS');
  assert.equal(alerts[0].actualValue, 12.5);
  assert.equal(alerts[0].thresholdValue, 11.0);
});

test('evaluateWorkerFatigue flags turnaround rest under minimum hours', () => {
  const shifts: ShiftFatigueInput[] = [
    {
      id: 'shift-1',
      workerId: 'w-101',
      workerName: 'Ramesh K',
      startTimeUtc: '2026-10-26T08:00:00.000Z',
      endTimeUtc: '2026-10-26T20:00:00.000Z', // Ends at 20:00
      workDayDate: '2026-10-26',
    },
    {
      id: 'shift-2',
      workerId: 'w-101',
      workerName: 'Ramesh K',
      startTimeUtc: '2026-10-27T04:00:00.000Z', // Starts at 04:00 next day => 8h rest
      endTimeUtc: '2026-10-27T12:00:00.000Z',
      workDayDate: '2026-10-27',
    },
  ];

  const alerts = evaluateWorkerFatigue(shifts, testConfig);
  const restAlert = alerts.find((a) => a.ruleId === 'RULE_MIN_REST_BETWEEN_SHIFTS');
  assert.ok(restAlert);
  assert.equal(restAlert.actualValue, 8.0);
  assert.equal(restAlert.thresholdValue, 11.0);
});

test('evaluateWorkerFatigue flags consecutive working days breach', () => {
  // 7 consecutive days without a day off
  const shifts: ShiftFatigueInput[] = [];
  for (let i = 1; i <= 7; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    shifts.push({
      id: `shift-day-${i}`,
      workerId: 'w-101',
      workerName: 'Ramesh K',
      startTimeUtc: `2026-10-${dayStr}T08:00:00.000Z`,
      endTimeUtc: `2026-10-${dayStr}T16:00:00.000Z`,
      workDayDate: `2026-10-${dayStr}`,
    });
  }

  const alerts = evaluateWorkerFatigue(shifts, testConfig);
  const consecutiveAlert = alerts.find((a) => a.ruleId === 'RULE_MAX_CONSECUTIVE_DAYS');
  assert.ok(consecutiveAlert);
  assert.equal(consecutiveAlert.actualValue, 7);
  assert.equal(consecutiveAlert.thresholdValue, 6);
});
