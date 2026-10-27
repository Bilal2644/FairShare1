# FAIRSHIFT · CUSTOMIZATION ARCHITECTURE & SETTINGS REGISTRY

This document details how FairShift is customized across three distinct layers without requiring source code modifications.

---

## 1. The Three Customization Layers

| Layer | Who | Mechanism | Scope of Changes |
|---|---|---|---|
| **Layer A** | Organisation Admin | Admin Settings UI | Pay multipliers, thresholds, grace minutes, geofence radiuses, safety SLAs, and terminology maps. |
| **Layer B** | Worker | Personal Settings & Simple Mode | Language (English, Tamil, Hindi), Text size (4 steps), Theme/Contrast, and Simple Mode (4 large tiles). |
| **Layer C** | Developer | File additions | New languages (`/src/i18n/locales/[lang].json`), new sector presets (`/src/config/presets/[preset].ts`), or new feature modules (`/src/modules/`). |

---

## 2. Hierarchical Resolution Order

Configuration keys resolve in strict hierarchical precedence:

$$\text{System Default} \longrightarrow \text{Sector Preset} \longrightarrow \text{Organisation Override} \longrightarrow \text{Site Override} \longrightarrow \text{Worker Personalization}$$

### Worked Example: `attendance.grace_minutes`
1. **System Default:** `10` minutes.
2. **Sector Preset (Construction):** `15` minutes (accommodating site gate queues).
3. **Organisation Override (Metro Infra Pvt Ltd):** `15` minutes.
4. **Site Override (Tower B Deep Excavation):** `20` minutes (due to descent elevator queue).
5. **Effective Value Resolved for Worker:** **`20` minutes**.

*(Note: Worker accessibility preferences such as `worker.simple_mode` take ultimate precedence; an organisation cannot override an employee's personal accessibility settings).*

---

## 3. The 7 Inviolable Locked Principles

No setting, organization override, or API call can violate these 7 principles:

1. **Anonymity Hard Floor:** `feedback.anonymity_threshold_floor` has an immutable floor of $k \ge 3$ (default 5). Any attempt to set $k < 3$ is rejected with HTTP 422.
2. **Worker Visibility Right:** Every worker retains an inalienable right to view their own recorded hours, payslip formula breakdown, and stored personal profile data.
3. **Zero Continuous Tracking:** Location is sampled strictly at the point in time of check-in/out. Continuous background geolocation tracking is architecturally prohibited.
4. **Anonymous Feedback Decoupling:** Anonymous feedback never feeds any individual employee score or disciplinary metric.
5. **Formula Transparency:** Payslip formula steps cannot be concealed.
6. **Server-Enforced Validation:** All limits and ranges are verified on the backend.
7. **Immutable Auditing:** Every configuration mutation is recorded with the author ID, old value, new value, and justification timestamp.

---

## 4. Settings Registry Directory

| Key | Type | Default | Scope | Risk | Allowed Range |
|---|---|---|---|---|---|
| `org.name` | String | FairShift Worksite | Org | Low | Text |
| `org.terminology_preset` | Select | construction | Org | Low | construction, college, hospital, factory |
| `attendance.grace_minutes` | Number | 15 | Org/Site | Low | 0 – 60 min |
| `attendance.break_deduction_minutes` | Number | 30 | Org | Medium | 0 – 120 min |
| `attendance.geofence_radius_meters` | Number | 100 | Site | Low | 20 – 2000 m |
| `attendance.auto_close_hours` | Number | 14 | Org | High | 8 – 24 hrs |
| `pay.daily_threshold_hours` | Number | 8.0 | Org | High | 4.0 – 12.0 hrs |
| `pay.weekly_threshold_hours` | Number | 48.0 | Org | High | 30.0 – 60.0 hrs |
| `pay.overtime_multiplier` | Number | 1.5 | Org | High | 1.0 – 3.0x |
| `fatigue.max_daily_hours` | Number | 11.0 | Org | High | 8.0 – 16.0 hrs |
| `fatigue.min_rest_between_shifts_hours` | Number | 11.0 | Org | High | 8.0 – 16.0 hrs |
| `fatigue.max_consecutive_days` | Number | 6 | Org | High | 4 – 10 days |
| `safety.sla_hours_critical` | Number | 2 | Org | High | 1 – 12 hrs |
| `feedback.anonymity_threshold_floor` | Number | 5 | Org | High | **3 – 20 (Locked Floor)** |

---

## 5. Adding New Sectors (Layer C Guide)

To add **Hospital** or **Factory** sectors:
1. Create `/src/config/presets/hospital.ts` exporting a `SectorConfig` object with customized terminology, shift patterns, fatigue recovery rules, and hazard categories.
2. Register the preset in `/src/config/registry.ts`.
3. The sector immediately becomes available in the Admin Settings dropdown and UI without altering core logic.
