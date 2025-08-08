import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { PostHogProvider } from "posthog-js/react";

import "./index.css";


// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { queryClient } from "@/lib/queryClient";
import { env } from "./config/env";

// Create a new router instance
const router = createRouter({ routeTree, context: { queryClient } });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
    context: {
      queryClient: typeof queryClient;
    };
  }
}

// Initialize MSW and then render the app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={env.VITE_POSTHOG_API_KEY || ""}
      options={
        env.VITE_POSTHOG_ENABLED
          ? {
            api_host: env.VITE_POSTHOG_HOST,
            person_profiles: env.VITE_POSTHOG_PERSON_PROFILES,
          }
          : undefined
      }
    >
      <RouterProvider router={router} />
    </PostHogProvider>
  </StrictMode>
);
