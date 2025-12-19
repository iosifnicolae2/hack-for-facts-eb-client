import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data considered fresh for 1 minute - reduces refetching on navigation
        staleTime: 1000 * 60,
        // Keep unused data in cache for 5 minutes before garbage collection
        gcTime: 1000 * 60 * 5,
        // Retry failed queries once
        retry: 1,
        // Don't refetch on window focus by default (reduces flash on tab switch)
        refetchOnWindowFocus: false,
      },
    },
  });
}

