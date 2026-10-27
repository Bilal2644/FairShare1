/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateFeedbackScores,
  checkDifferencingSafety,
} from './anonymity.ts';
import { FeedbackResponse } from '../types/index.ts';

test('aggregateFeedbackScores suppresses results when responses are below threshold', () => {
  // Only 2 responses for welders team
  const responses: FeedbackResponse[] = [
    {
      id: 'resp-1',
      cycleId: 'cycle-oct',
      departmentOrTeamId: 'team_welders',
      questionId: 'q_water',
      scoreRating: 5,
      submittedDayBucket: '2026-10-26',
    },
    {
      id: 'resp-2',
      cycleId: 'cycle-oct',
      departmentOrTeamId: 'team_welders',
      questionId: 'q_water',
      scoreRating: 4,
      submittedDayBucket: '2026-10-26',
    },
  ];

  // Requesting with default floor of 5
  const res = aggregateFeedbackScores(responses, 'team_welders', 5);
  assert.equal(res.isSuppressed, true);
  assert.equal(res.averageScore, undefined);
  assert.ok(res.suppressionReason?.includes('Minimum 5 responses required'));
});

test('aggregateFeedbackScores enforces hard floor of 3 even if admin configures lower', () => {
  const responses: FeedbackResponse[] = [
    {
      id: 'resp-1',
      cycleId: 'cycle-oct',
      departmentOrTeamId: 'team_cleaners',
      questionId: 'q_water',
      scoreRating: 5,
      submittedDayBucket: '2026-10-26',
    },
    {
      id: 'resp-2',
      cycleId: 'cycle-oct',
      departmentOrTeamId: 'team_cleaners',
      questionId: 'q_water',
      scoreRating: 4,
      submittedDayBucket: '2026-10-26',
    },
  ];

  // Admin tries to pass threshold = 1
  const res = aggregateFeedbackScores(responses, 'team_cleaners', 1);
  // Must enforce floor = 3, so 2 responses must still be suppressed
  assert.equal(res.isSuppressed, true);
  assert.ok(res.suppressionReason?.includes('Minimum 3 responses required'));
});

test('aggregateFeedbackScores returns computed aggregates when threshold met', () => {
  const responses: FeedbackResponse[] = [
    { id: '1', cycleId: 'c1', departmentOrTeamId: 'dept_a', questionId: 'q1', scoreRating: 5, submittedDayBucket: '2026-10-26' },
    { id: '2', cycleId: 'c1', departmentOrTeamId: 'dept_a', questionId: 'q1', scoreRating: 4, submittedDayBucket: '2026-10-26' },
    { id: '3', cycleId: 'c1', departmentOrTeamId: 'dept_a', questionId: 'q1', scoreRating: 3, submittedDayBucket: '2026-10-26' },
    { id: '4', cycleId: 'c1', departmentOrTeamId: 'dept_a', questionId: 'q1', scoreRating: 4, submittedDayBucket: '2026-10-26' },
    { id: '5', cycleId: 'c1', departmentOrTeamId: 'dept_a', questionId: 'q1', scoreRating: 5, submittedDayBucket: '2026-10-26' },
  ];

  const res = aggregateFeedbackScores(responses, 'dept_a', 5);
  assert.equal(res.isSuppressed, false);
  assert.equal(res.totalResponsesCount, 5);
  assert.equal(res.averageScore, 4.2); // (5+4+3+4+5)/5 = 21/5 = 4.2
  assert.equal(res.distribution?.positiveCount, 4);
  assert.equal(res.distribution?.neutralCount, 1);
});

test('checkDifferencingSafety detects dangerous single-individual differences', () => {
  // If Filter A has 10 responses and Filter B has 9 responses, diff is 1 => unsafe
  const unsafeCheck = checkDifferencingSafety(10, 9);
  assert.equal(unsafeCheck.safe, false);
  assert.ok(unsafeCheck.warning?.includes('Differencing attack protection'));

  // Difference of 5 is safe
  const safeCheck = checkDifferencingSafety(15, 10);
  assert.equal(safeCheck.safe, true);
});
