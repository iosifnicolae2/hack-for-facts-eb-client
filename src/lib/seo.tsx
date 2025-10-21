// Lightweight placeholders to avoid per-page SEO. Global metadata is managed via root route head().

export type SeoProps = {
  readonly title?: string
  readonly description?: string
  readonly image?: string
  readonly type?: 'website' | 'article'
  readonly canonical?: string
  readonly noindex?: boolean
  readonly locale?: string
  readonly siteName?: string
  readonly additionalMeta?: ReadonlyArray<{ name: string; content: string }>
}

// Defaults retained for future expansion if needed

/**
 * No-op SEO component. Global metadata is handled in the root route head().
 */
export function Seo(_: SeoProps): null {
  return null
}

// Intentionally omitting helpers; Router head handles global SEO now.

/**
 * Renders structured data as JSON-LD. Can be placed anywhere; search engines accept body scripts.
 */
export function JsonLd(_: { readonly data: Record<string, unknown> }) {
  // Prefer Router-managed script injection via HeadContent placeholder
  // For now, we no-op to avoid dangerouslySetInnerHTML usage, since we moved to global metadata strategy.
  return null
}

