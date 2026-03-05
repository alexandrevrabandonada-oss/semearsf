import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

function buildChunksManifest() {
  return {
    name: "build-chunks-manifest",
    closeBundle() {
      const distDir = path.join(process.cwd(), "dist");
      if (!fs.existsSync(distDir)) return;

      const manifest = {};
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath);
            continue;
          }

          const relPath = path.relative(distDir, fullPath).replace(/\\/g, "/");
          if (relPath === "manifest.json") continue;
          manifest[relPath] = {
            file: relPath,
            type: relPath.endsWith(".js") ? "chunk" : "asset",
            isEntry: relPath === "index.html"
          };
        }
      };

      walk(distDir);
      fs.writeFileSync(path.join(distDir, "manifest.json"), JSON.stringify(manifest, null, 2));
    }
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (!normalizedId.includes("node_modules")) return undefined;

          if (normalizedId.includes("/react-dom/") || normalizedId.includes("/react/")) {
            return "vendor-react";
          }

          if (normalizedId.includes("/react-router-dom/") || normalizedId.includes("/@remix-run/router/")) {
            return "vendor-router";
          }

          if (normalizedId.includes("/@supabase/")) {
            return "vendor-supabase";
          }

          if (normalizedId.includes("/leaflet/") || normalizedId.includes("/react-leaflet/")) {
            return "vendor-maps";
          }

          if (normalizedId.includes("/recharts/") || normalizedId.includes("/victory-vendor/")) {
            return "vendor-charts";
          }

          return undefined;
        }
      }
    }
  },
  plugins: [
    react(),
    buildChunksManifest(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "SEMEAR Portal",
        short_name: "SEMEAR",
        description: "Portal de Monitoramento Ambiental e Engajamento Comunitário",
        theme_color: "#00e5ff",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait-primary",
        categories: ["education", "environment"],
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/acervo\/.*(?:\.png|\.jpg|\.jpeg|\.webp|\.svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "acervo-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/acervo\/.*\.pdf$/,
            handler: "NetworkFirst",
            options: {
              cacheName: "acervo-pdfs",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 14 * 24 * 60 * 60
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
});
