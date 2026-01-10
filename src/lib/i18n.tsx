import { i18n, type Messages } from "@lingui/core";

export const DEFAULT_LOCALE = "ro" as const;
export const LOCALE_COOKIE_NAME = "user-locale";
export type SupportedLocale = "ro" | "en";

const loadedLocales = new Set<string>();
const loadingLocales = new Map<string, Promise<void>>();

type CatalogLoader = () => Promise<unknown>;
type CatalogEntry = unknown | CatalogLoader;

// Use two separate glob imports with static options - Vite requires static values at compile time
const localeCatalogsEager = import.meta.glob("../locales/*/messages.po", {
  eager: true,
}) as Record<string, unknown>;

const localeCatalogsLazy = import.meta.glob("../locales/*/messages.po", {
  eager: false,
}) as Record<string, CatalogLoader>;

// Select the appropriate catalog based on the runtime environment
const localeCatalogs: Record<string, CatalogEntry> = import.meta.env.SSR
  ? localeCatalogsEager
  : localeCatalogsLazy;

if (import.meta.env.SSR) {
  const defaultEntry = localeCatalogs[
    `../locales/${DEFAULT_LOCALE}/messages.po`
  ];
  if (defaultEntry && typeof defaultEntry !== "function") {
    const messages = extractMessages(defaultEntry);
    if (Object.keys(messages).length > 0) {
      i18n.load(DEFAULT_LOCALE, messages);
      loadedLocales.add(DEFAULT_LOCALE);
    }
  }
}

function extractMessages(module: unknown): Messages {
  if (!module || typeof module !== "object") return {};
  const record = module as { messages?: unknown; default?: unknown };
  if (record.messages && typeof record.messages === "object") {
    return record.messages as Messages;
  }
  const def = record.default;
  if (def && typeof def === "object") {
    const defRecord = def as { messages?: unknown };
    if (defRecord.messages && typeof defRecord.messages === "object") {
      return defRecord.messages as Messages;
    }
    return def as Messages;
  }
  return {};
}

function isCatalogLoader(entry: CatalogEntry): entry is CatalogLoader {
  return typeof entry === "function";
}

function getCatalogLoader(locale: string): (() => Promise<unknown>) | undefined {
  const entry = localeCatalogs[`../locales/${locale}/messages.po`];
  if (!entry) return undefined;
  if (isCatalogLoader(entry)) {
    return entry;
  }
  return async () => entry;
}

export function normalizeLocale(
  value: string | null | undefined,
): SupportedLocale | null {
  if (value === "ro" || value === "en") {
    return value;
  }
  return null;
}

export function resolveLocale(options: {
  pathname: string;
  searchStr?: string;
  cookieLocale?: string | null;
  storedLocale?: string | null;
}): SupportedLocale {
  const searchParams = new URLSearchParams(options.searchStr ?? "");
  const searchLocale = normalizeLocale(searchParams.get("lang"));
  if (searchLocale) return searchLocale;

  const pathLocale = normalizeLocale(options.pathname.split("/")[1]);
  if (pathLocale) return pathLocale;

  const cookieLocale = normalizeLocale(options.cookieLocale);
  if (cookieLocale) return cookieLocale;

  const storedLocale = normalizeLocale(options.storedLocale);
  if (storedLocale) return storedLocale;

  return DEFAULT_LOCALE;
}

export async function dynamicActivate(locale: string): Promise<void> {
  if (!loadedLocales.has(locale)) {
    const existingLoad = loadingLocales.get(locale);
    if (existingLoad) {
      await existingLoad;
    } else {
      const loadPromise = (async () => {
        const loader = getCatalogLoader(locale);
        if (!loader) {
          throw new Error(`Missing i18n catalog for locale "${locale}"`);
        }
        const module = await loader();
        const messages = extractMessages(module);
        i18n.load(locale, messages);
        loadedLocales.add(locale);
      })();
      loadingLocales.set(locale, loadPromise);
      try {
        await loadPromise;
      } finally {
        loadingLocales.delete(locale);
      }
    }
  }
  i18n.activate(locale);
}
