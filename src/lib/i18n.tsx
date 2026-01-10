import { i18n, type Messages } from "@lingui/core";

export const DEFAULT_LOCALE = "ro" as const;

const loadedLocales = new Set<string>();
const loadingLocales = new Map<string, Promise<void>>();

const localeCatalogLoaders = import.meta.glob("../locales/*/messages.po");

if (import.meta.env.SSR) {
  const defaultCatalogs = import.meta.glob("../locales/ro/messages.po", {
    eager: true,
  });
  const defaultCatalog = defaultCatalogs[
    "../locales/ro/messages.po"
  ] as { messages?: Messages } | undefined;
  if (defaultCatalog?.messages) {
    i18n.load(DEFAULT_LOCALE, defaultCatalog.messages);
    loadedLocales.add(DEFAULT_LOCALE);
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

function getCatalogLoader(locale: string): (() => Promise<unknown>) | undefined {
  return localeCatalogLoaders[`../locales/${locale}/messages.po`];
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
