import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'
import type { LearningLocale } from '../types'

type MdxContentProps = {
  readonly components?: MDXComponents
}

type MdxModule = {
  readonly default: ComponentType<MdxContentProps>
}

type MdxLoader = () => Promise<MdxModule>

type MdxLocaleLoaders = Partial<Record<LearningLocale, MdxLoader>>

type UseModuleContentResult = {
  readonly Component: ComponentType<MdxContentProps> | null
  readonly isLoading: boolean
  readonly error: string | null
}

type ModuleContentState =
  | {
      readonly contentKey: string
      readonly status: 'idle' | 'loading'
      readonly Component: null
      readonly error: null
    }
  | {
      readonly contentKey: string
      readonly status: 'ready'
      readonly Component: ComponentType<MdxContentProps>
      readonly error: null
    }
  | {
      readonly contentKey: string
      readonly status: 'error'
      readonly Component: null
      readonly error: string
    }

// Fallback locale when requested content is missing.
const DEFAULT_LOCALE: LearningLocale = 'en'

// Lazy MDX loading keeps lesson content out of the initial bundle.
const MDX_MODULE_LOADERS = import.meta.glob<MdxModule>('/src/content/learning/modules/**/index.*.mdx')

// Build a lookup table from the file path convention for fast resolution.
const MDX_CONTENT_INDEX = Object.entries(MDX_MODULE_LOADERS).reduce(
  (acc, [path, loader]) => {
    const match = path.match(/\/modules\/(.+)\/index\.(en|ro)\.mdx$/)
    if (!match) {
      if (import.meta.env.DEV) {
        console.warn(`[Learning] Ignoring MDX file with unexpected path: ${path}`)
      }
      return acc
    }

    const contentDir = match[1]
    const locale = match[2] as LearningLocale
    const localeLoaders = acc[contentDir] ?? {}
    localeLoaders[locale] = loader
    acc[contentDir] = localeLoaders
    return acc
  },
  {} as Record<string, MdxLocaleLoaders>
)

// Cache loaded components and in-flight loads to avoid duplicate work.
const MDX_COMPONENT_CACHE = new Map<string, ComponentType<MdxContentProps>>()
const MDX_LOAD_PROMISE_CACHE = new Map<string, Promise<ComponentType<MdxContentProps>>>()

function getCacheKey(contentDir: string, locale: LearningLocale): string {
  return `${contentDir}:${locale}`
}

function resolveMdxLoader(contentDir: string, locale: LearningLocale): {
  readonly loader: MdxLoader
  readonly resolvedLocale: LearningLocale
  readonly cacheKey: string
  readonly fallbackUsed: boolean
} | null {
  // Prefer the requested locale and fall back to the default locale when needed.
  const localeLoaders = MDX_CONTENT_INDEX[contentDir]
  if (!localeLoaders) {
    return null
  }

  const requestedLoader = localeLoaders[locale]
  if (requestedLoader) {
    return {
      loader: requestedLoader,
      resolvedLocale: locale,
      cacheKey: getCacheKey(contentDir, locale),
      fallbackUsed: false,
    }
  }

  const fallbackLoader = localeLoaders[DEFAULT_LOCALE]
  if (fallbackLoader) {
    return {
      loader: fallbackLoader,
      resolvedLocale: DEFAULT_LOCALE,
      cacheKey: getCacheKey(contentDir, DEFAULT_LOCALE),
      fallbackUsed: true,
    }
  }

  return null
}

function getAvailableLocales(contentDir: string): string {
  const localeLoaders = MDX_CONTENT_INDEX[contentDir]
  if (!localeLoaders) {
    return 'none'
  }

  const locales = Object.keys(localeLoaders)
  return locales.length ? locales.join(', ') : 'none'
}

