import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/192.png", "icons/512.png"],
      manifest: {
        name: "PixMemo",
        short_name: "PixMemo",
        start_url: "/pixmemo/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0f172a",
        icons: [
          { src: "/pixmemo/icons/192.png", sizes: "192x192", type: "image/png" },
          { src: "/pixmemo/icons/512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  base: "/pixmemo/",
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { host: true }
});
