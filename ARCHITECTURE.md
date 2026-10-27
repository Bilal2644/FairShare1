# FAIRSHIFT · SYSTEM ARCHITECTURE (ARCHITECTURE.md)

This document provides a comprehensive structural guide to the FairShift platform.

---

## 1. High-Level System Architecture

FairShift is architected as an offline-tolerant, reactive single-page progressive web application with a pure-functional rules engine and a decoupled anonymity vault.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT PRESENTATION TIER                        │
│  ┌───────────────────────────────────┐  ┌───────────────────────────┐  │
│  │ Worker Inclusive Interface        │  │ Employer / Admin Portal   │  │
│  │ - Simple Mode (4 large tiles)     │  │ - Executive KPI Bar       │  │
│  │ - Standard Mode (calendars/slips) │  │ - Shift Roster Monitor    │  │
│  │ - Web Speech API read-aloud TTS   │  │ - Hazard Triage Queue     │  │
│  │ - Offline sync queue indicator    │  │ - Fatigue Alert Console   │  │
│  └─────────────────┬─────────────────┘  └─────────────┬─────────────┘  │
└────────────────────┼──────────────────────────────────┼────────────────┘
                     │                                  │
┌────────────────────▼──────────────────────────────────▼────────────────┐
│                      REACTIVE STATE & DISPATCH LAYER                   │
│  - `/src/server/store.ts`                                              │
│  - In-memory relational store with LocalStorage persistence            │
│  - Tenant isolation filter (enforces `orgId` on all queries)           │
│  - Deterministic seed loader with 1-click reset                        │
└────────────────────┬──────────────────────────────────┬────────────────┘
                     │                                  │
┌────────────────────▼──────────────────┐ ┌─────────────▼────────────────┐
│      PURE FUNCTIONAL RULE ENGINES     │ │    DECOUPLED ANONYMITY VAULT │
│  - `/src/engines/pay.ts`              │ │  - `/src/engines/anonymity.ts│
│    (Minor-unit integer arithmetic)    │ │    (Physical voter ledger    │
│  - `/src/engines/fatigue.ts`          │ │     disconnected from votes; │
│    (Rule-attributed threshold alerts) │ │     $k \ge 3$ suppression)  │
│  - `/src/engines/risk.ts`             │ └──────────────────────────────┘
│    (Explainable friction heuristic)   │
└───────────────────────────────────────┘
```

---

## 2. Directory Structure

- `/src/types/index.ts`: Strongly typed domain contracts (WorkerProfile, ShiftRecord, Payslip, HazardReport, FatigueAlert, FeedbackCycle, etc.).
- `/src/config/registry.ts`: Single source of truth settings registry with type validation, allowed ranges, and locked principles enforcement.
- `/src/config/presets/`:
  - `construction.ts`: Construction Site sector defaults (daily wages, gate QR, scaffolding hazards).
  - `college.ts`: College / Campus Facilities defaults (monthly salaries, duty rosters, lab hazards).
- `/src/engines/`:
  - `pay.ts`: Integer minor unit (paise) payroll calculation with non-duplicating daily & weekly overtime.
  - `fatigue.ts`: Overwork prevention engine with rule attribution and snooze controls.
  - `risk.ts`: Explainable retention friction heuristic with mandatory ethical guidance.
  - `anonymity.ts`: Small-cell suppression and differencing protection engine.
- `/src/i18n/`:
  - `locales/en.json`: English dictionary.
  - `locales/ta.json`: Tamil dictionary with native Devanagari/Tamil font stack fallbacks.
  - `locales/hi.json`: Hindi dictionary.
  - `index.ts`: Key lookup, Indian numbering format (`1,42,000`), and currency formatters.
- `/src/components/`:
  - `Navbar.tsx`: Sector switch, role switch, language switch, simple mode toggle, demo reset.
  - `SimpleModeHome.tsx`: 4 large high-contrast illustrated tiles ($\ge 18$px body text, $\ge 48\times 48$px touch targets).
  - `WorkerCheckIn.tsx`: Rotating gate QR token (30s window), GPS geofence badge, offline queue indicator.
  - `WorkerPayslip.tsx`: Step-by-step formula cards, Web Speech API audio player, Pay Query dispute button.
  - `HazardReportModal.tsx`: Visual category picker, EXIF-stripping photo simulator, voice note simulator, anonymous toggle.
  - `FeedbackBallot.tsx`: Face rating scale (1-5), decoupled ballot submission.
  - `WhatIsRecordedModal.tsx`: Worker dignity inspector and data export.
  - `AdminDashboard.tsx`: Executive KPIs, overdue SLA tickets, retention risk radar.
  - `SupervisorRoster.tsx`: Real-time on-site attendance roster.
  - `HazardTriageQueue.tsx`: Safety ticket Kanban, SLA countdown timers, auto-escalation trigger.
  - `FatigueConsole.tsx`: Active fatigue alerts with rule attribution and snooze/acknowledge controls.
  - `FeedbackAggregates.tsx`: Sentiment aggregates with visible small-cell suppression ($k \ge 3$).
  - `AdminSettings.tsx`: Generated from Settings Registry, live range validation, Simulate-Before-Apply modal.
- `/src/modules/`:
  - `HeatStressModule.tsx`: Construction outdoor heat-stress timer.
  - `DutyFairnessModule.tsx`: College shift roster fairness inspector.

---

## 3. Data Integrity & Anonymity by Design

Feedback submissions are stored across two strictly isolated tables:
1. `feedback_participation`: Stores `(cycle_id, worker_id, day_bucket)`. Purpose: Ensures one vote per employee per survey cycle.
2. `feedback_responses`: Stores `(cycle_id, department_id, question_id, score, comment, day_bucket)`. Contains **zero** user IDs, worker codes, IP addresses, or device IDs.
Because there is no relational foreign key connecting responses to voters, de-anonymization is mathematically impossible at the database level.
