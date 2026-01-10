import { createRouter, defaultStringifySearch } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import GlobalErrorPage from "@/components/errors/GlobalErrorPage";
import { createQueryClient } from "@/lib/queryClient";
import type { RouterContext } from "@/router-context";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = createQueryClient();
  // Avoid SSR redirect loops caused by query string normalization differences.
  // FIXME: Start canonicalizes the URL on SSR by re-stringifying search params.
  // Vercel + browsers typically use encodeURIComponent-style encoding
  // (%20 for spaces, and they leave ! ' ( ) ~ unescaped), while the default
  // serializer uses URLSearchParams (+ for spaces and percent-encodes those
  // characters). If we don't normalize, reloads can loop with 307 redirects
  // when search contains human-readable strings (alert titles, report types).
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
