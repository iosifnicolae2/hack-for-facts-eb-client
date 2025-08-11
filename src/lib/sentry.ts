import * as Sentry from "@sentry/react";
import { env } from "@/config/env";
import { hasAnalyticsConsent, hasSentryConsent } from "@/lib/consent";
import { captureConsoleIntegration, extraErrorDataIntegration, replayIntegration } from "@sentry/react";

/**
 * Public handle to open the Sentry User Feedback dialog programmatically.
 * Will be set when Sentry has been initialized and the feedback integration is available.
 */
export let openSentryFeedback: (() => void) | null = null;

/**
 * React 19 error handlers for createRoot options.
 * These will capture uncaught, caught, and recoverable errors via Sentry.
 */
export function getReactRootErrorHandlers() {
  const sentryErrorHandler = Sentry.reactErrorHandler();
  return {
    onUncaughtError: (error: unknown, errorInfo: { componentStack?: string }) => {
      sentryErrorHandler(error, errorInfo);
    },
    onCaughtError: (error: unknown, errorInfo: { componentStack?: string }) => {
      sentryErrorHandler(error, errorInfo);
    },
    onRecoverableError: (error: unknown, errorInfo: { componentStack?: string }) => {
      sentryErrorHandler(error, errorInfo);
    }
  } as const;
}

/**
 * Initialize Sentry for the client app.
 * Should be called before rendering React.
 */
export function initSentry(router: unknown): void {
  const sentryEnabled = Boolean(env.VITE_SENTRY_ENABLED) && Boolean(env.VITE_SENTRY_DSN);
  if (!sentryEnabled || typeof window === "undefined") {
    return;
  }

  const analyticsConsent = hasAnalyticsConsent();
  const sentryConsent = hasSentryConsent();

  const integrations: unknown[] = [];

  if (analyticsConsent) {
    integrations.push(replayIntegration());
  }

  // Wire TanStack Router tracing only when sampling is enabled AND analytics consent granted
  const configuredTracesSampleRate = Number(env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0);
  const tracesSampleRate = analyticsConsent && !Number.isNaN(configuredTracesSampleRate)
    ? configuredTracesSampleRate
    : 0;
  if (tracesSampleRate > 0 && router) {
    const anySentry = Sentry as unknown as Record<string, unknown>;
    const tanstack = anySentry["tanstackRouterBrowserTracingIntegration"];
    if (typeof tanstack === "function") {
      integrations.push((tanstack as (r: unknown) => unknown)(router));
    } else if (typeof Sentry.browserTracingIntegration === "function") {
      integrations.push(Sentry.browserTracingIntegration());
    }
  }

  // Configure the Feedback widget (only if consent granted)
  let feedbackIntegration: ReturnType<typeof Sentry.feedbackIntegration> | null = null;
  const feedbackEnabled = env.VITE_SENTRY_FEEDBACK_ENABLED !== false;
  if (feedbackEnabled && sentryConsent) {
    feedbackIntegration = Sentry.feedbackIntegration({
      colorScheme: "system",
      enableScreenshot: true,
      position: "bottom-left",
    });
    integrations.push(feedbackIntegration);
  }

  integrations.push(extraErrorDataIntegration({
    depth: 5,
  }));

  integrations.push(captureConsoleIntegration({
    levels: ["error", "warn", "log", "info", "debug"],
  }));

  // Helper to aggressively sanitize events when analytics consent is not granted
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
    // Remove anything that could be considered personal or behavioral data.
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

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN!,
    environment: env.VITE_APP_ENVIRONMENT,
    release: env.VITE_APP_VERSION,
    integrations: integrations as NonNullable<Parameters<typeof Sentry.init>[0]>["integrations"],
    // Performance
    tracesSampleRate,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: analyticsConsent ? 0.1 : 0,
    // Respect privacy consent — never send events if analytics is disabled
    beforeSend(event, _hint) {
      if (!hasSentryConsent()) {
        // Send a minimal, anonymous error payload (no breadcrumbs/contexts/user/request)
        const sanitized = sanitizeEventForNoConsent(event as unknown as SentryEventLike);
        return sanitized as unknown as typeof event;
      }
      return event;
    },
  });

  // Make sure no user identity is attached when analytics consent is not granted
  if (!sentryConsent) {
    Sentry.setUser(null);
  }

  // Expose a programmatic opener for feedback if available
  if (feedbackIntegration) {
    try {
      const formPromise = feedbackIntegration.createForm();
      openSentryFeedback = () => {
        void formPromise.then((form) => {
          form.appendToDom();
          form.open();
        });
      };
    } catch {
      openSentryFeedback = null;
    }
  }
}


