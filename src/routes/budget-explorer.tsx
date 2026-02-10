import { createFileRoute } from '@tanstack/react-router'
import { createPublicPageCacheHeaders } from '@/lib/http-cache'

export const Route = createFileRoute('/budget-explorer')({
  headers: () =>
    createPublicPageCacheHeaders({
      sharedMaxAgeSeconds: 3600,
      staleWhileRevalidateSeconds: 86400,
    }),
})
