/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sector Preset: Construction Site (Daily wage, Gate check-in, Scaffolding hazards)
 * NOTE: Illustrative default, not legal advice. Configure per local labor laws.
 */

export interface SectorConfig {
  id: string;
  name: string;
  disclaimer: string;
  terminology: {
    worker: string;
    supervisor: string;
    site: string;
    shift: string;
    workArea: string;
  };
  settings: Record<string, any>;
  hazardCategories: Array<{ id: string; label: string; icon: string }>;
  feedbackQuestions: Array<{ id: string; question: string }>;
}

export const CONSTRUCTION_PRESET: SectorConfig = {
  id: 'construction',
  name: 'Construction Site',
  disclaimer: 'Illustrative default, not legal advice. Configure per local labor laws.',
  terminology: {
    worker: 'Worker',
    supervisor: 'Site Foreman',
    site: 'Construction Site',
    shift: 'Daily Shift',
    workArea: 'Work Bay / Pier',
  },
  settings: {
    'org.terminology_preset': 'construction',
    'attendance.grace_minutes': 15,
    'attendance.break_deduction_minutes': 30,
    'attendance.geofence_radius_meters': 150,
    'attendance.auto_close_hours': 14,
    'attendance.qr_rotation_seconds': 30,
    'pay.daily_threshold_hours': 8.0,
    'pay.weekly_threshold_hours': 48.0,
    'pay.overtime_multiplier': 1.5,
    'pay.rounding_mode': 'nearest_rupee',
    'fatigue.max_daily_hours': 11.0,
    'fatigue.min_rest_between_shifts_hours': 11.0,
    'fatigue.max_consecutive_days': 6,
    'safety.sla_hours_critical': 2,
    'safety.sla_hours_medium': 12,
    'feedback.anonymity_threshold_floor': 5,
  },
  hazardCategories: [
    { id: 'fall_scaffold', label: 'Scaffolding / Fall Hazard', icon: 'Construction' },
    { id: 'electrical', label: 'Exposed Wiring / Electrical', icon: 'Zap' },
    { id: 'heavy_machinery', label: 'Excavator / Heavy Machine Risk', icon: 'Truck' },
    { id: 'falling_debris', label: 'Unsecured High Debris', icon: 'AlertTriangle' },
    { id: 'heat_exhaustion', label: 'Extreme Heat & No Shade', icon: 'Sun' },
    { id: 'ppe_missing', label: 'Missing Safety Boots/Harness', icon: 'ShieldAlert' },
  ],
  feedbackQuestions: [
    { id: 'q_water_shade', question: 'Are clean drinking water and shaded rest areas available on site?' },
    { id: 'q_safety_gear', question: 'Did you receive adequate personal protective equipment (PPE) for today?' },
    { id: 'q_foreman_respect', question: 'Were workers spoken to with respect and fairness by site foremen?' },
  ],
};
