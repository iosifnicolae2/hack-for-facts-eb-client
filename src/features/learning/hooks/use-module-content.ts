import { useMemo } from 'react'
import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'
import type { LearningLocale } from '../types'

type MdxContentProps = {
  readonly components?: MDXComponents
}

type MdxModule = {
  readonly default: ComponentType<MdxContentProps>
}

type MdxLocaleComponents = Partial<Record<LearningLocale, ComponentType<MdxContentProps>>>

type UseModuleContentResult = {
  readonly Component: ComponentType<MdxContentProps> | null
  readonly isLoading: boolean
  readonly error: string | null
}

// Fallback locale when requested content is missing.
const DEFAULT_LOCALE: LearningLocale = 'en'

const MDX_MODULES = import.meta.glob<MdxModule>('/src/content/learning/modules/**/index.*.mdx', {
  eager: true,
})

// Build a lookup table from the file path convention for fast resolution.
const MDX_CONTENT_INDEX = Object.entries(MDX_MODULES).reduce(
  (acc, [path, module]) => {
    const match = path.match(/\/modules\/(.+)\/index\.(en|ro)\.mdx$/)
    if (!match) {
      if (import.meta.env.DEV) {
        console.warn(`[Learning] Ignoring MDX file with unexpected path: ${path}`)
      }
      return acc
    }

    const contentDir = match[1]
    const locale = match[2] as LearningLocale
    const localeComponents = acc[contentDir] ?? {}
    localeComponents[locale] = module.default
    acc[contentDir] = localeComponents
    return acc
  },
  {} as Record<string, MdxLocaleComponents>
)

function resolveMdxComponent(contentDir: string, locale: LearningLocale): {
  readonly Component: ComponentType<MdxContentProps>
  readonly resolvedLocale: LearningLocale
  readonly fallbackUsed: boolean
} | null {
  // Prefer the requested locale and fall back to the default locale when needed.
  const localeComponents = MDX_CONTENT_INDEX[contentDir]
  if (!localeComponents) {
    return null
  }

  const requestedComponent = localeComponents[locale]
  if (requestedComponent) {
    return {
      Component: requestedComponent,
      resolvedLocale: locale,
      fallbackUsed: false,
    }
  }

  const fallbackComponent = localeComponents[DEFAULT_LOCALE]
  if (fallbackComponent) {
    return {
      Component: fallbackComponent,
      resolvedLocale: DEFAULT_LOCALE,
      fallbackUsed: true,
    }
  }

  return null
}

function getAvailableLocales(contentDir: string): string {
  const localeComponents = MDX_CONTENT_INDEX[contentDir]
  if (!localeComponents) {
    return 'none'
  }

  const locales = Object.keys(localeComponents)
  return locales.length ? locales.join(', ') : 'none'
}

if (import.meta.env.DEV) {
  for (const [contentDir, localeComponents] of Object.entries(MDX_CONTENT_INDEX)) {
    if (!localeComponents.en) {
      console.warn(`[Learning] Missing English MDX content for module: ${contentDir}`)
    }
  }
}

export function prefetchModuleContent(params: { readonly contentDir: string; readonly locale: LearningLocale }) {
  resolveMdxComponent(params.contentDir, params.locale)
  return Promise.resolve()
}

export function useModuleContent(params: {
  readonly contentDir: string
  readonly locale: LearningLocale
}): UseModuleContentResult {
  return useMemo(() => {
    if (!params.contentDir) {
      return {
        Component: null,
        isLoading: false,
        error: 'Missing module content directory.',
      }
    }

    const resolved = resolveMdxComponent(params.contentDir, params.locale)
    if (!resolved) {
      return {
        Component: null,
        isLoading: false,
        error: `Missing module content: ${params.contentDir} (${params.locale}). Available locales: ${getAvailableLocales(
          params.contentDir
        )}`,
      }
    }

    return {
      Component: resolved.Component,
      isLoading: false,
      error: null,
    }
  }, [params.contentDir, params.locale])
}
