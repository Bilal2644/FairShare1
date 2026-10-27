/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role } from '../types/index.ts';

export type SettingType = 'string' | 'number' | 'boolean' | 'select' | 'json';
export type SettingScope = 'system' | 'preset' | 'organisation' | 'site' | 'worker';
export type FeatureCategory = 
  | 'identity'
  | 'roles'
  | 'languages'
  | 'attendance'
  | 'pay'
  | 'fatigue'
  | 'safety'
  | 'feedback'
  | 'risk'
  | 'dashboard'
  | 'notifications'
  | 'privacy';

export interface RegistryItem<T = any> {
  key: string;
  type: SettingType;
  default: T;
  allowedRange?: {
    min?: number;
    max?: number;
    options?: string[];
  };
  scope: SettingScope;
  rolesAllowedToEdit: Role[];
  feature: FeatureCategory;
  labelKey: string;
  helpKey: string;
  riskLevel: 'low' | 'medium' | 'high';
  isLockedPrinciple?: boolean; // Cannot violate locked ethics
}

export const SETTINGS_REGISTRY: Record<string, RegistryItem> = {
  // 1. Identity and Branding
  'org.name': {
    key: 'org.name',
    type: 'string',
    default: 'FairShift Worksite',
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin', 'superadmin'],
    feature: 'identity',
    labelKey: 'settings.org_name.label',
    helpKey: 'settings.org_name.help',
    riskLevel: 'low',
  },
  'org.terminology_preset': {
    key: 'org.terminology_preset',
    type: 'select',
    default: 'construction',
    allowedRange: { options: ['construction', 'college', 'hospital', 'factory'] },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin', 'superadmin'],
    feature: 'identity',
    labelKey: 'settings.terminology.label',
    helpKey: 'settings.terminology.help',
    riskLevel: 'low',
  },
  'org.primary_color': {
    key: 'org.primary_color',
    type: 'string',
    default: '#1e3a8a',
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'identity',
    labelKey: 'settings.primary_color.label',
    helpKey: 'settings.primary_color.help',
    riskLevel: 'low',
  },

  // 2. Roles and Access
  'roles.supervisor_can_approve_ot': {
    key: 'roles.supervisor_can_approve_ot',
    type: 'boolean',
    default: true,
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'roles',
    labelKey: 'settings.roles_approve_ot.label',
    helpKey: 'settings.roles_approve_ot.help',
    riskLevel: 'medium',
  },
  'roles.view_retention_risk': {
    key: 'roles.view_retention_risk',
    type: 'select',
    default: 'org_admin_only',
    allowedRange: { options: ['org_admin_only', 'org_admin_and_supervisors'] },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'roles',
    labelKey: 'settings.view_risk.label',
    helpKey: 'settings.view_risk.help',
    riskLevel: 'high',
  },

  // 3. Languages
  'i18n.default_language': {
    key: 'i18n.default_language',
    type: 'select',
    default: 'en',
    allowedRange: { options: ['en', 'ta', 'hi'] },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'languages',
    labelKey: 'settings.default_lang.label',
    helpKey: 'settings.default_lang.help',
    riskLevel: 'low',
  },

  // 4. Shifts and Attendance
  'attendance.grace_minutes': {
    key: 'attendance.grace_minutes',
    type: 'number',
    default: 15,
    allowedRange: { min: 0, max: 60 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin', 'site_supervisor'],
    feature: 'attendance',
    labelKey: 'settings.grace_mins.label',
    helpKey: 'settings.grace_mins.help',
    riskLevel: 'low',
  },
  'attendance.break_deduction_minutes': {
    key: 'attendance.break_deduction_minutes',
    type: 'number',
    default: 30,
    allowedRange: { min: 0, max: 120 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'attendance',
    labelKey: 'settings.break_mins.label',
    helpKey: 'settings.break_mins.help',
    riskLevel: 'medium',
  },
  'attendance.geofence_radius_meters': {
    key: 'attendance.geofence_radius_meters',
    type: 'number',
    default: 100,
    allowedRange: { min: 20, max: 2000 },
    scope: 'site',
    rolesAllowedToEdit: ['org_admin', 'site_supervisor'],
    feature: 'attendance',
    labelKey: 'settings.geofence_radius.label',
    helpKey: 'settings.geofence_radius.help',
    riskLevel: 'low',
  },
  'attendance.allow_outside_geofence': {
    key: 'attendance.allow_outside_geofence',
    type: 'boolean',
    default: true,
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'attendance',
    labelKey: 'settings.allow_outside_geo.label',
    helpKey: 'settings.allow_outside_geo.help',
    riskLevel: 'medium',
  },
  'attendance.auto_close_hours': {
    key: 'attendance.auto_close_hours',
    type: 'number',
    default: 14,
    allowedRange: { min: 8, max: 24 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'attendance',
    labelKey: 'settings.auto_close_hrs.label',
    helpKey: 'settings.auto_close_hrs.help',
    riskLevel: 'high',
  },
  'attendance.qr_rotation_seconds': {
    key: 'attendance.qr_rotation_seconds',
    type: 'number',
    default: 30,
    allowedRange: { min: 10, max: 120 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'attendance',
    labelKey: 'settings.qr_rotation.label',
    helpKey: 'settings.qr_rotation.help',
    riskLevel: 'low',
  },

  // 5. Pay & Wages
  'pay.daily_threshold_hours': {
    key: 'pay.daily_threshold_hours',
    type: 'number',
    default: 8.0,
    allowedRange: { min: 4.0, max: 12.0 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'pay',
    labelKey: 'settings.daily_threshold.label',
    helpKey: 'settings.daily_threshold.help',
    riskLevel: 'high',
  },
  'pay.weekly_threshold_hours': {
    key: 'pay.weekly_threshold_hours',
    type: 'number',
    default: 48.0,
    allowedRange: { min: 30.0, max: 60.0 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'pay',
    labelKey: 'settings.weekly_threshold.label',
    helpKey: 'settings.weekly_threshold.help',
    riskLevel: 'high',
  },
  'pay.overtime_multiplier': {
    key: 'pay.overtime_multiplier',
    type: 'number',
    default: 1.5,
    allowedRange: { min: 1.0, max: 3.0 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'pay',
    labelKey: 'settings.ot_multiplier.label',
    helpKey: 'settings.ot_multiplier.help',
    riskLevel: 'high',
  },
  'pay.currency_symbol': {
    key: 'pay.currency_symbol',
    type: 'string',
    default: '₹',
    scope: 'system',
    rolesAllowedToEdit: ['superadmin'],
    feature: 'pay',
    labelKey: 'settings.currency_symbol.label',
    helpKey: 'settings.currency_symbol.help',
    riskLevel: 'low',
  },
  'pay.rounding_mode': {
    key: 'pay.rounding_mode',
    type: 'select',
    default: 'nearest_rupee',
    allowedRange: { options: ['nearest_rupee', 'floor_rupee', 'exact_paise'] },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'pay',
    labelKey: 'settings.rounding_mode.label',
    helpKey: 'settings.rounding_mode.help',
    riskLevel: 'medium',
  },

  // 6. Fatigue
  'fatigue.max_daily_hours': {
    key: 'fatigue.max_daily_hours',
    type: 'number',
    default: 11.0,
    allowedRange: { min: 8.0, max: 16.0 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'fatigue',
    labelKey: 'settings.fatigue_max_daily.label',
    helpKey: 'settings.fatigue_max_daily.help',
    riskLevel: 'high',
  },
  'fatigue.min_rest_between_shifts_hours': {
    key: 'fatigue.min_rest_between_shifts_hours',
    type: 'number',
    default: 11.0,
    allowedRange: { min: 8.0, max: 16.0 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'fatigue',
    labelKey: 'settings.fatigue_min_rest.label',
    helpKey: 'settings.fatigue_min_rest.help',
    riskLevel: 'high',
  },
  'fatigue.max_consecutive_days': {
    key: 'fatigue.max_consecutive_days',
    type: 'number',
    default: 6,
    allowedRange: { min: 4, max: 10 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'fatigue',
    labelKey: 'settings.fatigue_max_days.label',
    helpKey: 'settings.fatigue_max_days.help',
    riskLevel: 'high',
  },

  // 7. Safety & Hazards
  'safety.sla_hours_critical': {
    key: 'safety.sla_hours_critical',
    type: 'number',
    default: 2,
    allowedRange: { min: 1, max: 12 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'safety',
    labelKey: 'settings.safety_sla_crit.label',
    helpKey: 'settings.safety_sla_crit.help',
    riskLevel: 'high',
  },
  'safety.sla_hours_medium': {
    key: 'safety.sla_hours_medium',
    type: 'number',
    default: 24,
    allowedRange: { min: 4, max: 72 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'safety',
    labelKey: 'settings.safety_sla_med.label',
    helpKey: 'settings.safety_sla_med.help',
    riskLevel: 'medium',
  },
  'safety.allow_anonymous_reports': {
    key: 'safety.allow_anonymous_reports',
    type: 'boolean',
    default: true,
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'safety',
    labelKey: 'settings.safety_allow_anon.label',
    helpKey: 'settings.safety_allow_anon.help',
    riskLevel: 'medium',
  },

  // 8. Anonymous Feedback (LOCKED PRINCIPLES ENFORCED)
  'feedback.anonymity_threshold_floor': {
    key: 'feedback.anonymity_threshold_floor',
    type: 'number',
    default: 5,
    allowedRange: { min: 3, max: 20 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'feedback',
    labelKey: 'settings.anon_floor.label',
    helpKey: 'settings.anon_floor.help',
    riskLevel: 'high',
    isLockedPrinciple: true, // Floor can NEVER be < 3 per Locked Principle #1
  },
  'feedback.allow_free_text': {
    key: 'feedback.allow_free_text',
    type: 'boolean',
    default: true,
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'feedback',
    labelKey: 'settings.feedback_free_text.label',
    helpKey: 'settings.feedback_free_text.help',
    riskLevel: 'medium',
  },

  // 9. Retention Risk Heuristic
  'risk.high_threshold_score': {
    key: 'risk.high_threshold_score',
    type: 'number',
    default: 65,
    allowedRange: { min: 40, max: 90 },
    scope: 'organisation',
    rolesAllowedToEdit: ['org_admin'],
    feature: 'risk',
    labelKey: 'settings.risk_threshold.label',
    helpKey: 'settings.risk_threshold.help',
    riskLevel: 'medium',
  },

  // 10. Worker Personal Preferences (Layer B)
  'worker.simple_mode': {
    key: 'worker.simple_mode',
    type: 'boolean',
    default: false,
    scope: 'worker',
    rolesAllowedToEdit: ['worker'],
    feature: 'accessibility',
    labelKey: 'settings.simple_mode.label',
    helpKey: 'settings.simple_mode.help',
    riskLevel: 'low',
  },
  'worker.text_size': {
    key: 'worker.text_size',
    type: 'select',
    default: 'normal',
    allowedRange: { options: ['normal', 'large', 'xlarge', 'max'] },
    scope: 'worker',
    rolesAllowedToEdit: ['worker'],
    feature: 'accessibility',
    labelKey: 'settings.text_size.label',
    helpKey: 'settings.text_size.help',
    riskLevel: 'low',
  },
};

/**
 * Validates a proposed configuration change against Registry Schema & Locked Principles
 */
export function validateSetting(key: string, value: any): { valid: boolean; error?: string } {
  const item = SETTINGS_REGISTRY[key];
  if (!item) {
    return { valid: false, error: `Unknown configuration key: "${key}"` };
  }

  // Type check
  if (item.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) return { valid: false, error: `Value for ${key} must be a valid number` };
    if (item.allowedRange?.min !== undefined && num < item.allowedRange.min) {
      // Locked principle check
      if (item.isLockedPrinciple && key === 'feedback.anonymity_threshold_floor' && num < 3) {
        return { valid: false, error: `VIOLATION OF LOCKED PRINCIPLE: Anonymity threshold floor cannot be set lower than 3.` };
      }
      return { valid: false, error: `Value ${num} is below minimum allowed ${item.allowedRange.min}` };
    }
    if (item.allowedRange?.max !== undefined && num > item.allowedRange.max) {
      return { valid: false, error: `Value ${num} is above maximum allowed ${item.allowedRange.max}` };
    }
  }

  if (item.type === 'boolean' && typeof value !== 'boolean') {
    return { valid: false, error: `Value for ${key} must be boolean` };
  }

  if (item.type === 'select' && item.allowedRange?.options) {
    if (!item.allowedRange.options.includes(value)) {
      return { valid: false, error: `Invalid option "${value}". Allowed: ${item.allowedRange.options.join(', ')}` };
    }
  }

  return { valid: true };
}

/**
 * Resolves configuration following:
 * System Default -> Sector Preset -> Org Override -> Site Override -> Worker Personalization
 */
export function resolveSetting<T>(
  key: string,
  presets: Record<string, any>,
  orgOverrides: Record<string, any>,
  siteOverrides?: Record<string, any>,
  workerOverrides?: Record<string, any>
): T {
  const registryItem = SETTINGS_REGISTRY[key];
  const systemDefault = registryItem ? (registryItem.default as T) : undefined;
  const presetValue = presets[key];
  const orgValue = orgOverrides[key];
  const siteValue = siteOverrides ? siteOverrides[key] : undefined;
  const workerValue = workerOverrides ? workerOverrides[key] : undefined;

  // Worker preferences cannot be force-overridden by Org if scope is 'worker'
  if (registryItem?.scope === 'worker' && workerValue !== undefined) {
    return workerValue as T;
  }

  if (siteValue !== undefined) return siteValue as T;
  if (orgValue !== undefined) return orgValue as T;
  if (presetValue !== undefined) return presetValue as T;
  return systemDefault as T;
}
