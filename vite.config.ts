import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";
import tanstackRouter from "@tanstack/router-plugin/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter(),
    react(),
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
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.match(/[\\/]node_modules[\\/](react|react-dom|react-is)[\\/]/)) return "react";
            if (id.match(/[\\/]node_modules[\\/](@tanstack)[\\/]/)) return "tanstack";
            if (id.match(/[\\/]node_modules[\\/](recharts|d3-sankey)[\\/]/)) return "recharts";
            if (id.match(/[\\/]node_modules[\\/](leaflet|react-leaflet|@turf)[\\/]/)) return "leaflet";
            if (id.match(/[\\/]node_modules[\\/](@radix-ui)[\\/]/)) return "radix";
            if (id.match(/[\\/]node_modules[\\/](lucide-react)[\\/]/)) return "icons";
            if (id.match(/[\\/]node_modules[\\/](immer|zod|clsx|class-variance-authority|tailwind-merge)[\\/]/)) return "utility";
            if (id.match(/[\\/]node_modules[\\/](posthog-js)[\\/]/)) return "analytics";
            if (id.match(/[\\/]node_modules[\\/](@sentry)[\\/]/)) return "sentry";
            if (id.match(/[\\/]node_modules[\\/](motion)[\\/]/)) return "motion";
            if (id.match(/[\\/]node_modules[\\/](fuse.js)[\\/]/)) return "search";
            if (id.match(/[\\/]node_modules[\\/](@dnd-kit)[\\/]/)) return "dnd";
            return "vendor";
          }
        },
      },
    },
  },
}));