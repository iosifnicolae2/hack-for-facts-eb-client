import type { QueryClient } from '@tanstack/react-query'

declare module '@tanstack/react-router' {
  interface Register {
    context: {
      queryClient: QueryClient
    }
  }
}


