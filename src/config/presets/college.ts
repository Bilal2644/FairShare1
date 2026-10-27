/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sector Preset: College / Campus Facility Staff (Monthly wages, Roster shifts, Sanitation/Electrical hazards)
 * NOTE: Illustrative default, not legal advice. Configure per local labor laws.
 */

import { SectorConfig } from './construction.ts';

export const COLLEGE_PRESET: SectorConfig = {
  id: 'college',
  name: 'College / Campus Facilities',
  disclaimer: 'Illustrative default, not legal advice. Configure per local labor laws.',
  terminology: {
    worker: 'Staff Member',
    supervisor: 'Facility In-Charge / HOD',
    site: 'College Campus',
    shift: 'Duty Period',
    workArea: 'Hostel / Academic Block',
  },
  settings: {
    'org.terminology_preset': 'college',
    'attendance.grace_minutes': 10,
    'attendance.break_deduction_minutes': 45,
    'attendance.geofence_radius_meters': 300,
    'attendance.auto_close_hours': 12,
    'attendance.qr_rotation_seconds': 45,
    'pay.daily_threshold_hours': 8.5,
    'pay.weekly_threshold_hours': 48.0,
    'pay.overtime_multiplier': 1.25,
    'pay.rounding_mode': 'nearest_rupee',
    'fatigue.max_daily_hours': 12.0,
    'fatigue.min_rest_between_shifts_hours': 10.0,
    'fatigue.max_consecutive_days': 6,
    'safety.sla_hours_critical': 4,
    'safety.sla_hours_medium': 24,
    'feedback.anonymity_threshold_floor': 5,
  },
  hazardCategories: [
    { id: 'electrical_fault', label: 'Hostel / Lab Electrical Fault', icon: 'Zap' },
    { id: 'wet_floor', label: 'Wet Corridor / Slip Hazard', icon: 'AlertTriangle' },
    { id: 'sanitation_breach', label: 'Sanitation / Water Contamination', icon: 'Droplets' },
    { id: 'chemical_exposure', label: 'Science Lab Chemical Fume', icon: 'FlaskConical' },
    { id: 'lighting_failure', label: 'Dark Perimeter / Lighting Failure', icon: 'Moon' },
  ],
  feedbackQuestions: [
    { id: 'q_roster_fairness', question: 'Are weekend and evening duty rosters distributed fairly among staff?' },
    { id: 'q_rest_cleanliness', question: 'Are campus staff restrooms clean and adequately maintained?' },
    { id: 'q_hod_support', question: 'Do department supervisors address maintenance requests promptly?' },
  ],
};
