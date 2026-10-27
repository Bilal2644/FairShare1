# FairShift · Expansion Plan: Hospital & Factory Sector Presets

Expand FairShift's multi-sector capabilities by adding two fully configured Layer C presets: **Hospital (Round-the-clock Care & Sanitation Teams)** and **Factory (Floor & Assembly Line Operators)** without editing core engine code.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Both presets will ship as pure configuration modules conforming to the `SectorConfig` contract, demonstrating Layer C developer extensibility.

- **Confirmed Decision**: Implement Hospital & Sanitation and Factory & Line Operator presets.
- **Terminology & Hazards**:
  - *Hospital Preset*: Roles: Care Associate / Nurse Supervisor / Sanitation Orderly; Workplace: Ward / ICU / Clinical Block; Hazards: Biohazard Spills, Needle-Stick Exposure, Airborne Infection Risks, Chemical Disinfectant Exposure.
  - *Factory Preset*: Roles: Line Operator / Shift Manager / Quality Inspector; Workplace: Assembly Bay / Tool Room / Machine Line; Hazards: Lockout-Tagout (LOTO) Violations, Conveyor Pinch Points, Forklift Traffic, Noise Overexposure.
- **Fatigue & Rest Rules**:
  - *Hospital*: 12-hour rotational duties with mandatory 24-hour rest post-night shifts.
  - *Factory*: 3-shift rotation (Morning / Afternoon / Night) with overtime capping and break rules.

---

## 1. Overview & Core Concept

- **What It Delivers**: Seamless sector switching from the top navigation bar between 4 sectors: **Construction Site**, **College Campus**, **Hospital**, and **Factory**.
- **Demonstration Value**: Proves the architecture's cross-sector portability (Section 1.4e and 1.5 of the specification). Adding a sector requires only a data file and preset registration, leaving the pay calculation, fatigue, and anonymity engines untouched.

---

## 2. User Experience & Visual Design

- **Sector Switcher Bar**: Expands the top header pill to include Hospital (Stethoscope / Cross icon in emerald/teal) and Factory (Factory / Cog icon in orange/amber).
- **Dynamic Terminology Updates**: The entire UI (shift labels, supervisor designations, work area filters, and ticket categories) automatically re-binds to the active sector's terms.
- **Sector-Specific Hazard Pickers**:
  - Hospital safety view shows Biohazard, Sharps/Needle-Stick, and Sanitation breaches.
  - Factory safety view shows Machine Guarding, Chemical Drum, and Forklift hazard badges.
- **Sector Micro-Modules**:
  - Hospital: *Night Shift Recovery & Sleep Window Tracker*.
  - Factory: *Ergonomic Repetitive Strain & Rotation Timer*.

---

## 3. Technical Architecture & Component Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SECTOR PRESET REGISTRY (LAYER C)                      │
│                                                                             │
│  ┌───────────────────────┐ ┌──────────────────────┐ ┌────────────────────┐  │
│  │ Construction Preset   │ │ College Preset       │ │ Hospital Preset    │  │
│  │ (Gate QR / Scaffolds) │ │ (Campus / Rosters)   │ │ (Wards / Biohazard)│  │
│  └───────────────────────┘ └──────────────────────┘ └─────────┬──────────┘  │
│                                                               │             │
│                            ┌──────────────────────────────────┴──────────┐  │
│                            │ Factory Preset (Assembly Line / LOTO Guards)│  │
│                            └──────────────────────────────────┬──────────┘  │
└───────────────────────────────────────────────────────────────┼─────────────┘
                                                                │
┌───────────────────────────────────────────────────────────────▼─────────────┐
│                           CENTRAL SETTINGS RESOLUTION                       │
│  System Default ──> Sector Preset ──> Org Overrides ──> Site ──> Worker     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Proposed Changes

1. **Presets Directory (`src/config/presets/`)**:
   - `hospital.ts`: Define `HOSPITAL_PRESET` with 12h rotation rules, biohazard categories, and hospital feedback questions.
   - `factory.ts`: Define `FACTORY_PRESET` with 3-shift rules, LOTO hazard categories, and line pacing feedback questions.
2. **Preset Index & Registry (`src/config/presets/index.ts` & `src/config/registry.ts`)**:
   - Register both presets into the sector enum and options lists.
3. **Seed Data Expansion (`src/server/seedData.ts`)**:
   - Add `org_apex_hospital` (Apex Healthcare & Multispecialty Hospital) and `org_precision_auto` (Precision Auto Components Factory).
   - Add 8 realistic workers each (sanitation orderlies, nurses, assembly line fitters, floor supervisors) with 30-day shift histories.
4. **UI Navbar (`src/components/Navbar.tsx`)**:
   - Add interactive 1-click pills for Hospital and Factory in the top navigation bar.

---

## 4. Verification Plan

- **Automated Tests**:
  - Run existing test suites to ensure 0 regression across pay, fatigue, and anonymity.
  - Add test verifying Hospital 24h post-night-shift rest rule.
- **Browser Playwright Verification**:
  - Switch to Hospital: verify medical terminology, biohazard categories, and nursing shifts.
  - Switch to Factory: verify assembly line terminology and machine hazard categories.
  - Verify that locked principles (anonymity floor $k \ge 3$) remain strictly intact.
