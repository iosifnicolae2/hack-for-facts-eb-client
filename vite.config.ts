import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import checker from "vite-plugin-checker";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import fs from "fs";

const getHttpsConfig = () => {
  if (String(process.env.HTTPS_ENABLED) !== "true") {
    return
  }
  try {
    return {
      // Generate ssl certs using ./ssl.sh
      key: fs.readFileSync(path.resolve(__dirname, "localhost-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "localhost-cert.pem")),
    }
  } catch (e) {
    console.warn('Run ./ssl.sh to generate the local certs')
    return undefined
  }
}

const LEARNING_LOCALES = ["en", "ro"] as const;

type LearningPathJson = {
  readonly id?: string;
  readonly modules?: Array<{
    readonly id?: string;
    readonly lessons?: Array<{
      readonly id?: string;
      readonly contentDir?: string;
    }>;
  }>;
};

const getLearningPrerenderPages = () => {
  const pages = new Set<string>();
  const pathsDir = path.resolve(__dirname, "src", "content", "learning", "paths");
  const modulesDir = path.resolve(__dirname, "src", "content", "learning", "modules");

  if (!fs.existsSync(pathsDir)) {
    return [];
  }

  const pathFiles = fs.readdirSync(pathsDir).filter((file) => file.endsWith(".json"));

  const hasLessonContent = (contentDir: string) => {
    const baseDir = path.resolve(modulesDir, contentDir);
    return (
      fs.existsSync(path.join(baseDir, "index.en.mdx")) ||
      fs.existsSync(path.join(baseDir, "index.ro.mdx"))
    );
  };

  for (const file of pathFiles) {
    let parsed: LearningPathJson | null = null;
    try {
      parsed = JSON.parse(fs.readFileSync(path.join(pathsDir, file), "utf-8")) as LearningPathJson;
    } catch {
      continue;
    }

    if (!parsed?.id || !Array.isArray(parsed.modules)) {
      continue;
    }

    for (const locale of LEARNING_LOCALES) {
      pages.add(`/${locale}/learning/${parsed.id}`);

      for (const module of parsed.modules) {
        if (!module?.id || !Array.isArray(module.lessons)) {
          continue;
        }

        for (const lesson of module.lessons) {
          if (!lesson?.id || !lesson.contentDir) {
            continue;
          }

          if (!hasLessonContent(lesson.contentDir)) {
            continue;
          }

          pages.add(`/${locale}/learning/${parsed.id}/${module.id}/${lesson.id}`);
        }
      }
    }
  }

  return Array.from(pages).map((pagePath) => ({ path: pagePath }));
};

export default defineConfig(({ mode }) => ({
  plugins: [
    {
      name: 'md-404-dev-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '/';
          try {
            const parsed = new URL(url, 'http://localhost');
            const pathname = decodeURIComponent(parsed.pathname);
            if (pathname.endsWith('.md')) {
              const rel = pathname.startsWith('/') ? pathname.slice(1) : pathname;
              const filePath = path.resolve(__dirname, 'public', rel);
              if (!fs.existsSync(filePath)) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                res.end('Not Found');
                return;
              }
            }
          } catch {
            // If URL parsing fails, let Vite handle it
          }
          next();
        });
      },
    },
    lingui(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: false,
      },
      pages: getLearningPrerenderPages(),
    }),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      }),
    },
    react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }),
    tailwindcss(),
    checker({
      typescript: true,
    }),
    // Sentry plugin will upload sourcemaps only on production builds when env vars are set
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: mode !== "production",
      telemetry: false,
      sourcemaps: {
        // Specify the directory containing the build artifacts.
        assets: "./dist/**",
      },
    }),
  ],
  // Static assets will be fingerprinted by Vite and can be cached long-term by the browser/CDN
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    allowedHosts: [
      String(process.env.VITE_ALLOWED_HOST)
    ],
    https: getHttpsConfig()
  },
  build: {
    // Generate sourcemaps in production so Sentry can upload and map stack traces
    // Using 'hidden' avoids adding sourceMappingURL references to the bundled files
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 1500,
  },
  // Client-specific build options (manualChunks don't apply to SSR where packages are external)
  environments: {
    client: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              recharts: ['recharts'],
              leaflet: ['leaflet', 'react-leaflet'],
              clerk: ['@clerk/clerk-react'],
              motion: ['framer-motion', 'motion'],
              sentry: ['@sentry/react'],
              posthog: ['posthog-js'],
              tanstack: ['@tanstack/react-query', '@tanstack/react-table', '@tanstack/react-virtual'],
            },
          },
        },
      },
    },
  },
}));
