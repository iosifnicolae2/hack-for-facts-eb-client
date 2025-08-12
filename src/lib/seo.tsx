import { useEffect } from 'react'
import { getSiteUrl } from '@/config/env'
import { useLocation } from '@tanstack/react-router'
import serialize from 'serialize-javascript'

export type SeoProps = {
  readonly title?: string
  readonly description?: string
  readonly image?: string
  readonly type?: 'website' | 'article'
  readonly canonical?: string
  readonly noindex?: boolean
  readonly locale?: string
  readonly siteName?: string
  // Extra key/value pairs for meta tags
  readonly additionalMeta?: ReadonlyArray<{ name: string; content: string }>
}

const DEFAULTS = {
  title: 'Transparenta.eu',
  description:
    'Explore Romania public finance data with charts, maps, and analytics.',
  image: '/logo.png',
  type: 'website' as const,
  siteName: 'Transparenta.eu',
  locale: 'en',
}

/**
 * Lightweight SEO component that mutates document head on route changes.
 * Designed for CSR apps, works well with TanStack Router.
 */
export function Seo(props: SeoProps): null {
  const location = useLocation()
  const siteUrl = getSiteUrl()
  const path = location.href ?? location.pathname
  const url = props.canonical || `${siteUrl}${path.startsWith('http') ? new URL(path).pathname + new URL(path).search : path}`

  const title = props.title || DEFAULTS.title
  const description = props.description || DEFAULTS.description
  const image = absoluteUrl(props.image || DEFAULTS.image, siteUrl)
  const type = props.type || DEFAULTS.type
  const siteName = props.siteName || DEFAULTS.siteName
  const locale = props.locale || DEFAULTS.locale

  useEffect(() => {
    document.title = title

    const tags: { selector: string; el: HTMLMetaElement | HTMLLinkElement }[] = []

    // Helpers
    const upsertMeta = (attrs: Record<string, string>) => {
      const selector = Object.entries(attrs)
        .map(([k, v]) => `[${k}="${cssEscape(v)}"]`)
        .join('')
      let el = document.head.querySelector<HTMLMetaElement>(`meta${selector}`)
      if (!el) {
        el = document.createElement('meta')
        Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v))
        document.head.appendChild(el)
      } else if (attrs.content) {
        el.setAttribute('content', attrs.content)
      }
      tags.push({ selector: `meta${selector}`, el })
    }

    const upsertLink = (rel: string, href: string) => {
      const selector = `link[rel="${cssEscape(rel)}"]`
      let el = document.head.querySelector<HTMLLinkElement>(selector)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
      }
      el.setAttribute('href', href)
      tags.push({ selector, el })
    }

    // Basic
    upsertMeta({ name: 'description', content: description })
    if (props.noindex) {
      upsertMeta({ name: 'robots', content: 'noindex, nofollow' })
    } else {
      upsertMeta({ name: 'robots', content: 'index, follow' })
    }

    // Canonical
    upsertLink('canonical', url)

    // Open Graph
    upsertMeta({ property: 'og:title', content: title })
    upsertMeta({ property: 'og:description', content: description })
    upsertMeta({ property: 'og:type', content: type })
    upsertMeta({ property: 'og:url', content: url })
    upsertMeta({ property: 'og:image', content: image })
    upsertMeta({ property: 'og:site_name', content: siteName })
    upsertMeta({ property: 'og:locale', content: locale })

    // Twitter
    upsertMeta({ name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta({ name: 'twitter:title', content: title })
    upsertMeta({ name: 'twitter:description', content: description })
    upsertMeta({ name: 'twitter:image', content: image })

    // Additional custom meta
    props.additionalMeta?.forEach(({ name, content }) => upsertMeta({ name, content }))

    // Cleanup function removes only tags we created if route unmounts quickly
    return () => {
      // We intentionally keep the tags to avoid flashes across route transitions
      // If needed, implement more granular cleanup here.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, type, url, siteName, locale, props.noindex, props.canonical, props.additionalMeta])

  return null
}

function absoluteUrl(pathOrUrl: string, siteUrl: string): string {
  try {
    // Already absolute
    // eslint-disable-next-line no-new
    new URL(pathOrUrl)
    return pathOrUrl
  } catch {
    if (!pathOrUrl.startsWith('/')) return `${siteUrl}/${pathOrUrl}`
    return `${siteUrl}${pathOrUrl}`
  }
}

// Simple CSS value escaper for attribute selectors
function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }
  // Basic fallback for older browsers
  return value
    .replace(/["\\/&!$'()*+,.:;<=>?@[\]^`{|}~]/g, '\\$&')
    .replace(/\u0000/g, '\\0')
}

/**
 * Renders structured data as JSON-LD. Can be placed anywhere; search engines accept body scripts.
 */
export function JsonLd({ data }: { readonly data: Record<string, unknown> }) {
  const json = serialize(data, { isJSON: true }) as string
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}

