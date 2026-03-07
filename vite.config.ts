import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];

  try {
    const { VitePWA } = await import("vite-plugin-pwa");
    plugins.push(
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["/icons/icon.svg"],
        manifest: {
          name: "CoachOS",
          short_name: "CoachOS",
          theme_color: "#10b981",
          background_color: "#0f172a",
          display: "standalone",
          icons: [
            {
              src: "/icons/icon.svg",
              sizes: "512x512",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
      })
    );
  } catch {
    console.warn("vite-plugin-pwa is not installed; skipping PWA plugin registration.");
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
