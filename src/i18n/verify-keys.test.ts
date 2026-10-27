/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Verifies that all translation keys present in English (en) exist in Tamil (ta) and Hindi (hi).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import enDict from './locales/en.json';
import taDict from './locales/ta.json';
import hiDict from './locales/hi.json';

test('i18n completeness: Tamil (ta) contains all keys present in English (en)', () => {
  const enKeys = Object.keys(enDict);
  const taKeys = new Set(Object.keys(taDict));
  const missing = enKeys.filter((k) => !taKeys.has(k));
  assert.equal(missing.length, 0, `Missing keys in Tamil: ${missing.join(', ')}`);
});

test('i18n completeness: Hindi (hi) contains all keys present in English (en)', () => {
  const enKeys = Object.keys(enDict);
  const hiKeys = new Set(Object.keys(hiDict));
  const missing = enKeys.filter((k) => !hiKeys.has(k));
  assert.equal(missing.length, 0, `Missing keys in Hindi: ${missing.join(', ')}`);
});
