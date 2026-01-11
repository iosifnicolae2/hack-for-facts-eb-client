import type { QueryClient } from "@tanstack/react-query";
import type { ResolvedTheme } from "@/components/theme/theme-provider";

export type RouterContext = {
  queryClient: QueryClient;
  /** Theme resolved during SSR from cookie, used to prevent FOUC */
  ssrTheme?: ResolvedTheme;
};
