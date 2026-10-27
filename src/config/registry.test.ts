/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateSetting,
  resolveSetting,
  SETTINGS_REGISTRY,
} from './registry.ts';

test('validateSetting rejects violation of locked principle #1 (anonymity floor < 3)', () => {
  const result = validateSetting('feedback.anonymity_threshold_floor', 2);
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('VIOLATION OF LOCKED PRINCIPLE'));
});

test('validateSetting accepts valid values within registry bounds', () => {
  const result = validateSetting('pay.overtime_multiplier', 2.0);
  assert.equal(result.valid, true);
});

test('validateSetting rejects values outside allowed range', () => {
  const result = validateSetting('attendance.grace_minutes', 120); // max is 60
  assert.equal(result.valid, false);
  assert.ok(result.error?.includes('above maximum allowed'));
});

test('resolveSetting respects precedence order: System -> Preset -> Org -> Site -> Worker', () => {
  const presets = {
    'attendance.grace_minutes': 15,
  };
  const orgOverrides = {
    'attendance.grace_minutes': 20,
  };
  const siteOverrides = {
    'attendance.grace_minutes': 25,
  };

  // With site override present, site takes precedence
  const resolvedWithSite = resolveSetting<number>(
    'attendance.grace_minutes',
    presets,
    orgOverrides,
    siteOverrides
  );
  assert.equal(resolvedWithSite, 25);

  // Without site override, org override takes precedence
  const resolvedWithOrg = resolveSetting<number>(
    'attendance.grace_minutes',
    presets,
    orgOverrides,
    undefined
  );
  assert.equal(resolvedWithOrg, 20);

  // Without org override, preset takes precedence
  const resolvedWithPreset = resolveSetting<number>(
    'attendance.grace_minutes',
    presets,
    {},
    undefined
  );
  assert.equal(resolvedWithPreset, 15);
});
