/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Explainable Retention & Friction Risk Heuristic
 * Aligned with UN SDG 8 (Decent Work): Evaluates workplace friction factors
 * (chronic overtime, unresolved hazard tickets, unaddressed pay queries)
 * to encourage proactive supportive check-ins by employers.
 * 
 * ETHICAL MANDATE: This rule-based heuristic highlights systemic workplace friction.
 * It is NOT predictive machine learning and must NEVER be used for disciplinary action.
 */

import { RetentionRiskItem } from '../types/index.ts';

export interface WorkerFrictionData {
  workerId: string;
  workerName: string;
  departmentOrTeam: string;
  consecutiveOvertimeShiftsLast14Days: number; // e.g. 5
  openHazardReportsInWorkArea: number; // e.g. 2
  unresolvedPayQueriesCount: number; // e.g. 1
  attendanceDropPercentage: number; // e.g. 20 (percent drop vs prior month)
}

export interface RiskHeuristicWeights {
  overtimeWeight: number; // e.g. 7 points per excessive OT shift
  hazardWeight: number; // e.g. 15 points per open hazard
  payDisputeWeight: number; // e.g. 25 points per unresolved pay query
  attendanceDropWeight: number; // e.g. 1 point per percent drop
  highRiskThreshold: number; // e.g. 65
}

export const DEFAULT_RISK_WEIGHTS: RiskHeuristicWeights = {
  overtimeWeight: 6,
  hazardWeight: 14,
  payDisputeWeight: 20,
  attendanceDropWeight: 0.8,
  highRiskThreshold: 60,
};

export function evaluateWorkerFrictionRisk(
  data: WorkerFrictionData,
  weights: RiskHeuristicWeights = DEFAULT_RISK_WEIGHTS
): RetentionRiskItem {
  let score = 0;
  const factors: RetentionRiskItem['factors'] = [];

  // 1. Chronic Overtime Friction
  if (data.consecutiveOvertimeShiftsLast14Days >= 3) {
    const pts = Math.min(30, Math.round(data.consecutiveOvertimeShiftsLast14Days * weights.overtimeWeight));
    score += pts;
    factors.push({
      factorName: 'Chronic Overtime Stress',
      pointsAdded: pts,
      description: `${data.consecutiveOvertimeShiftsLast14Days} shifts with overtime in past 14 days indicate potential burnout.`,
    });
  }

  // 2. Unresolved Workplace Hazards in Work Area
  if (data.openHazardReportsInWorkArea > 0) {
    const pts = Math.min(30, Math.round(data.openHazardReportsInWorkArea * weights.hazardWeight));
    score += pts;
    factors.push({
      factorName: 'Workplace Hazard Friction',
      pointsAdded: pts,
      description: `${data.openHazardReportsInWorkArea} unaddressed safety/hazard ticket(s) in their assigned area.`,
    });
  }

  // 3. Unresolved Pay Queries (Trust in Compensation)
  if (data.unresolvedPayQueriesCount > 0) {
    const pts = Math.min(35, Math.round(data.unresolvedPayQueriesCount * weights.payDisputeWeight));
    score += pts;
    factors.push({
      factorName: 'Pending Pay Dispute',
      pointsAdded: pts,
      description: `${data.unresolvedPayQueriesCount} unresolved wage/overtime dispute inquiry pending review.`,
    });
  }

  // 4. Attendance Pattern Softening
  if (data.attendanceDropPercentage >= 15) {
    const pts = Math.min(25, Math.round(data.attendanceDropPercentage * weights.attendanceDropWeight));
    score += pts;
    factors.push({
      factorName: 'Attendance Trend Drop',
      pointsAdded: pts,
      description: `Attendance dropped by ${data.attendanceDropPercentage}% compared to prior baseline.`,
    });
  }

  const normalizedScore = Math.min(100, Math.max(0, score));
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (normalizedScore >= weights.highRiskThreshold) {
    riskLevel = 'HIGH';
  } else if (normalizedScore >= 35) {
    riskLevel = 'MEDIUM';
  }

  return {
    workerId: data.workerId,
    workerName: data.workerName,
    teamOrDepartment: data.departmentOrTeam,
    riskLevel,
    compositeScore: normalizedScore,
    factors,
  };
}
