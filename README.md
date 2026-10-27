# FAIRSHIFT · DECENT WORK PLATFORM (UN SDG 8)

FairShift is an inclusive, configurable, offline-tolerant workforce dignity platform engineered for employee-intensive organisations in India and the Global South (Construction, Colleges & Universities, Hospitals, and Factories).

## Key Features Built End-to-End

1. **Shift Tracking & Geo/QR Attendance (F1):**
   - Rotating gate QR tokens (refresh every 30s) to eliminate screenshot reuse.
   - Point-in-time GPS check-in verification without intrusive continuous location tracking.
   - Idempotent IndexedDB offline queue that stores check-ins locally and syncs automatically.
   - Robust midnight shift handling and automatic overtime accumulation without double counting.

2. **Clear Payslips & Wage Formula Transparency (F2 & F7):**
   - Integer minor units (Paise) to eliminate floating-point rounding errors.
   - Step-by-step formula breakdown viewable in the worker's native language.
   - Web Speech API read-aloud TTS in Tamil, Hindi, and English.
   - "Ask a Question About Pay" (F7) dispute resolution channel.

3. **Safety Incident Reporting (F3):**
   - 3-step visual hazard picker with EXIF-stripping photo uploads and voice notes.
   - Guaranteed anonymity toggle (writes NULL to user ID foreign keys).
   - Dynamic SLA countdown with automatic escalation when response targets breach.

4. **Truly Anonymous Feedback (F4):**
   - Anonymous by design: Physical separation of participation ledger and response vault.
   - Mathematical small-cell suppression ($k \ge 3$, default 5) and differencing protection.
   - Random order shuffling and day-bucketed timestamps.

5. **Explainable Fatigue Alerts (F5):**
   - Enforces max daily hours, minimum turnaround rest, and consecutive working days.
   - Every alert cites the exact rule ID, threshold, actual logged value, and shift ID.

6. **Executive Dashboard & Retention Risk Radar (F6):**
   - Real-time headcount, overtime expenditure, and open hazard triage.
   - Rule-based heuristic friction radar with mandatory ethical governance banner.
   - 1-click UTF-8 CSV shift export.

7. **Dynamic Settings Registry & Live Simulation:**
   - Single source of truth driving validation, UI generation, and sector presets.
   - "Simulate Before Apply" dry-run engine replaying 30 days of shifts.
   - Immutable audit trail.

---

## Quickstart & Verification

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (Pay, Fatigue, Anonymity, Registry, i18n)
npx tsx --test src/engines/pay.test.ts src/engines/fatigue.test.ts src/engines/anonymity.test.ts src/config/registry.test.ts src/i18n/verify-keys.test.ts

# 3. Start development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.
