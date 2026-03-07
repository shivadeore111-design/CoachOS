import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  const pwaPluginPath = path.resolve(__dirname, "node_modules/vite-plugin-pwa/package.json");

  if (fs.existsSync(pwaPluginPath)) {
    const { VitePWA } = await import("vite-plugin-pwa");

    plugins.push(
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icons/icon.svg"],
        manifest: {
          name: "CoachOS",
          short_name: "CoachOS",
          description: "Fitness Coaching Intelligence Platform",
          theme_color: "#10b981",
          background_color: "#0f172a",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "/icons/icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          globPatterns: ["**/*.{js,css,html,svg}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-cache",
                expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              },
            },
          ],
        },
      })
    );
  }

  return {
    base: "/",
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
