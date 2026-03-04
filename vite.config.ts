import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "SEMEAR Portal",
        short_name: "SEMEAR",
        description: "Portal de Monitoramento Ambiental e Engajamento Comunitário",
        theme_color: "#00e5ff",
        background_color: "#0a0a0a",
        display: "standalone",
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
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
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
                maxAgeSeconds: 14 * 24 * 60 * 60 // 14 days
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
