import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/budget-explorer')({
  headers: () => ({
    // Budget explorer is mostly static - cache 1 hour CDN, 1 day stale-while-revalidate
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  }),
})
