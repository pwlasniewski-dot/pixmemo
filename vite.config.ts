import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/pixmemo/", // hosting w podkatalogu
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    // ułatwia podgląd na telefonie w sieci lokalnej: vite --host
    host: true,
  },
});
