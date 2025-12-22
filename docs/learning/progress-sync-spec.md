# Learning Progress Sync Specification

Status: Draft
Last Updated: 2025-02-14

## 1. Summary

Progress is event-sourced. Each user action emits an immutable event, stored locally and synced to the API. The UI reads a full progress snapshot derived from the event log; the snapshot is cached for fast reads but is always recomputed on page load.

## 2. Context (Current Progress Behavior)

- Progress is stored locally as `LearningGuestProgress` and validated via `src/features/learning/schemas/progress.ts`.
- Guests use `localStorage` key `learning_progress`.
- Authenticated users currently use `localStorage` key `learning_progress:{userId}` (no API yet).
- `useLearningProgress` writes optimistic updates locally and emits a `learning-progress-update` event.
- `mergeLearningGuestProgress` performs a deterministic union merge on login.

## 3. Key Decisions and Rationale

- **Global unique IDs for content and interactions**: ensures reused items share progress across modules and locales; enforced by `learning:validate` in CI.
- **Event-sourced sync**: immutable events are easy to sync and replay; only new events are sent to the API.
- **Snapshot derived on load**: local snapshot is a cache; the event log is the source of truth.
- **Keep localStorage for now**: minimal change in storage layer; revisit IndexedDB if quota becomes a blocker.
- **Trust client updates**: the server stores events as provided; client is responsible for deterministic reduction.
- **Conflict rule**: reduce events in order of `occurredAt` and apply status precedence + `lastAttemptAt` logic to avoid regressions.

## 4. Data Model

### 4.1 Unique IDs and Validation

Progress items and interactions must be globally unique across all paths, modules, and locales.

- `contentId` is the unique ID for a progress item.
- `interactionId` is unique within the entire learning system (not just within a lesson).
- `learning:validate` runs in CI and fails on duplicate IDs.

Reused items are referenced by the same `contentId` so completion state is shared.

### 4.2 Event Log

Events are immutable and append-only. Each event represents a user action that modifies progress.

```ts
type LearningProgressEventBase = {
  eventId: string
  occurredAt: string
  clientId: string
  type: LearningProgressEventType
}

type LearningProgressEventType =
  | 'content.progressed'
  | 'onboarding.completed'
  | 'onboarding.reset'
  | 'activePath.set'
  | 'progress.reset'
  | 'progress.reset'

The server must store and return onboarding events alongside content progress events so the client can reconstruct onboarding state.
The `progress.reset` event clears the derived snapshot without deleting any historical events.

type ContentProgressPayload = {
  contentId: string
  status: LearningContentStatus
  score?: number
  contentVersion?: string
  interaction?: {
    interactionId: string
    state: LearningInteractionState | null
  }
}

type ContentProgressedEvent = LearningProgressEventBase & {
  type: 'content.progressed'
  payload: ContentProgressPayload
}

type OnboardingCompletedEvent = LearningProgressEventBase & {
  type: 'onboarding.completed'
  payload: { pathId: string }
}

type OnboardingResetEvent = LearningProgressEventBase & {
  type: 'onboarding.reset'
}

type ActivePathSetEvent = LearningProgressEventBase & {
  type: 'activePath.set'
  payload: { pathId: string | null }
}

type LearningProgressEvent =
  | ContentProgressedEvent
  | OnboardingCompletedEvent
  | OnboardingResetEvent
  | ActivePathSetEvent
  | ProgressResetEvent
```

### 4.3 Snapshot (Derived State)

The canonical UI state remains a full snapshot:

```ts
type LearningProgressSnapshot = LearningGuestProgress
```

The snapshot is recomputed by reducing the sorted event log:

- Sort by `occurredAt`, tie-break by `eventId`.
- Apply each event using existing progress rules (`upsertContentProgress`, status precedence, score max).
- Update streak when content transitions to `completed` or `passed` using the existing streak calculator.
- `lastUpdated` is the max `occurredAt` in the log.

### 4.4 Storage Keys

- Guest events: `learning_progress_events`
- Guest snapshot cache: `learning_progress_snapshot`
- Auth events: `learning_progress_events:{userId}`
- Auth snapshot cache: `learning_progress_snapshot:{userId}`
- Auth sync metadata: `learning_progress_sync:{userId}`

### 4.5 Sync Metadata (Client-Only)

