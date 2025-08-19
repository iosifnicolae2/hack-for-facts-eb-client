import * as Sentry from "@sentry/react";
import { env } from "@/config/env";
import { hasAnalyticsConsent, hasSentryConsent } from "@/lib/consent";
import {
  captureConsoleIntegration,
  extraErrorDataIntegration,
  replayIntegration,
} from "@sentry/react";

/**
 * Public handles to open customized Sentry Feedback dialogs programmatically.
 * These are set only after Sentry.init + feedbackIntegration are active on the client.
 */
export let openSentryFeedback: (() => void) | null = null;
export let openSentryBugReport: (() => void) | null = null;

/** Small helper */
const isBrowser = typeof window !== "undefined";

/**
 * Disable Sentry without tearing down the app.
 * (We avoid draining/closing to keep it instant; flip `enabled` instead.)
 */
export function cleanupSentry(): void {
  if (!isBrowser) return;
  const client = Sentry.getClient();
  if (client) client.getOptions().enabled = false;
  openSentryFeedback = null;
  openSentryBugReport = null;
}

/**
 * React 19 createRoot error handlers.
 * These capture uncaught, caught, and recoverable errors via Sentry.
 */
export function getReactRootErrorHandlers() {
  const sentryErrorHandler = Sentry.reactErrorHandler();
  return {
    onUncaughtError: (error: unknown, info: { componentStack?: string }) => {
      sentryErrorHandler(error, info);
    },
    onCaughtError: (error: unknown, info: { componentStack?: string }) => {
      sentryErrorHandler(error, info);
    },
    onRecoverableError: (error: unknown, info: { componentStack?: string }) => {
      sentryErrorHandler(error, info);
    },
  } as const;
}

/**
 * Initialize Sentry for the client app.
 * Call before rendering React.
 */
export function initSentry(router: unknown): void {
  const sentryEnabled = Boolean(env.VITE_SENTRY_ENABLED) && Boolean(env.VITE_SENTRY_DSN);
  if (!sentryEnabled || !isBrowser) return;

  // If already initialized, just re-enable and stop.
  const existing = Sentry.getClient();
  if (existing) {
    existing.getOptions().enabled = true;
    return;
  }

  const analyticsConsent = hasAnalyticsConsent();
  const sentryConsent = hasSentryConsent();

  const integrations: NonNullable<
    Parameters<typeof Sentry.init>[0]
  >["integrations"] = [];

  // Replays (only with analytics consent)
  if (analyticsConsent) {
    integrations.push(replayIntegration());
  }

  // Performance tracing — only if sampling > 0 AND analytics consent granted
  const configuredTracesSampleRate = Number(env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0);
  const tracesSampleRate =
    analyticsConsent && !Number.isNaN(configuredTracesSampleRate)
      ? configuredTracesSampleRate
      : 0;

  if (tracesSampleRate > 0 && router) {
    const anySentry = Sentry as unknown as Record<string, unknown>;
    const tanstack = anySentry["tanstackRouterBrowserTracingIntegration"];
    if (typeof tanstack === "function") {
      integrations.push((tanstack as (r: unknown) => unknown)(router) as unknown as any);
    } else if (typeof Sentry.browserTracingIntegration === "function") {
      integrations.push(Sentry.browserTracingIntegration());
    }
  }

  // Feedback widget (only if allowed + consented)
  const feedbackEnabled = env.VITE_SENTRY_FEEDBACK_ENABLED !== false;
  if (feedbackEnabled && sentryConsent) {
    integrations.push(
      Sentry.feedbackIntegration({
        colorScheme: "system",
        enableScreenshot: true,
        autoInject: false,
        // Default text (you can still override per-open via attachTo)
        formTitle: "Send Feedback",
        messageLabel: "What happened?",
        messagePlaceholder:
          "Describe the bug or request. Steps to reproduce, expected vs. actual…",
        submitButtonLabel: "Send Feedback",
        cancelButtonLabel: "Close",
      }),
    );
  }

  // Extra context + console capture
  integrations.push(
    extraErrorDataIntegration({ depth: 5 }),
    captureConsoleIntegration({
      // Keep logs if you want Sentry breadcrumbs to mirror console activity
      levels: ["error", "warn", "log", "info", "debug"],
    }),
  );

  // Helper to aggressively sanitize events when consent is not granted
  type SentryEventLike = {
    readonly [key: string]: unknown;
    user?: unknown;
    request?: unknown;
    breadcrumbs?: unknown;
    extra?: unknown;
    contexts?: unknown;
    tags?: unknown;
    server_name?: unknown;
  };

  function sanitizeEventForNoConsent(event: SentryEventLike): SentryEventLike {
    return {
      ...event,
      user: undefined,
      request: undefined,
      breadcrumbs: undefined,
      extra: undefined,
      contexts: undefined,
      tags: undefined,
      server_name: undefined,
    };
  }

  try {
    Sentry.init({
      dsn: env.VITE_SENTRY_DSN!,
      environment: env.VITE_APP_ENVIRONMENT,
      release: env.VITE_APP_VERSION,
      integrations,
      // Performance
      tracesSampleRate,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: analyticsConsent ? 0.1 : 0,
      // Respect privacy consent
      beforeSend(event) {
        if (!hasSentryConsent()) {
          // Send a minimal, anonymous error payload (no breadcrumbs/contexts/user/request)
          const sanitized = sanitizeEventForNoConsent(event as unknown as SentryEventLike);
          return sanitized as unknown as typeof event;
        }
        return event;
      },
    });
  } catch {
    // If init fails, keep openers null and return quietly.
    openSentryFeedback = null;
    openSentryBugReport = null;
    return;
  }

  // Ensure no user identity is attached without consent
  if (!sentryConsent) {
    Sentry.setUser(null);
  }

  // Programmatic Feedback openers (client-only, after init)
  const feedback = Sentry.getFeedback?.();
  if (!feedback) {
    openSentryFeedback = null;
    openSentryBugReport = null;
    return;
  }

  // Utility to open with per-call overrides using attachTo()
  const createOpener = (
    options: Parameters<NonNullable<typeof feedback>["attachTo"]>[1],
  ) => () => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.style.display = "none";
    document.body.appendChild(btn);
    try {
      feedback.attachTo(btn, options);
      btn.click();
    } finally {
      // Clean up immediately after triggering
      btn.remove();
    }
  };

  openSentryFeedback = createOpener({
    formTitle: "Send Feedback",
    messageLabel: "What happened?",
    messagePlaceholder:
      "Describe your feedback or idea. Steps, expectations, or suggestions…",
    submitButtonLabel: "Send Feedback",
  });

  openSentryBugReport = createOpener({
    formTitle: "Report a Bug",
    messageLabel: "What is the bug?",
    messagePlaceholder:
      "Describe the bug. Include steps to reproduce, expected vs actual, and any screenshots.",
    submitButtonLabel: "Report Bug",
  });
}
