import { useEffect, useRef } from 'react'
import { Analytics } from '@/lib/analytics'

type EntityViewAnalyticsParams = {
  cui: string
  view: string
  period: string
  year: number
  normalization: string
}

/**
 * Tracks analytics events for entity view interactions.
 * - Fires EntityViewOpened when navigating to a new entity
 * - Fires EntityViewChanged when switching views within the same entity
 */
export function useEntityViewAnalytics({
  cui,
  view,
  period,
  year,
  normalization,
}: EntityViewAnalyticsParams) {
  const previousRef = useRef<{ cui: string; view: string } | null>(null)

  useEffect(() => {
    const previous = previousRef.current

    if (previous?.cui !== cui) {
      // New entity opened
      Analytics.capture(Analytics.EVENTS.EntityViewOpened, {
        cui,
        view,
        period_type: period,
        year,
        normalization,
      })
    } else if (previous.view !== view) {
      Analytics.capture(Analytics.EVENTS.EntityViewChanged, {
        cui,
        from_view: previous.view,
        to_view: view,
      })
    }

    previousRef.current = { cui, view }
  }, [cui, view, period, year, normalization])
}
