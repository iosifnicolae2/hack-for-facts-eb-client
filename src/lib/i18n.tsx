import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import type { ReactNode } from "react";

export async function dynamicActivate(locale: string): Promise<void> {
  // vite-lingui plugin supports dynamic import of .po catalogs
  const { messages } = await import(`../locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

type I18nAppProviderProps = {
  readonly children: ReactNode;
};

export function I18nAppProvider({ children }: I18nAppProviderProps) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}


