import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      devOptions: { enabled: false },
      filename: "sw.js",
      manifest: {
        name: "SEARCH-POI Engine v1",
        short_name: "SEARCH-POI",
        description:
          "African business intelligence search engine — works offline.",
        theme_color: "#06b6d4",
        background_color: "#0a0f14",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/favicon.ico", sizes: "64x64", type: "image/x-icon" },
          { src: "/pwa-icon.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && request.destination !== "document",
            handler: "CacheFirst",
            options: { cacheName: "poi-assets", expiration: { maxEntries: 200 } },
          },
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "poi-pages" },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
