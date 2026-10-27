/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'superadmin' | 'org_admin' | 'site_supervisor' | 'worker';
export type SectorPresetId = 'construction' | 'college' | 'hospital' | 'factory';
export type Language = 'en' | 'ta' | 'hi';
export type TextSize = 'normal' | 'large' | 'xlarge' | 'max';
export type ThemeMode = 'standard' | 'high_contrast_light' | 'high_contrast_dark';

export interface WorkerProfile {
  id: string;
  orgId: string;
  siteId: string;
  workerCode: string; // e.g. "1042"
  fullName: string;
  role: Role;
  designation: string; // e.g. "Welder Grade 1" or "Campus Sanitation Lead"
  pin: string; // 4-digit PIN
  phoneLast4: string;
  preferredLanguage: Language;
  dailyBaseWagePaise: number; // In minor units (paise)
  hourlyBaseWagePaise: number;
  avatarSeed?: string;
  createdAt: string;
}

export interface Site {
  id: string;
  orgId: string;
  name: string;
  geofenceLat: number;
  geofenceLng: number;
  geofenceRadiusMeters: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  sectorPreset: SectorPresetId;
  createdAt: string;
}

export type ShiftStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FLAGGED_PENDING_REVIEW' | 'AUTO_CLOSED';
export type CheckInMethod = 'qr_scan' | 'geofence_self' | 'supervisor_badge_scan' | 'manual_override';

export interface ShiftRecord {
  id: string;
  orgId: string;
  siteId: string;
  workerId: string;
  startTimeUtc: string; // ISO-8601 UTC
  endTimeUtc?: string; // ISO-8601 UTC
  workDayDate: string; // YYYY-MM-DD derived from shift start in org timezone
  status: ShiftStatus;
  checkInMethod: CheckInMethod;
  checkInLat?: number;
  checkInLng?: number;
  isWithinGeofence: boolean;
  breakDeductedMinutes: number;
  regularHours: number;
  overtimeHours: number;
  verifiedBySupervisorId?: string;
  flagReason?: string;
  idempotencyKey: string;
}

export interface PayslipLineItem {
  id: string;
  labelKey: string;
  hours?: number;
  ratePaise?: number;
  amountPaise: number;
  type: 'base' | 'overtime' | 'allowance' | 'deduction' | 'adjustment';
}

export interface Payslip {
  id: string;
  orgId: string;
  workerId: string;
  payPeriodId: string;
  payPeriodLabel: string;
  startDate: string;
  endDate: string;
  regularHoursTotal: number;
  overtimeHoursTotal: number;
  basePaise: number;
  overtimePaise: number;
  allowancesPaise: number;
  deductionsPaise: number;
  netPaise: number;
  ruleVersion: string;
  formulaSnapshotJson: string;
  lineItems: PayslipLineItem[];
  isLocked: boolean;
  createdAt: string;
}

export interface PayQuery {
  id: string;
  payslipId: string;
  workerId: string;
  workerName: string;
  queryType: 'missing_overtime' | 'rate_dispute' | 'deduction_query' | 'other';
  message: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  adjustmentPaise?: number;
  resolutionNote?: string;
  resolvedBySupervisorId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type HazardSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HazardStatus = 'SUBMITTED' | 'INSPECTING' | 'RECTIFYING' | 'RESOLVED' | 'ESCALATED';

export interface HazardReport {
  id: string;
  orgId: string;
  siteId: string;
  reporterWorkerId?: string | null; // NULL if anonymous
  reporterName?: string; // "Anonymous Worker" if anonymous
  isAnonymous: boolean;
  category: string;
  severity: HazardSeverity;
  description: string;
  photoUrl?: string;
  audioNoteDurationSeconds?: number;
  status: HazardStatus;
  targetResponseHours: number;
  createdAt: string; // ISO-8601 UTC
  slaBreachAt: string; // ISO-8601 UTC
  escalatedAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface FatigueAlert {
  id: string;
  orgId: string;
  workerId: string;
  workerName: string;
  shiftId: string;
  ruleId: 'RULE_MAX_DAILY_HOURS' | 'RULE_MIN_REST_BETWEEN_SHIFTS' | 'RULE_MAX_CONSECUTIVE_DAYS' | 'RULE_NIGHT_SHIFT_RECOVERY';
  ruleDescription: string;
  thresholdValue: number;
  actualValue: number;
  unit: string;
  severity: 'WARNING' | 'CRITICAL';
  isAcknowledged: boolean;
  acknowledgedById?: string;
  acknowledgeNote?: string;
  snoozedUntilUtc?: string;
  createdAt: string;
}

// Truly Anonymous Feedback Models (Separated by Design)
export interface FeedbackCycle {
  id: string;
  orgId: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface FeedbackParticipation {
  id: string;
  cycleId: string;
  workerId: string;
  submittedDayBucket: string; // e.g. "2026-10-26"
}

export interface FeedbackResponse {
  id: string;
  cycleId: string;
  departmentOrTeamId: string; // e.g. "team_welders" or "dept_sanitation"
  questionId: string;
  scoreRating: number; // 1-5 or 1-3
  feedbackTextScrubbed?: string;
  submittedDayBucket: string; // YYYY-MM-DD
}

export interface RetentionRiskItem {
  workerId: string;
  workerName: string;
  teamOrDepartment: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  compositeScore: number; // 0 - 100
  factors: Array<{
    factorName: string;
    pointsAdded: number;
    description: string;
  }>;
}

export interface SettingsAuditEntry {
  id: string;
  orgId: string;
  changedByUserId: string;
  settingKey: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestampUtc: string;
}
