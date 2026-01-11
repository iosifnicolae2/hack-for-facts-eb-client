import { createRouter, defaultStringifySearch } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import GlobalErrorPage from "@/components/errors/GlobalErrorPage";
import { createQueryClient } from "@/lib/queryClient";
import type { RouterContext } from "@/router-context";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = createQueryClient();
  // Normalize URL encoding to match browser/Vercel conventions and prevent SSR redirect loops.
  // TanStack Router uses URLSearchParams internally (spaces → +, encodes ! ' ( ) ~),
  // but browsers/Vercel use encodeURIComponent (spaces → %20, leaves ! ' ( ) ~ unescaped).
  // This mismatch causes 307 redirects when search params contain human-readable strings.
  // No built-in TanStack Router option exists; post-processing is the recommended approach.
  // See: https://tanstack.com/router/v1/docs/framework/react/guide/custom-search-param-serialization
  const stringifySearch = (search: Record<string, any>) =>
    defaultStringifySearch(search)
      .replace(/\+/g, "%20")
      .replace(/%21/gi, "!")
      .replace(/%27/gi, "'")
      .replace(/%28/gi, "(")
      .replace(/%29/gi, ")")
      .replace(/%7e/gi, "~");

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultErrorComponent: ({ error }) => <GlobalErrorPage error={error} />,
    stringifySearch,
    // Enable automatic scroll-to-top on navigation
    scrollRestoration: true,
    // Use smooth scrolling for better UX
    scrollRestorationBehavior: "instant",
    // Scroll both window and main content area
    scrollToTopSelectors: ["window", '[role="main"]'],
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
    context: RouterContext;
  }
}
