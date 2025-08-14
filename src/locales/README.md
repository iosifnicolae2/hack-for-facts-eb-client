# i18n with Lingui v5 (React + Vite + SWC)

This project uses **Lingui v5** for internationalization (ICU MessageFormat, extraction workflow, dynamic catalogs). It’s wired for **Vite** with the **React SWC** plugin and Lingui’s **Vite** + **SWC** plugins.

> Why Lingui? Lightweight macros, robust ICU messages, and a clean extraction/translation workflow. ([lingui.dev][1])

---

## Requirements

* **Node.js ≥ 20** (required by Lingui v5). ([lingui.dev][2])

---

## Install

```bash
# runtime
yarn add @lingui/core @lingui/react

# dev tools
yarn add -D @lingui/cli @lingui/vite-plugin @lingui/swc-plugin
```

* `@lingui/react` + `@lingui/core` provide the runtime. ([lingui.dev][1])
* `@lingui/cli` handles extraction/validation; `@lingui/vite-plugin` compiles catalogs on the fly in Vite; `@lingui/swc-plugin` transforms macros. ([lingui.dev][3])

---

## Configure Lingui

Create **`lingui.config.js`** at the repo root:

```js
// lingui.config.js
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "ro"], // add your locales here
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  // format: "po" // default & recommended
});
```

This tells Lingui where to scan and where to write catalogs (e.g. `src/locales/ro/messages.po`). ([lingui.dev][4])

---

## Vite + SWC setup

Edit **`vite.config.ts`**:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [
    react({
      plugins: [["@lingui/swc-plugin", {}]], // SWC macro transform
    }),
    lingui(), // compiles catalogs on the fly
  ],
});
```

* SWC plugin does the macro-to-ICU transform.
* Vite plugin compiles `.po` catalogs dynamically; no separate `lingui compile` needed during dev. ([lingui.dev][4])

> **Note (compatibility):** SWC plugin is **experimental** and tied to specific `@swc/core` versions; pin via `overrides`/`resolutions` if needed. ([lingui.dev][5])

---

## Runtime i18n loader

Create **`src/i18n.ts`** for dynamic activation:

```ts
// src/i18n.ts
import { i18n } from "@lingui/core";