Sync status is stored separately and is never sent to the API.

```ts
type LearningSyncStatus = 'synced' | 'local' | 'syncing' | 'error'

type LearningProgressSyncEntry = {
  status: LearningSyncStatus
  lastAttemptAt: string | null
  lastSyncedAt: string | null
  retryCount: number
  errorMessage?: string
}

type LearningProgressSyncState = {
  version: 1
  events: Record<string, LearningProgressSyncEntry>
  lastSuccessfulSyncAt: string | null
  lastSyncedCursor: string | null
}
```

## 5. API Contract (REST)

Base URL: `${VITE_API_URL}/api/v1/learning`

### 5.1 Fetch progress snapshot and remote events

```
GET /progress?since=<cursor>
Authorization: Bearer <token>

Response:
{
  ok: true,
  data: {
    snapshot: LearningProgressSnapshot,
    events: LearningProgressEvent[],
    cursor: string
  }
}
```

Notes:

- `cursor` is the server’s latest event position.
- If `since` is omitted, `events` may be empty and `snapshot` is still returned to validate full progress on load.
- The client stores `cursor` and uses it to pull only new events after each sync.
- The server must always return the authoritative `events` array; snapshots are optional and should never be the only source of truth.

### 5.2 Upsert events (single endpoint)

```
PUT /progress
Authorization: Bearer <token>
Body:
{
  clientUpdatedAt: string,
  events: LearningProgressEvent[]
}

Response:
{
  ok: true
}
```

**Server behavior:**

- Store events by `eventId` and ignore duplicates (idempotent).
- Do not mutate event payloads; trust client updates.
- Snapshot can be derived server-side for `GET /progress`.

#### API Interface (Example for Backend)

```ts
export type LearningProgressEventType =
  | 'content.progressed'
  | 'onboarding.completed'
  | 'onboarding.reset'
  | 'activePath.set'

export type LearningProgressEventBase = {
  eventId: string
  occurredAt: string
  clientId: string
  type: LearningProgressEventType
}

export type LearningContentProgressPayload = {
  contentId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'passed'
  score?: number
  contentVersion?: string
  interaction?: {
    interactionId: string
    state: { kind: 'quiz'; selectedOptionId: string | null } | null
  }
}

export type LearningProgressEvent =
  | (LearningProgressEventBase & {
      type: 'content.progressed'
      payload: LearningContentProgressPayload
    })
  | (LearningProgressEventBase & {
      type: 'onboarding.completed'
      payload: { pathId: string }
    })
  | (LearningProgressEventBase & {
      type: 'onboarding.reset'
    })
  | (LearningProgressEventBase & {
      type: 'activePath.set'
      payload: { pathId: string | null }
    })
  | (LearningProgressEventBase & {
      type: 'progress.reset'
    })

export type SyncProgressEventsRequest = {
  clientUpdatedAt: string
  events: LearningProgressEvent[]
}

export type SyncProgressEventsResponse = {
  ok: true
}
```

Example payload:

```json
{
  "clientUpdatedAt": "2025-12-22T20:36:50.595Z",
  "events": [
    {
      "eventId": "event-1",
      "occurredAt": "2025-12-22T20:36:50.595Z",
      "clientId": "client-123",
      "type": "content.progressed",
      "payload": {
        "contentId": "promises-vs-reality",
        "status": "passed",
        "score": 100,
        "contentVersion": "v1",
        "interaction": {
          "interactionId": "pattern-recognition-quiz",
          "state": { "kind": "quiz", "selectedOptionId": "c" }
        }
      }
    }
  ]
}
```

## 6. Sync Lifecycle

### 6.1 Bootstrapping (Authenticated)

1. Read guest events and snapshot cache.
2. Read local auth event log and snapshot cache.
3. Enter bootstrap mode and queue local updates triggered during bootstrap.
4. Fetch remote snapshot/events from `GET /progress`.
5. Merge event logs by `eventId` and recompute the snapshot.
6. Replay queued updates on top of the merged snapshot.
7. Persist merged event log and snapshot cache.
8. Clear guest storage only after remote sync succeeds.
9. Push any local events via `PUT /progress`.
10. Store the returned `cursor` to enable incremental pulls.

### 6.1.1 Logout and Re-Onboarding

