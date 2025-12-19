import { i18n } from "@lingui/core";

const loadedLocales = new Set<string>();
const loadingLocales = new Map<string, Promise<void>>();

export async function dynamicActivate(locale: string): Promise<void> {
  if (!loadedLocales.has(locale)) {
    const existingLoad = loadingLocales.get(locale);
    if (existingLoad) {
      await existingLoad;
    } else {
      const loadPromise = (async () => {
        // vite-lingui plugin supports dynamic import of .po catalogs
        const { messages } = await import(`../locales/${locale}/messages.po`);
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


