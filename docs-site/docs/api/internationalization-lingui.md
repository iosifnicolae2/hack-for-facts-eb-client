---
id: internationalization-lingui
slug: /api-i18n
title: Internationalization (i18n) with Lingui + Vite + React
description: Project-wide spec for adding and using i18n with Lingui, Vite and React (SWC)
---

This document specifies how internationalization is implemented in this app using Lingui, Vite, and React (with `@vitejs/plugin-react-swc`).

## Packages

Install once in the root workspace:

```bash
# runtime
yarn add @lingui/core @lingui/react
# tooling
yarn add -D @lingui/cli @lingui/vite-plugin
```

## Vite configuration

`vite.config.ts` registers the Lingui Vite plugin alongside React SWC:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig(() => ({
  plugins: [
    react(),
    lingui(),
  ],
}));
```

Notes:
- We keep SWC; no Babel is required.
- The plugin enables `.po` dynamic imports and message extraction.

## Lingui configuration

`lingui.config.ts`:

```ts
const config = {
  sourceLocale: "en",
  locales: ["en", "ro"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  format: "po",
};

export default config;
```

## Directory structure

```
src/
  locales/
    en/
      messages.po
    ro/
      messages.po
  lib/
    i18n.tsx           # dynamicActivate() and I18nAppProvider
  routes/
    __root.tsx         # wraps <App> with <I18nAppProvider>
```

`src/types/lingui.d.ts` declares `*.po` for TS:

```ts
declare module "*.po" {
  export const messages: Record<string, string>;
}
```

## App provider

```tsx
// src/lib/i18n.tsx
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export function I18nAppProvider({ children }: { children: React.ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
```

Provider usage (already wired):

```tsx
// src/routes/__root.tsx
<I18nAppProvider>
  {/* app layout and routes */}
</I18nAppProvider>
```

## Marking messages

Use `@lingui/react` for developer ergonomics:

```tsx
import { Trans } from "@lingui/react";

<h1><Trans>Transparenta.eu</Trans></h1>
<p><Trans>See-through, clear</Trans></p>
```

If a prop strictly requires `string`, keep plain strings or adapt the component’s types before using `Trans`.

## Scripts

Add package scripts:

```json
{
  "scripts": {
    "i18n:extract": "lingui extract",
    "i18n:compile": "lingui compile",
    "i18n:clean": "lingui extract --clean"
  }
}
```

Usage:

```bash
yarn i18n:extract   # scan source, update catalogs
yarn i18n:compile   # compile catalogs for production
```

## Runtime locale switching

Call `dynamicActivate(locale)` at startup or from a user preference control:

```ts
import { dynamicActivate } from "@/lib/i18n";

await dynamicActivate("en"); // or "ro"
```

Persist the choice (e.g., localStorage) and call again on app load.

## Conventions

- Default language: **English (en)**.
- Use `Trans` for all user-visible strings where feasible.
- Keep technical keys and placeholders in English.
- PRs adding new UI should include updated catalogs via `yarn i18n:extract`.
- Do not commit compiled artifacts; only `.po` sources.
