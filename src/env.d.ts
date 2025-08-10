/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PYODIDE_CDN_URL: string;
  readonly VITE_SENTRY_ENABLED?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_TRACES_SAMPLE_RATE?: string;
  readonly VITE_SENTRY_FEEDBACK_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly PYODIDE_CDN_URL: string;
  }
}
