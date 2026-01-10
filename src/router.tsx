import { createRouter, defaultStringifySearch } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import GlobalErrorPage from "@/components/errors/GlobalErrorPage";
import { createQueryClient } from "@/lib/queryClient";
import type { RouterContext } from "@/router-context";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const queryClient = createQueryClient();
  // Avoid SSR redirect loops caused by space normalization in query strings.
  const stringifySearch = (search: Record<string, any>) =>
    defaultStringifySearch(search).replace(/\+/g, "%20");

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
