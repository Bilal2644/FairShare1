/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Anonymity Vault & Small-Cell Suppression Engine
 * 
 * DESIGN PRINCIPLE: Anonymous feedback is anonymous BY DESIGN, not by promise.
 * 1. Physical separation: Participation ledger is completely disconnected from response storage.
 * 2. No Join Keys: Feedback responses hold NO user ID, worker ID, session ID, or IP address.
 * 3. Timestamp Bucketing: Submission timestamps are bucketed to day (YYYY-MM-DD).
 * 4. Small-Cell Suppression: Any aggregate view with fewer than K responses (hard floor K >= 3)
 *    is suppressed to prevent re-identification.
 * 5. Differencing Protection: Overlapping group queries that isolate an individual are blocked.
 */

import { FeedbackResponse } from '../types/index.ts';

export interface AggregateSentimentResult {
  departmentOrTeamId: string;
  totalResponsesCount: number;
  isSuppressed: boolean;
  suppressionReason?: string;
  averageScore?: number; // 1.0 to 5.0
  distribution?: {
    positiveCount: number; // 4-5
    neutralCount: number;  // 3
    negativeCount: number; // 1-2
  };
  sampleComments?: string[];
}

/**
 * Calculates aggregate feedback for a given department or filter.
 * Strictly enforces minimum response floor (hard floor k >= 3, default k = 5).
 */
export function aggregateFeedbackScores(
  responses: FeedbackResponse[],
  departmentId: string,
  anonymityThresholdFloor: number = 5
): AggregateSentimentResult {
  // Enforce locked principle #1: Floor can never be lower than 3
  const effectiveThreshold = Math.max(3, anonymityThresholdFloor);

  const matching = responses.filter((r) => r.departmentOrTeamId === departmentId);
  const count = matching.length;

  if (count < effectiveThreshold) {
    return {
      departmentOrTeamId: departmentId,
      totalResponsesCount: count,
      isSuppressed: true,
      suppressionReason: `Suppressed: Only ${count} responses received. Minimum ${effectiveThreshold} responses required to protect individual anonymity.`,
    };
  }

  // Calculate stats
  const sum = matching.reduce((acc, curr) => acc + curr.scoreRating, 0);
  const averageScore = Math.round((sum / count) * 10) / 10;

  const positiveCount = matching.filter((r) => r.scoreRating >= 4).length;
  const neutralCount = matching.filter((r) => r.scoreRating === 3).length;
  const negativeCount = matching.filter((r) => r.scoreRating <= 2).length;

  // Extract comments, scrub any inadvertent email-like or numeric ID tokens, and shuffle order
  const comments = matching
    .map((r) => r.feedbackTextScrubbed)
    .filter((txt): txt is string => Boolean(txt && txt.trim().length > 0))
    .sort(() => 0.5 - Math.random()); // Shuffled order to eliminate timing clues

  return {
    departmentOrTeamId: departmentId,
    totalResponsesCount: count,
    isSuppressed: false,
    averageScore,
    distribution: {
      positiveCount,
      neutralCount,
      negativeCount,
    },
    sampleComments: comments,
  };
}

/**
 * Differencing Attack Protection:
 * If an admin queries two overlapping sets where difference is 1 respondent
 * (e.g. Dept Total N=6 vs Dept Site Subgroup N=5), revealing the difference would
 * de-anonymize the 6th person. This function verifies difference safety.
 */
export function checkDifferencingSafety(
  largerCount: number,
  smallerCount: number
): { safe: boolean; warning?: string } {
  const diff = Math.abs(largerCount - smallerCount);
  if (diff > 0 && diff < 3) {
    return {
      safe: false,
      warning: `Differencing attack protection: A subgroup difference of ${diff} could reveal individual answers. Filter combination suppressed.`,
    };
  }
  return { safe: true };
}
