import path from "path";
import https from "https";
import type { ClientRequest } from "http";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import checker from "vite-plugin-checker";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { lingui } from "@lingui/vite-plugin";
import { nitro } from "nitro/vite";
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


export default defineConfig(({ mode }) => {
  // TODO: review this. What are best practices? Link the research doc when done.
  const env = loadEnv(mode, process.cwd(), "");
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_URL;
  const proxyAgent = apiProxyTarget?.startsWith("https")
    ? new https.Agent({ keepAlive: false })
    : undefined;

  const configureProxy = (proxyInstance: any) => {
    proxyInstance.on("proxyReq", (proxyReq: ClientRequest) => {
      proxyReq.setHeader("Connection", "close");
      proxyReq.removeHeader("origin");
      proxyReq.removeHeader("referer");
      proxyReq.removeHeader("cookie");
      proxyReq.removeHeader("cookie2");
    });

    proxyInstance.on("error", (error: Error, _req: unknown, res: any) => {
      if (res && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "application/json" });
      }
      if (res) {
        res.end(JSON.stringify({ error: "proxy_error", message: error.message }));
      }
    });
  };

  const proxy = apiProxyTarget
    ? {
        "/graphql": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          proxyTimeout: 120_000,
          timeout: 120_000,
          agent: proxyAgent,
          configure: configureProxy,
        },
        "/api": {
          target: apiProxyTarget,
          changeOrigin: true,
          secure: false,
          proxyTimeout: 120_000,
          timeout: 120_000,
          agent: proxyAgent,
          configure: configureProxy,
        },
      }
    : undefined;

  return ({
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
    tanstackStart(),
    nitro({ preset: "vercel" }),
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      }),
    },
    react({
      plugins: [["@lingui/swc-plugin", {}]],
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
      https: getHttpsConfig(),
      proxy,
    },
  build: {
    // Generate sourcemaps in production so Sentry can upload and map stack traces
    // Using 'hidden' avoids adding sourceMappingURL references to the bundled files
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 1500,
  },
  // SSR configuration - bundle packages that have import issues when externalized
  ssr: {
    noExternal: [
      'decimal.js-light',
      'recharts',
      'recharts-scale',
      'd3-scale',
      'd3-array',
      'd3-format',
      'd3-interpolate',
      'd3-time',
      'd3-time-format',
      'd3-color',
      'd3-path',
      'd3-shape',
    ],
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
  });
});
