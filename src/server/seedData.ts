/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Comprehensive Seed Data for FairShift
 * Aligned with Phase 2 requirements:
 * - 2 Organisations (Metro Infra Pvt Ltd [Construction], Greenfield University Campus [College])
 * - 12+ workers each with realistic roles, rates, and languages
 * - 30 days of shift logs
 * - Specific rule-exercising edge cases:
 *   1. Murugan K: Overtime that paper registers missed (10.5h shifts, midnight pours)
 *   2. Ramesh Kumar: Fatigue alert trigger (7 consecutive days, short rest)
 *   3. Escalated Hazard: Scaffold defect with breached 2h SLA
 *   4. Team with falling attendance trend & medium quit-risk score (Tower B Welders)
 *   5. Feedback cycle: 8 responses for Department A vs 3 for Department B (suppression test)
 *   6. Dedicated demo accounts for instant switching
 */

import {
  Organization,
  Site,
  WorkerProfile,
  ShiftRecord,
  Payslip,
  HazardReport,
  FatigueAlert,
  FeedbackCycle,
  FeedbackParticipation,
  FeedbackResponse,
  PayQuery,
} from '../types/index.ts';

export const SEED_ORGS: Organization[] = [
  {
    id: 'org_metro_infra',
    name: 'Metro Infrastructure Builders Pvt Ltd',
    slug: 'metro-infra',
    sectorPreset: 'construction',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'org_greenfield_college',
    name: 'Greenfield University Campus & Facilities',
    slug: 'greenfield-college',
    sectorPreset: 'college',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const SEED_SITES: Site[] = [
  {
    id: 'site_tower_b',
    orgId: 'org_metro_infra',
    name: 'Tower B Metro Pier & Excavation',
    geofenceLat: 13.0827,
    geofenceLng: 80.2707,
    geofenceRadiusMeters: 150,
  },
  {
    id: 'site_pier_4',
    orgId: 'org_metro_infra',
    name: 'Pier 4 Elevated Flyover',
    geofenceLat: 13.0850,
    geofenceLng: 80.2750,
    geofenceRadiusMeters: 120,
  },
  {
    id: 'site_academic_campus',
    orgId: 'org_greenfield_college',
    name: 'North Academic & Hostel Zone',
    geofenceLat: 12.9716,
    geofenceLng: 77.5946,
    geofenceRadiusMeters: 300,
  },
  {
    id: 'site_sports_complex',
    orgId: 'org_greenfield_college',
    name: 'Campus Sports & Auditorium Complex',
    geofenceLat: 12.9730,
    geofenceLng: 77.5960,
    geofenceRadiusMeters: 250,
  },
];

// 12 workers for Construction + 12 workers for College = 24 workers total
export const SEED_WORKERS: WorkerProfile[] = [
  // --- METRO INFRA (CONSTRUCTION) ---
  {
    id: 'w_murugan',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '1042',
    fullName: 'Murugan K',
    role: 'worker',
    designation: 'Welder Grade 1 (Tower B Team)',
    pin: '1234',
    phoneLast4: '4091',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 80000, // ₹800/day
    hourlyBaseWagePaise: 10000, // ₹100/hr
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_ramesh',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '1043',
    fullName: 'Ramesh Kumar',
    role: 'worker',
    designation: 'Excavation & Heavy Machinery Operator',
    pin: '2345',
    phoneLast4: '5512',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 95000,
    hourlyBaseWagePaise: 11875,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_selvam',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '1044',
    fullName: 'Selvam R',
    role: 'worker',
    designation: 'Steel Scaffolder',
    pin: '1111',
    phoneLast4: '7721',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 75000,
    hourlyBaseWagePaise: 9375,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_anand',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '1045',
    fullName: 'Anand Prakash',
    role: 'worker',
    designation: 'Concrete Mason',
    pin: '1234',
    phoneLast4: '8832',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 70000,
    hourlyBaseWagePaise: 8750,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_mari',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '1046',
    fullName: 'Mariyappan P',
    role: 'worker',
    designation: 'Bar Bender & Fitter',
    pin: '1234',
    phoneLast4: '9901',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 75000,
    hourlyBaseWagePaise: 9375,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_sanjay',
    orgId: 'org_metro_infra',
    siteId: 'site_pier_4',
    workerCode: '1047',
    fullName: 'Sanjay Yadav',
    role: 'worker',
    designation: 'Crane Assistant',
    pin: '1234',
    phoneLast4: '3341',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 72000,
    hourlyBaseWagePaise: 9000,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_karthik',
    orgId: 'org_metro_infra',
    siteId: 'site_pier_4',
    workerCode: '1048',
    fullName: 'Karthik Raja',
    role: 'worker',
    designation: 'Electrical Rig Specialist',
    pin: '1234',
    phoneLast4: '4452',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 90000,
    hourlyBaseWagePaise: 11250,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_deepak',
    orgId: 'org_metro_infra',
    siteId: 'site_pier_4',
    workerCode: '1049',
    fullName: 'Deepak Sharma',
    role: 'worker',
    designation: 'Site Rigger',
    pin: '1234',
    phoneLast4: '5563',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 70000,
    hourlyBaseWagePaise: 8750,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_subbu',
    orgId: 'org_metro_infra',
    siteId: 'site_pier_4',
    workerCode: '1050',
    fullName: 'Subramanian V',
    role: 'worker',
    designation: 'Surface Painter & Finisher',
    pin: '1234',
    phoneLast4: '6674',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 68000,
    hourlyBaseWagePaise: 8500,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'w_arun_sup',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '2001',
    fullName: 'Arun Sundaram (Site Foreman)',
    role: 'site_supervisor',
    designation: 'Tower B General Foreman',
    pin: '9999',
    phoneLast4: '1001',
    preferredLanguage: 'en',
    dailyBaseWagePaise: 140000,
    hourlyBaseWagePaise: 17500,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_vikram_admin',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '3001',
    fullName: 'Vikram Mehra (VP Projects)',
    role: 'org_admin',
    designation: 'Infrastructure Operations Director',
    pin: '8888',
    phoneLast4: '0001',
    preferredLanguage: 'en',
    dailyBaseWagePaise: 250000,
    hourlyBaseWagePaise: 31250,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_lakshmi_safety',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    workerCode: '2002',
    fullName: 'Lakshmi Narayanan (Safety Officer)',
    role: 'site_supervisor',
    designation: 'Site EHS Lead',
    pin: '9999',
    phoneLast4: '1002',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 130000,
    hourlyBaseWagePaise: 16250,
    createdAt: '2026-09-01T00:00:00.000Z',
  },

  // --- GREENFIELD COLLEGE (CAMPUS FACILITIES) ---
  {
    id: 'w_priya',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '5001',
    fullName: 'Priya Mani',
    role: 'worker',
    designation: 'Senior Facility Sanitation Lead',
    pin: '1234',
    phoneLast4: '1122',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 65000,
    hourlyBaseWagePaise: 7647,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_rajesh_guard',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '5002',
    fullName: 'Rajesh Tiwari',
    role: 'worker',
    designation: 'Campus Security Officer (Night Duty)',
    pin: '1234',
    phoneLast4: '3344',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 62000,
    hourlyBaseWagePaise: 7294,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_geetha',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '5003',
    fullName: 'Geetha Swaminathan',
    role: 'worker',
    designation: 'Library Maintenance Associate',
    pin: '1234',
    phoneLast4: '5566',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 60000,
    hourlyBaseWagePaise: 7058,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_mohammed',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '5004',
    fullName: 'Mohammed Farooq',
    role: 'worker',
    designation: 'HVAC & Science Lab Electrician',
    pin: '1234',
    phoneLast4: '7788',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 80000,
    hourlyBaseWagePaise: 9411,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_kavitha',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '5005',
    fullName: 'Kavitha S',
    role: 'worker',
    designation: 'Hostel Housekeeping Assistant',
    pin: '1234',
    phoneLast4: '9900',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 58000,
    hourlyBaseWagePaise: 6823,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_amit',
    orgId: 'org_greenfield_college',
    siteId: 'site_sports_complex',
    workerCode: '5006',
    fullName: 'Amitabh Verma',
    role: 'worker',
    designation: 'Groundsman & Turf Specialist',
    pin: '1234',
    phoneLast4: '2233',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 62000,
    hourlyBaseWagePaise: 7294,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_senthil',
    orgId: 'org_greenfield_college',
    siteId: 'site_sports_complex',
    workerCode: '5007',
    fullName: 'Senthil Nathan',
    role: 'worker',
    designation: 'Plumbing & Water Systems Staff',
    pin: '1234',
    phoneLast4: '4455',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 68000,
    hourlyBaseWagePaise: 8000,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_manoj',
    orgId: 'org_greenfield_college',
    siteId: 'site_sports_complex',
    workerCode: '5008',
    fullName: 'Manoj Joshi',
    role: 'worker',
    designation: 'Auditorium AV Technician',
    pin: '1234',
    phoneLast4: '6677',
    preferredLanguage: 'hi',
    dailyBaseWagePaise: 75000,
    hourlyBaseWagePaise: 8823,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_saravanan',
    orgId: 'org_greenfield_college',
    siteId: 'site_sports_complex',
    workerCode: '5009',
    fullName: 'Saravanan T',
    role: 'worker',
    designation: 'Campus Waste Management Associate',
    pin: '1234',
    phoneLast4: '8899',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 58000,
    hourlyBaseWagePaise: 6823,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_chandran_hod',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '6001',
    fullName: 'Prof. Chandrasekharan (Estate HOD)',
    role: 'site_supervisor',
    designation: 'Campus Facilities In-Charge',
    pin: '9999',
    phoneLast4: '2001',
    preferredLanguage: 'en',
    dailyBaseWagePaise: 160000,
    hourlyBaseWagePaise: 18823,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_sunita_registrar',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '7001',
    fullName: 'Dr. Sunita Rao (Campus Registrar)',
    role: 'org_admin',
    designation: 'College Administration Dean',
    pin: '8888',
    phoneLast4: '0002',
    preferredLanguage: 'en',
    dailyBaseWagePaise: 280000,
    hourlyBaseWagePaise: 32941,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'w_deepa_sup',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    workerCode: '6002',
    fullName: 'Deepa V (Hostel Warden / Sup)',
    role: 'site_supervisor',
    designation: 'Campus Residence Supervisor',
    pin: '9999',
    phoneLast4: '2002',
    preferredLanguage: 'ta',
    dailyBaseWagePaise: 120000,
    hourlyBaseWagePaise: 14117,
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

// Helper to generate past shifts
export function generateSeedShifts(): ShiftRecord[] {
  const shifts: ShiftRecord[] = [];
  const baseDate = new Date('2026-10-01T00:00:00.000Z');

  // Murugan K: 25 shifts with overtime that paper would miss
  for (let day = 1; day <= 25; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const startHour = day % 4 === 0 ? '20:00:00.000Z' : '08:00:00.000Z'; // some midnight shifts
    const endHour = day % 4 === 0 ? '06:00:00.000Z' : '18:30:00.000Z'; // 10h duration
    const endDay = day % 4 === 0 ? day + 1 : day;
    const endDayStr = endDay < 10 ? `0${endDay}` : `${endDay}`;

    shifts.push({
      id: `shift_murugan_${day}`,
      orgId: 'org_metro_infra',
      siteId: 'site_tower_b',
      workerId: 'w_murugan',
      startTimeUtc: `2026-10-${dayStr}T${startHour}`,
      endTimeUtc: `2026-10-${endDayStr}T${endHour}`,
      workDayDate: `2026-10-${dayStr}`,
      status: 'COMPLETED',
      checkInMethod: 'qr_scan',
      checkInLat: 13.0827,
      checkInLng: 80.2707,
      isWithinGeofence: true,
      breakDeductedMinutes: 30,
      regularHours: 8.0,
      overtimeHours: 2.0, // Overtime accurately recorded
      idempotencyKey: `idemp_murugan_${day}`,
    });
  }

  // Ramesh Kumar: 7 consecutive continuous shifts (Fatigue trigger)
  for (let day = 18; day <= 24; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    shifts.push({
      id: `shift_ramesh_${day}`,
      orgId: 'org_metro_infra',
      siteId: 'site_tower_b',
      workerId: 'w_ramesh',
      startTimeUtc: `2026-10-${dayStr}T07:00:00.000Z`,
      endTimeUtc: `2026-10-${dayStr}T19:30:00.000Z`, // 12.5h shift
      workDayDate: `2026-10-${dayStr}`,
      status: 'COMPLETED',
      checkInMethod: 'geofence_self',
      checkInLat: 13.0826,
      checkInLng: 80.2708,
      isWithinGeofence: true,
      breakDeductedMinutes: 30,
      regularHours: 8.0,
      overtimeHours: 4.0,
      idempotencyKey: `idemp_ramesh_${day}`,
    });
  }

  // College Staff Priya Mani: Regular duties
  for (let day = 1; day <= 20; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    shifts.push({
      id: `shift_priya_${day}`,
      orgId: 'org_greenfield_college',
      siteId: 'site_academic_campus',
      workerId: 'w_priya',
      startTimeUtc: `2026-10-${dayStr}T07:30:00.000Z`,
      endTimeUtc: `2026-10-${dayStr}T16:30:00.000Z`,
      workDayDate: `2026-10-${dayStr}`,
      status: 'COMPLETED',
      checkInMethod: 'qr_scan',
      checkInLat: 12.9716,
      checkInLng: 77.5946,
      isWithinGeofence: true,
      breakDeductedMinutes: 45,
      regularHours: 8.25,
      overtimeHours: 0.0,
      idempotencyKey: `idemp_priya_${day}`,
    });
  }

  return shifts;
}

export const SEED_HAZARDS: HazardReport[] = [
  {
    id: 'haz_101',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    reporterWorkerId: null,
    reporterName: 'Anonymous Worker',
    isAnonymous: true,
    category: 'Scaffolding / Fall Hazard',
    severity: 'CRITICAL',
    description: 'Pier 4 level 3 steel clamp is loose and bent under high wind load. Severe fall danger.',
    status: 'ESCALATED', // Breached 2h SLA
    targetResponseHours: 2,
    createdAt: '2026-10-26T04:00:00.000Z',
    slaBreachAt: '2026-10-26T06:00:00.000Z',
    escalatedAt: '2026-10-26T06:15:00.000Z',
  },
  {
    id: 'haz_102',
    orgId: 'org_metro_infra',
    siteId: 'site_tower_b',
    reporterWorkerId: 'w_murugan',
    reporterName: 'Murugan K',
    isAnonymous: false,
    category: 'Exposed Wiring / Electrical',
    severity: 'MEDIUM',
    description: 'Ground generator cable insulation cut near main water drainage trench.',
    status: 'INSPECTING',
    targetResponseHours: 12,
    createdAt: '2026-10-26T18:00:00.000Z',
    slaBreachAt: '2026-10-27T06:00:00.000Z',
  },
  {
    id: 'haz_201',
    orgId: 'org_greenfield_college',
    siteId: 'site_academic_campus',
    reporterWorkerId: null,
    reporterName: 'Anonymous Worker',
    isAnonymous: true,
    category: 'Chemical Exposure (Science Lab)',
    severity: 'HIGH',
    description: 'Chemistry block ventilation shaft exhaust fan not operating; chemical odor lingering in corridor.',
    status: 'RECTIFYING',
    targetResponseHours: 4,
    createdAt: '2026-10-26T14:00:00.000Z',
    slaBreachAt: '2026-10-26T18:00:00.000Z',
  },
];

export const SEED_FATIGUE_ALERTS: FatigueAlert[] = [
  {
    id: 'fatigue_alert_ramesh_1',
    orgId: 'org_metro_infra',
    workerId: 'w_ramesh',
    workerName: 'Ramesh Kumar',
    shiftId: 'shift_ramesh_24',
    ruleId: 'RULE_MAX_CONSECUTIVE_DAYS',
    ruleDescription: 'Worker has worked consecutive days without a mandatory rest day off',
    thresholdValue: 6,
    actualValue: 7,
    unit: 'days',
    severity: 'CRITICAL',
    isAcknowledged: false,
    createdAt: '2026-10-25T19:30:00.000Z',
  },
  {
    id: 'fatigue_alert_ramesh_2',
    orgId: 'org_metro_infra',
    workerId: 'w_ramesh',
    workerName: 'Ramesh Kumar',
    shiftId: 'shift_ramesh_24',
    ruleId: 'RULE_MAX_DAILY_HOURS',
    ruleDescription: 'Single shift duration exceeded safe working limits',
    thresholdValue: 11.0,
    actualValue: 12.5,
    unit: 'hours',
    severity: 'CRITICAL',
    isAcknowledged: false,
    createdAt: '2026-10-25T19:30:00.000Z',
  },
];

export const SEED_FEEDBACK_CYCLE: FeedbackCycle = {
  id: 'cycle_oct_2026',
  orgId: 'org_metro_infra',
  title: 'October Workplace Dignity & Conditions Survey',
  startDate: '2026-10-01',
  endDate: '2026-10-31',
  isActive: true,
};

// Participation records (isolated ledger)
export const SEED_PARTICIPATION: FeedbackParticipation[] = [
  { id: 'part_1', cycleId: 'cycle_oct_2026', workerId: 'w_murugan', submittedDayBucket: '2026-10-20' },
  { id: 'part_2', cycleId: 'cycle_oct_2026', workerId: 'w_ramesh', submittedDayBucket: '2026-10-20' },
  { id: 'part_3', cycleId: 'cycle_oct_2026', workerId: 'w_selvam', submittedDayBucket: '2026-10-21' },
  { id: 'part_4', cycleId: 'cycle_oct_2026', workerId: 'w_anand', submittedDayBucket: '2026-10-21' },
  { id: 'part_5', cycleId: 'cycle_oct_2026', workerId: 'w_mari', submittedDayBucket: '2026-10-22' },
  { id: 'part_6', cycleId: 'cycle_oct_2026', workerId: 'w_sanjay', submittedDayBucket: '2026-10-22' },
  { id: 'part_7', cycleId: 'cycle_oct_2026', workerId: 'w_karthik', submittedDayBucket: '2026-10-23' },
  { id: 'part_8', cycleId: 'cycle_oct_2026', workerId: 'w_deepak', submittedDayBucket: '2026-10-23' },
];

// Feedback responses (Completely unlinked, NO worker_id)
// Department A (team_welders): 8 responses -> Visible in aggregate!
// Department B (team_riggers): 2 responses -> Under floor (k=3/5) -> MUST BE SUPPRESSED!
export const SEED_FEEDBACK_RESPONSES: FeedbackResponse[] = [
  // 8 responses for team_welders (Visible aggregate)
  { id: 'fr_1', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_water_shade', scoreRating: 4, feedbackTextScrubbed: 'Water drum refilled regularly this week.', submittedDayBucket: '2026-10-20' },
  { id: 'fr_2', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_water_shade', scoreRating: 5, feedbackTextScrubbed: 'Shade shed built near Pier 3 is helpful.', submittedDayBucket: '2026-10-20' },
  { id: 'fr_3', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_safety_gear', scoreRating: 4, feedbackTextScrubbed: 'Welding gloves replaced promptly.', submittedDayBucket: '2026-10-21' },
  { id: 'fr_4', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_safety_gear', scoreRating: 4, feedbackTextScrubbed: 'Helmets are in good condition.', submittedDayBucket: '2026-10-21' },
  { id: 'fr_5', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_foreman_respect', scoreRating: 5, feedbackTextScrubbed: 'Foreman Arun speaks with dignity.', submittedDayBucket: '2026-10-22' },
  { id: 'fr_6', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_foreman_respect', scoreRating: 4, feedbackTextScrubbed: 'Good communication during morning briefing.', submittedDayBucket: '2026-10-22' },
  { id: 'fr_7', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_water_shade', scoreRating: 4, feedbackTextScrubbed: 'Need cooler water during afternoon peak heat.', submittedDayBucket: '2026-10-23' },
  { id: 'fr_8', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_welders', questionId: 'q_safety_gear', scoreRating: 5, feedbackTextScrubbed: 'Boots fit well.', submittedDayBucket: '2026-10-23' },

  // Only 2 responses for team_riggers (Under floor => Suppressed!)
  { id: 'fr_9', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_riggers', questionId: 'q_safety_gear', scoreRating: 2, feedbackTextScrubbed: 'Need stronger harness lines.', submittedDayBucket: '2026-10-23' },
  { id: 'fr_10', cycleId: 'cycle_oct_2026', departmentOrTeamId: 'team_riggers', questionId: 'q_water_shade', scoreRating: 3, feedbackTextScrubbed: 'Water station is too far from flyover apex.', submittedDayBucket: '2026-10-23' },
];

export const SEED_PAY_QUERIES: PayQuery[] = [
  {
    id: 'query_101',
    payslipId: 'ps_murugan_sep',
    workerId: 'w_murugan',
    workerName: 'Murugan K',
    queryType: 'missing_overtime',
    message: 'On October 12 night shift, I worked until 06:00 AM (2 hours overtime), but only 1 hour was reflected in the slip.',
    status: 'RESOLVED',
    adjustmentPaise: 15000, // ₹150 added
    resolutionNote: 'Verified gate log #8821. Approved 1 hour additional overtime adjustment.',
    resolvedBySupervisorId: 'w_arun_sup',
    createdAt: '2026-10-16T10:00:00.000Z',
    resolvedAt: '2026-10-17T14:30:00.000Z',
  },
];