- Logging out switches the UI to the guest event log and snapshot cache.
- Authenticated events are preserved under `learning_progress_events:{userId}` and are not modified while logged out.
- If a user completes onboarding as a guest after logout, a new `onboarding.completed` event is created in the guest log.
- When they log back in, guest events are merged with auth events; the latest onboarding event (by `occurredAt`) determines the snapshot state.
- Previous onboarding events remain in the event log and are not deleted.

### 6.2 Local Updates (Optimistic)

When a user action updates progress:

- Create a new event with `eventId`, `occurredAt`, and `clientId`.
- Append the event to the local event log.
- Mark the event as `local` in sync metadata.
- Apply the event to the in-memory snapshot and persist the snapshot cache.
- Schedule a background sync (debounced).

### 6.2.1 Cross-Tab Sync

Listen for `storage` events and recompute local state when another tab updates the log:

```ts
window.addEventListener('storage', (event) => {
  if (event.key?.startsWith('learning_progress_events')) {
    recomputeSnapshotFromEvents()
  }
})
```

### 6.3 Background Sync Worker (Events Only)

Trigger conditions:

- After any local update (debounced, e.g. 1-2s).
- On `visibilitychange` to `visible`.
- On `online` event after offline.
- On explicit manual `sync()` call.

Sync steps:

1. Snapshot `syncStartedAt = nowIso()`.
2. Mark unsynced events as `syncing`.
3. Send unsynced events via `PUT /progress`.
4. Pull remote events via `GET /progress?since=<cursor>` and merge them into the local log.
5. On success:
   - Mark synced events as `synced`.
   - Set `lastSyncedAt` for those events.
6. On failure:
   - Mark events as `error`.
   - Increment `retryCount`.
   - Retry with exponential backoff and limits:
     - `const MAX_RETRIES = 4`
     - `const RETRY_DELAYS = [1000, 5000, 15000, 60000]`

### 6.4 Conflict Resolution

- Merge event logs by `eventId` (set union).
- Reduce events in `occurredAt` order with status precedence to prevent regressions.
- Local snapshot is the source of truth for UI.

## 7. Error Handling and Offline

- If offline (`navigator.onLine === false`), keep events local and set status to `local`.
- When back online, the sync worker runs automatically.
- A permanent error (4xx) should:
  - Log a warning.
  - Keep events in `error` until a manual retry or sign-out.

### 7.1 localStorage Quota Handling

Wrap `localStorage` writes in try/catch and handle `QuotaExceededError` gracefully:

- Keep in-memory progress state so the UI does not crash.
- Surface a warning (console or toast) and mark events as `error` until storage clears.
- Avoid deleting historical events from local storage.

## 8. Testing Plan

### 8.1 Unit Tests (Vitest)

- `progress-event-reducer.test.ts`
  - Reduces event logs deterministically with status precedence.
  - Handles interaction removal (`state: null`) for quiz reset.
  - Produces stable `lastAttemptAt` and `completedAt` when events are ordered by `occurredAt`.
- `progress-sync-state.test.ts`
  - `markLocal` sets event status to `local`.
  - `startSync` moves eligible events to `syncing`.
  - `finishSyncSuccess` marks events as `synced`.
  - `finishSyncFailure` increments `retryCount`.
- `learning-validate.test.ts`
  - Enforce unique `contentId` and `interactionId` across all learning content.

### 8.2 Integration Tests (Vitest + Testing Library)

- `use-learning-progress.test.tsx`
  - Authenticated updates create events and update snapshot immediately.
  - Successful API sync marks events `synced` and clears guest storage.
  - Failed API sync marks events `error` and retries on next trigger.
  - Cross-tab `storage` event triggers recompute and refreshes UI state.
  - Bootstrap queue replays local updates made during initial fetch.

### 8.3 E2E Tests (Playwright)

- **Auth Sync Flow**
  - Complete lesson as guest.
  - Login.
  - Verify local progress is visible immediately.
  - Verify event sync requests are sent and stored remotely.
- **Offline Progress**
  - Set browser offline.
  - Complete a lesson.
  - Verify progress shows locally and events are `local`.
  - Set online and verify sync completes.

## 9. Non-Goals

- Replacing guest local-only behavior.
- Server-side re-scoring of quiz answers.
- UI redesign for sync indicators.