async function loadMdxComponent(params: {
  readonly contentDir: string
  readonly locale: LearningLocale
}): Promise<{
  readonly Component: ComponentType<MdxContentProps>
  readonly resolvedLocale: LearningLocale
  readonly fallbackUsed: boolean
}> {
  const resolved = resolveMdxLoader(params.contentDir, params.locale)
  if (!resolved) {
    throw new Error(`Missing module content: ${params.contentDir} (${params.locale})`)
  }

  const cachedComponent = MDX_COMPONENT_CACHE.get(resolved.cacheKey)
  if (cachedComponent) {
    return {
      Component: cachedComponent,
      resolvedLocale: resolved.resolvedLocale,
      fallbackUsed: resolved.fallbackUsed,
    }
  }

  const pending = MDX_LOAD_PROMISE_CACHE.get(resolved.cacheKey)
  if (pending) {
    const Component = await pending
    return {
      Component,
      resolvedLocale: resolved.resolvedLocale,
      fallbackUsed: resolved.fallbackUsed,
    }
  }

  const loadPromise = resolved
    .loader()
    .then((module) => {
      const Component = module.default
      MDX_COMPONENT_CACHE.set(resolved.cacheKey, Component)
      MDX_LOAD_PROMISE_CACHE.delete(resolved.cacheKey)
      return Component
    })
    .catch((error) => {
      MDX_LOAD_PROMISE_CACHE.delete(resolved.cacheKey)
      throw error
    })

  MDX_LOAD_PROMISE_CACHE.set(resolved.cacheKey, loadPromise)

  const Component = await loadPromise
  return {
    Component,
    resolvedLocale: resolved.resolvedLocale,
    fallbackUsed: resolved.fallbackUsed,
  }
}

if (import.meta.env.DEV) {
  for (const [contentDir, localeLoaders] of Object.entries(MDX_CONTENT_INDEX)) {
    if (!localeLoaders.en) {
      console.warn(`[Learning] Missing English MDX content for module: ${contentDir}`)
    }
  }
}

export function prefetchModuleContent(params: { readonly contentDir: string; readonly locale: LearningLocale }) {
  const resolved = resolveMdxLoader(params.contentDir, params.locale)
  if (!resolved) {
    return Promise.resolve()
  }

  if (MDX_COMPONENT_CACHE.has(resolved.cacheKey)) {
    return Promise.resolve()
  }

  return loadMdxComponent(params).then(
    () => undefined,
    () => undefined
  )
}

export function useModuleContent(params: {
  readonly contentDir: string
  readonly locale: LearningLocale
}): UseModuleContentResult {
  const contentKey = useMemo(() => getCacheKey(params.contentDir, params.locale), [params.contentDir, params.locale])
  const [state, setState] = useState<ModuleContentState>({
    contentKey,
    status: 'idle',
    Component: null,
    error: null,
  })

  useEffect(() => {
    if (!params.contentDir) {
      setState({
        contentKey,
        status: 'error',
        Component: null,
        error: 'Missing module content directory.',
      })
      return
    }

    const resolved = resolveMdxLoader(params.contentDir, params.locale)
    if (!resolved) {
      setState({
        contentKey,
        status: 'error',
        Component: null,
        error: `Missing module content: ${params.contentDir} (${params.locale}). Available locales: ${getAvailableLocales(
          params.contentDir
        )}`,
      })
      return
    }

    const cachedComponent = MDX_COMPONENT_CACHE.get(resolved.cacheKey)
    if (cachedComponent) {
      setState({
        contentKey,
        status: 'ready',
        Component: cachedComponent,
        error: null,
      })
      return
    }

    let isActive = true
    setState({ contentKey, status: 'loading', Component: null, error: null })

    loadMdxComponent(params)
      .then(({ Component }) => {
        if (!isActive) {
          return
        }
        setState({ contentKey, status: 'ready', Component, error: null })
      })
      .catch((error) => {
        if (!isActive) {
          return
        }
        setState({
          contentKey,
          status: 'error',
          Component: null,
          error: error instanceof Error ? error.message : 'Failed to load lesson content.',
        })
      })

    return () => {
      isActive = false
    }
  }, [contentKey, params.contentDir, params.locale])

  // Guard against stale content while a new lesson is loading.
  const isStale = state.contentKey !== contentKey

  return {
    Component: isStale ? null : state.Component,
    isLoading: isStale || state.status === 'loading' || state.status === 'idle',
    error: isStale ? null : state.status === 'error' ? state.error : null,
  }
}
