import * as Sentry from "@sentry/react";
import { env } from "@/config/env";
import { hasAnalyticsConsent } from "@/lib/consent";

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
  return {
    onUncaughtError: Sentry.reactErrorHandler(),
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
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

  const consentGranted = hasAnalyticsConsent();

  const integrations: unknown[] = [];

  // Wire TanStack Router tracing only when sampling is enabled
  const tracesSampleRate = Number(env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0);
  if (!Number.isNaN(tracesSampleRate) && tracesSampleRate > 0 && router) {
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
  if (feedbackEnabled && consentGranted) {
    feedbackIntegration = Sentry.feedbackIntegration({
      colorScheme: "system",
      enableScreenshot: true,
    });
    integrations.push(feedbackIntegration);
  }

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN!,
    environment: env.VITE_APP_ENVIRONMENT,
    release: env.VITE_APP_VERSION,
    integrations: integrations as NonNullable<Parameters<typeof Sentry.init>[0]>["integrations"],
    // Performance
    tracesSampleRate,
    // Respect privacy consent — never send events if analytics is disabled
    beforeSend(event) {
      if (!hasAnalyticsConsent()) {
        return null;
      }
      return event;
    },
  });

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


