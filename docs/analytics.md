# Analytics Specification (PostHog)

## Consent & Privacy
- Only capture events when analytics consent is granted.
- No PII. CUIs are public identifiers and acceptable.
- Autocapture disabled. Session recording disabled.

## Super Properties
- `app_version`, `app_name`, `environment` registered at startup.

## Pageviews
- `$pageview` emitted by router-based hook on location change.
- No initial `$pageview` in boot code.

## Event Taxonomy
- Search
  - `entity_search_performed`: query_len, results_count, has_results
  - `entity_search_selected`: cui
- Entities
  - `entity_view_opened`: cui, view, trend_mode
- Charts
  - `chart_created`: chart_id
  - `chart_opened`: chart_id, source
  - `chart_updated`: chart_id, series_count, annotations_count
  - `chart_view_changed`: chart_id, view, [series_id|annotation_id]
  - `chart_favorited_toggled`: chart_id, now_favorite
  - `chart_deleted`: chart_id
  - `chart_category_toggled`: chart_id, category_id
  - Series: `chart_series_added|deleted|duplicated|reordered`: chart_id, series_id, [new_series_id], [direction]
  - Annotations: `chart_annotation_added|deleted|updated|duplicated`: chart_id, annotation_id
- Backup/Restore
  - `charts_backup_exported`: charts_count, categories_count
  - `charts_backup_imported`: added, replaced, duplicated, skipped
- Map
  - `map_feature_clicked`: map_view_type, feature_id
  - `map_filter_changed`: filter_hash, summarized filter fields
  - `map_active_view_changed`: view
  - `map_view_type_changed`: view_type
- Entity Analytics
  - `entity_analytics_filter_changed`: filter_hash, summarized filter fields
  - `entity_analytics_view_changed`: view
  - `entity_analytics_sort_changed`: by, order
  - `entity_analytics_pagination_changed`: page, pageSize
  - `entity_analytics_export_csv`: rows, filter_hash
- Consent
  - `cookie_consent_changed`: analytics, sentry

## Implementation Notes
- See `src/lib/analytics.ts` for helpers, dedupe (300ms), and filter summarization.
- Pageview hook is wired in `src/routes/__root.tsx`.
- Feature instrumentation lives alongside feature code.

## PostHog Playbook
- Dashboards: Exec overview, Search Effectiveness, Charts Engagement, Map Adoption, Entity Analytics, Reliability.
- Funnels: search → selection → entity page; new chart flow.
- Retention: creators vs viewers; map power users; CSV exporters.
- Segmentation: by `environment`, `app_version`, filter summaries.
- Alerts: error spike; selection conversion drop.


