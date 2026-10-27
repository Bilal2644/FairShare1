# FAIRSHIFT · ADMINISTRATOR & SUPERVISOR GUIDE (ADMIN_GUIDE.md)

This guide walks an administrator or site supervisor through configuring, managing, and inspecting workforce operations in FairShift.

---

## 1. Changing Rules and Multipliers (Live, No Code Edits)

All organizational rules can be adjusted directly from the **Settings & Rules** screen:

### Worked Example: Updating Overtime Multipliers via "Simulate Before Apply"
1. Log in as an Organization Administrator (e.g. Vikram Mehra).
2. Click the **Settings & Rules** tab in the navigation bar.
3. Click the top-right button: **"Simulate Impact Before Apply"**.
4. In the modal, select `pay.overtime_multiplier` and propose `2.0` (raising OT rate from 1.5x to 2.0x).
5. The system instantly replays the past 30 days of shifts and previews:
   - *Impacted Workers:* 2 employees
   - *Payroll Spend Delta:* +₹3,900
6. Enter an audit justification (e.g. *"Union collective bargaining adjustment"*).
7. Click **"Apply Live & Broadcast Notice"**. The setting is immediately saved and logged in the immutable audit log.

---

## 2. Managing Safety Hazard SLA Escalations

1. Navigate to **Hazard Triage**.
2. Critical severity incidents initiate an automatic SLA countdown timer (e.g. 2 hours in Construction).
3. If the SLA expires before status changes from `SUBMITTED`, the ticket status turns `ESCALATED` in bright red and notifies higher management.
4. When inspecting or repairing a hazard:
   - Click **Start Inspection** to set state to `INSPECTING`.
   - Click **Rectification in Progress** to set state to `RECTIFYING`.
   - Enter completion notes and click **Mark Safe & Resolved**.

---

## 3. Resolving Worker Pay Queries

1. When a worker flags a payslip line via the "Ask a Question About Pay" button, the inquiry appears in the supervisor's Pay Queue.
2. The supervisor reviews the gate check-in timestamp and notes.
3. If an adjustment is approved, the supervisor enters an adjustment amount (e.g. ₹150 for 1 uncounted overtime hour) and a resolution note.
4. The worker's payslip updates automatically with a green "Adjustment Credited" badge.

---

## 4. Understanding the Explainable Retention Risk Radar

- Found on the **Admin Overview** dashboard.
- Highlights workers and teams experiencing systemic friction (consecutive overtime shifts, unaddressed safety tickets, or pay disputes).
- **Mandatory Ethical Policy:** This heuristic exists exclusively to trigger supportive conversations, workload rebalancing, and safety improvements. It must never be used for disciplinary action.
