# Data Series Alerts – Specification

> **Status**: ✅ UI & client logic implemented  
> **Next**: Connect to backend API  
> **Last updated**: 2024‑03‑28

## Purpose

Allow users to monitor custom chart series and receive monthly updates when thresholds are crossed. Alerts complement entity newsletters and live alongside them in the notifications dashboard.

---

## Core Flows

### 1. Browse & Manage Alerts (Notifications Page)
1. `/settings/notifications` loads alerts via `useAlertsList` (React Query).
2. Each alert renders as a card matching the entity newsletter style:
   - Title + description.
   - Status badge (`Active` / `Paused`), threshold copy, series name.
   - Inline actions: enable/disable toggle, “Open” button, trash icon.
   - Embedded `ChartPreview` showing data series + threshold (legend/tooltip/grid on).
3. Section header includes a `Plus` icon button → `/alerts/new`.
4. Toggle dispatches `useSaveAlertMutation` with updated `isActive`; delete invokes `useDeleteAlertMutation` after confirmation.

### 2. Create Alert
1. `/alerts/new` generates a draft alert (`createEmptyAlert`) and navigates to `/alerts/$alertId`.
2. `AlertEditorView` shows:
   - Sticky action bar (status pill, Revert, Save, Preview).
   - Three panels: Details, Condition, Data Series filter (reusing `SeriesFilter`).
3. User edits form + series filter (stored in router search via `useAlertStore`).
4. Save (`useSaveAlertMutation`) persists to mock API, updates React Query caches, resets dirty state, sets mode `edit`.

### 3. Edit Alert
1. `/alerts/$alertId` fetches canonical alert via `useAlertDetail`.
2. `useAlertStore` seeds draft from query result and tracks unsaved changes against the baseline (`areAlertsEqual` strips timestamps).
3. Preview button opens a modal with `ChartPreview` (no route change).
4. Navigation guard:
   - TanStack `useBlocker` prompts with custom dialog when leaving the route with dirty changes (edit mode only).
   - `beforeunload` warns on tab close for dirty edits.
5. Delete (from notifications) removes alert and invalidates list query.

### 4. Toggle/Delete from Notifications
1. Toggle switch calls `useSaveAlertMutation` with updated `isActive`.
2. Delete button confirms via `window.confirm`, then `useDeleteAlertMutation`; success toast + list invalidation.
3. “Open” button navigates to editor with draft search payload.

---

## Design Principles
1. **Consistency** – Alerts reuse entity card visual language (rounded cards, inline actions).
2. **State Transparency** – Sticky bar communicates `Unsaved changes`, `Saving…`, `All changes saved`.
3. **Context Preservation** – Preview is modal; leaving editor requires confirmation when dirty.
4. **Inline Insight** – Embedded mini chart shows alert/threshold relationship without navigation.
5. **Progressive Enhancement** – Works with mock API today; ready for backend once endpoints exist.

---

## State Management

### Router Search (`alertUrlStateSchema`)
```ts
type AlertUrlState = {
  alert: Alert;              // draft
  view: 'overview' | 'preview' | 'filters' | 'history';
  mode: 'create' | 'edit';
};
```

### React Query
- `['alerts']` – list for notifications page.
- `['alerts', alertId]` – detail used by editor.
- Queries backed by mock storage (`features/alerts/api/alerts.ts`) until backend is ready.

### Local Store (`useAlertStore`)
- Exposes `alert`, `view`, `mode`, `setAlert`, `updateAlert`, `updateSeries`, `setCondition`, `setView`.
- Dirty tracking compares draft to `baselineAlert` (server snapshot or initial draft).

---

## Components & UX Details

| Component | Responsibility | Notes |
|-----------|----------------|-------|
| `NotificationList` | Renders entity notifications + data series alerts | Alerts section provides toggle, open, delete, chart preview, “create” button |
| `AlertEditorView` | Full-screen editor | Sticky controls, modal preview, unsaved-change dialog, uses `SeriesFilter` |
| `UnsavedChangesDialog` | Custom Radix dialog | Centered icon badge, primary/secondary actions |
| `ChartPreview` | Shared mini chart | Editor + notifications preview reuse; `customizeChart` toggles legend/tooltip |

---

## Business Logic & Validation
- Alerts compare two series: user-selected data series, auto-generated threshold (constant line).
- Threshold condition operators: `gt`, `gte`, `lt`, `lte`, `eq`; units default `RON` but editable.
- **Alert behavior**: Alerts are included in every monthly newsletter with their current status. When the threshold condition is met, the alert is emphasized with a customized message.
- Toggle disabled for pending mutations; delete disabled while request in flight.
- Preview chart always shows both lines with consistent colors (`alert.series.config.color`, `#f97316` for threshold).

---

## API / Persistence (Mock)
- Stored in `localStorage` under `mock-alerts-server`.
- `fetchAlerts`, `fetchAlert`, `saveAlert`, `deleteAlert`, `createAlertTemplate`.
- Replace with backend endpoints mirroring newsletter API once available.

---

## Open Questions / Next Steps
1. **Backend contract** – confirm endpoints & payloads (`PUT /alerts`?, etc.).
2. **Newsletter integration** – implement monthly alert status inclusion in newsletters with emphasis when thresholds are met.
3. **Email content** – design alert messaging template with conditional emphasis based on threshold status.
4. **Access control** – enforce auth on API once backend shipped.
5. **Metrics** – feed alert interactions into analytics (`AlertViewChanged`, `AlertCreated`, etc.).

---

## References
- [NOTIFICATIONS_SPEC.md](../NOTIFICATIONS_SPEC.md) – Newsletter flows and existing notification patterns.
- Source modules:  
  - `src/features/notifications/components/NotificationList.tsx`  
  - `src/components/alerts/components/AlertEditorView.tsx`  
  - `src/features/alerts/api/alerts.ts`
