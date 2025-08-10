import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";

import "./index.css";


// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { queryClient } from "@/lib/queryClient";
import { env } from "./config/env";
import { getReactRootErrorHandlers, initSentry } from "@/lib/sentry";

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } });

// Initialize Sentry early (before rendering)
initSentry(router);

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
    context: {
      queryClient: typeof queryClient;
    };
  }
}

// Configure PostHog to respect consent before rendering
if (!hasAnalyticsConsent()) {
  posthog.opt_out_capturing();
} else {
  posthog.opt_in_capturing();
  posthog.capture('$pageview');
}

// React to consent changes at runtime
if (typeof window !== 'undefined') {
  onConsentChange((prefs) => {
    if (prefs.analytics) {
      posthog.opt_in_capturing();
      posthog.capture('$pageview');
    } else {
      posthog.opt_out_capturing();
    }
  });
}

// Initialize app
ReactDOM.createRoot(document.getElementById("root")!, getReactRootErrorHandlers()).render(
  <StrictMode>
    <PostHogProvider
      apiKey={env.VITE_POSTHOG_API_KEY || ""}
      options={
        env.VITE_POSTHOG_ENABLED
          ? {
            api_host: env.VITE_POSTHOG_HOST,
            person_profiles: env.VITE_POSTHOG_PERSON_PROFILES,
            opt_out_capturing_by_default: true,
            autocapture: false,
            capture_pageview: false,
            disable_session_recording: true,
          }
          : undefined
      }
    >
      <RouterProvider router={router} />
    </PostHogProvider>
  </StrictMode>
);
