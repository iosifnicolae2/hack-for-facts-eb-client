import { useEffect, useRef } from 'react'

/**
 * Hook that scrolls an element into view within a Radix ScrollArea.
 * Only scrolls the ScrollArea viewport, not the entire page.
 */
export function useScrollToActive<T extends HTMLElement>(activeId: string | null) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const viewport = el.closest('[data-radix-scroll-area-viewport]')
    if (!viewport) return

    const elRect = el.getBoundingClientRect()
    const vpRect = viewport.getBoundingClientRect()
    const scrollTop = viewport.scrollTop + elRect.top - vpRect.top - vpRect.height / 2 + elRect.height / 2
    viewport.scrollTop = Math.max(0, scrollTop)
  }, [activeId])

  return ref
}
