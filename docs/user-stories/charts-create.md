### Title

As a user, I want to create a new chart and be taken directly to configuration, so that I can define series and options quickly.

### Context

Route: `/charts/new` redirects to `/charts/$chartId?view=config`. Analytics capture on creation.

### Actors

- User creating a chart

### User Flow

1. Click “Create chart” on list.
2. New chart id generated; navigates to config dialog.
3. User configures chart and saves to local storage.

### Acceptance Criteria

- Given I click create, when redirected, then config dialog is open.
- Given I close dialog, when done, then I return to overview.

### Error and Empty States

If storage is unavailable, show error toast and guidance.

### Analytics & Telemetry

Capture ChartCreated event with `chart_id`.

### Accessibility

Dialog focus trap and keyboard support.

### Performance

Lightweight creation; config UI lazy-loaded.

### Open Questions

- Do we suggest a template on creation?


