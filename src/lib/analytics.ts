import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useLocation } from "@tanstack/react-router";
import { env } from "@/config/env";
import { hasAnalyticsConsent } from "@/lib/consent";
import type { AnalyticsFilterType } from "@/schemas/charts";

/** Centralized, consent-aware analytics helpers (PostHog). */
const EVENTS = {
  EntitySearchPerformed: "entity_search_performed",
  EntitySearchSelected: "entity_search_selected",
  EntityViewOpened: "entity_view_opened",

  ChartsBackupExported: "charts_backup_exported",
  ChartsBackupImported: "charts_backup_imported",

  ChartCreated: "chart_created",
  ChartOpened: "chart_opened",
  ChartUpdated: "chart_updated",
  ChartDuplicated: "chart_duplicated",
  ChartViewChanged: "chart_view_changed",
  ChartFavoritedToggled: "chart_favorited_toggled",
  ChartDeleted: "chart_deleted",
  ChartCategoryToggled: "chart_category_toggled",

  ChartSeriesAdded: "chart_series_added",
  ChartSeriesDeleted: "chart_series_deleted",
  ChartSeriesDuplicated: "chart_series_duplicated",
  ChartSeriesReordered: "chart_series_reordered",

  ChartAnnotationAdded: "chart_annotation_added",
  ChartAnnotationDeleted: "chart_annotation_deleted",
  ChartAnnotationUpdated: "chart_annotation_updated",
  ChartAnnotationDuplicated: "chart_annotation_duplicated",

  MapFeatureClicked: "map_feature_clicked",
  MapFilterChanged: "map_filter_changed",
  MapActiveViewChanged: "map_active_view_changed",
  MapViewTypeChanged: "map_view_type_changed",

  EntityAnalyticsFilterChanged: "entity_analytics_filter_changed",
  EntityAnalyticsFilterReset: "entity_analytics_filter_reset",
  EntityAnalyticsViewChanged: "entity_analytics_view_changed",
  EntityAnalyticsSortChanged: "entity_analytics_sort_changed",
  EntityAnalyticsPaginationChanged: "entity_analytics_pagination_changed",
  EntityAnalyticsExportCsv: "entity_analytics_export_csv",

  CookieConsentChanged: "cookie_consent_changed",
  LanguageChanged: "language_changed",
  DefaultLanguage: "default_language",
} as const;

export type AnalyticsEventName = typeof EVENTS[keyof typeof EVENTS];

export function isAnalyticsEnabled(): boolean {
  return Boolean(env.VITE_POSTHOG_ENABLED) && hasAnalyticsConsent();
}

let _lastEventKey = "";
let _lastEventTs = 0;
const DEDUPE_MS = 300;

export function captureEvent(
  name: AnalyticsEventName,
  properties?: Record<string, unknown>
): void {
  try {
    if (!isAnalyticsEnabled()) return;
    const sanitized = sanitizeProps(properties);
    const key = `${name}:${JSON.stringify(sanitized ?? {})}`;
    const now = Date.now();
    if (_lastEventKey === key && now - _lastEventTs < DEDUPE_MS) return;
    _lastEventKey = key;
    _lastEventTs = now;
    posthog.capture(name, sanitized);
  } catch {
    // silent
  }
}

function sanitizeProps(
  props?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!props) return undefined;
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (value === null) {
      clean[key] = null;
      continue;
    }
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean") {
      clean[key] = value;
    } else if (Array.isArray(value)) {
      clean[key] = value.slice(0, 20);
    } else if (t === "object") {
      clean[key] = JSON.parse(JSON.stringify(value));
    }
  }
  return clean;
}

export function safeTruncate(input: string, max: number = 80): string {
  if (input.length <= max) return input;
  return `${input.slice(0, Math.max(0, max - 1))}…`;
}

export function summarizeFilter(
  filter: AnalyticsFilterType
): Record<string, unknown> {
  return {
    period_type: filter.report_period?.type,
    period_selection: filter.report_period?.selection.dates ? 'dates' : 'interval',
    period_len: filter.report_period?.selection.dates?.length ?? 1,
    account_category: filter.account_category,
    normalization: filter.normalization,
    fn_codes_len: filter.functional_codes?.length ?? 0,
    ec_codes_len: filter.economic_codes?.length ?? 0,
    entity_types_len: filter.entity_types?.length ?? 0,
    uat_len: filter.uat_ids?.length ?? 0,
    counties_len: filter.county_codes?.length ?? 0,
    budget_sector_len: filter.budget_sector_ids?.length ?? 0,
    funding_source_len: filter.funding_source_ids?.length ?? 0,
    has_prefixes: Boolean(
      (filter.functional_prefixes?.length ?? 0) +
        (filter.economic_prefixes?.length ?? 0)
    ),
  };
}

// Pageview tracking tied to TanStack Router location
export function usePageviewTracking(): void {
  const location = useLocation();
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    const pathname = location.pathname;
    const search = location.searchStr ?? "";
    const key = `${pathname}${search}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const url = `${window.location.origin}${pathname}${search}`;
    posthog.capture("$pageview", {
      $current_url: url,
      $pathname: pathname,
      $host: window.location.host,
    });
  }, [location]);
}

export const Analytics = {
  EVENTS,
  capture: captureEvent,
  pageviewHook: usePageviewTracking,
  summarizeFilter,
  safeTruncate,
};

export default Analytics;