export async function activate(locale: string) {
  // File extension is required; Vite plugin compiles this on the fly
  const { messages } = await import(`./locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}
```

* If you use a non-PO format, import with `?lingui` (e.g. `messages.json?lingui`). ([lingui.dev][6])

---

## App entry

Wire the provider near the root and **activate a locale before rendering** (prevents “called translation without locale” errors):

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { activate } from "./i18n";
import App from "./App";

(async () => {
  await activate("en"); // or detect (see next section)
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <I18nProvider i18n={i18n}>
        <App />
      </I18nProvider>
    </StrictMode>
  );
})();
```

`I18nProvider` passes the `i18n` instance to React; `load + activate` sets catalogs and the active locale. ([lingui.dev][1])

---

## Locale detection (optional)

Use `@lingui/detect-locale` to pick a default:

```ts
// src/locale.ts
import { detect, fromNavigator, fromStorage } from "@lingui/detect-locale";

export function detectLocale() {
  return detect(fromStorage("lang"), fromNavigator()) ?? "en";
}
```

Then: `await activate(detectLocale())`. ([lingui.dev][7])

---

## Using translations (v5 macro imports)

In **v5**, import macros from **package subpaths**:

* **JS / core macros** → `@lingui/core/macro`
* **JSX / React macros** → `@lingui/react/macro` ([lingui.dev][8])

Examples:

```tsx
// Static / rich text in JSX
import { Trans, Plural } from "@lingui/react/macro";

<Trans>Read <a href="/docs">the docs</a> first.</Trans>

<Plural value={count} one="One file" other="# files" />
```

```ts
// JS strings, variables, plurals
import { t, plural } from "@lingui/core/macro";

const title = t`Dashboard`;
const msg = plural(count, { one: `# item`, other: `# items` });
```

```tsx
// Dates & numbers via i18n helpers
import { useLingui, Trans } from "@lingui/react/macro";
const { i18n } = useLingui();

<Trans>Last login on {i18n.date(lastLogin)}</Trans>;
```

Under the hood, macros compile to `i18n._({ id, message, values })` and `Trans` components. ([lingui.dev][8])

> **Avoid early calls:** Don’t invoke `t\`\``or`i18n.\_(...)\` at **module top level**; translate inside components/effects after activation to avoid race conditions. ([lingui.dev][1])

---

## Message workflow

Add scripts to **`package.json`**:

```jsonc
{
  "scripts": {
    "i18n:extract": "lingui extract",
    "i18n:extract:watch": "lingui extract --watch",
    "i18n:compile": "lingui compile" // optional with Vite plugin
  }
}
```

* **Extract**: scans `src/**` and updates `src/locales/*/messages.po`. ([lingui.dev][3])
* **Compile**: not required for Vite dev, because the Vite plugin compiles on the fly; still useful in CI (e.g., `--strict` checks for missing translations). ([lingui.dev][6], [Stack Overflow][9])

Typical loop:

1. Write/modify UI with macros.
2. `npm run i18n:extract` → update `.po` files.
3. Translate in `src/locales/<locale>/messages.po`.
4. Run dev/build; Vite plugin compiles catalogs automatically. ([lingui.dev][6])

---

## Dynamic locale switching (optional)

If users can change language:

```tsx
// src/components/I18nGate.tsx
import { useEffect, useState } from "react";
import { activate } from "@/i18n";

export function I18nGate({ locale, children }: { locale: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await activate(locale);
      if (!cancelled) setReady(true);
    })();
    return () => void (cancelled = true);
  }, [locale]);

  return ready ? <>{children}</> : null;
}
```

Wrap your routes/content with `<I18nGate locale={currentLocale}>…</I18nGate>` so children never render before activation. ([lingui.dev][1])

---

## Suggested structure

```
src/
  i18n.ts
  locale.ts
  locales/
    en/
      messages.po
    ro/
      messages.po
```

> With Vite, import compiled catalogs via dynamic `import()` and a **mandatory file extension** (e.g., `messages.po`). ([lingui.dev][6])

---

## Troubleshooting

* **“Attempted to call a translation function without setting a locale”**
  Ensure `await activate(locale)` runs **before** rendering, and avoid translating at module scope. ([lingui.dev][1])

* **Missing translations at runtime**
  Run `npm run i18n:extract`, translate `.po`, and rebuild. Consider `lingui compile --strict` in CI to fail on missing messages. ([lingui.dev][3], [Stack Overflow][9])

* **SWC plugin version mismatch**
  Pin compatible `@swc/core` version via `overrides`/`resolutions` if needed. ([lingui.dev][5])

---

## Key docs

* **Installation & Vite + SWC setup** (official) ([lingui.dev][4])
* **Vite plugin** (dynamic catalog compilation) ([lingui.dev][6])
* **SWC plugin** (macro transform & compatibility notes) ([lingui.dev][5])
* **React tutorial** (end-to-end examples) ([lingui.dev][1])
* **Macros reference (v5 import paths)** ([lingui.dev][8])
* **Core API (`i18n.load` / `i18n.activate`)** ([lingui.dev][10])
* **Locale detection** ([lingui.dev][7])

---

## FAQ

**Do I need `@lingui/macro` in v5?**
No. In v5 you import macros from **`@lingui/core/macro`** and **`@lingui/react/macro`**. ([lingui.dev][8])

**Do I need `lingui compile` with Vite?**
Not for local dev (Vite compiles catalogs). In CI you can still run `compile` (e.g., with `--strict`) to validate catalogs. ([lingui.dev][6], [Stack Overflow][9])
