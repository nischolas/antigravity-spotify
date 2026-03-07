import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff,woff2}"],
      },
      manifest: {
        name: "Spotify Streamingverlauf",
        short_name: "Spotify",
        description: "Erkunde deinen Spotify Streamingverlauf",
        theme_color: "#1DB954",
        background_color: "#191414",
        display: "standalone",
        icons: [
          {
            src: "favicon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    port: 5173,
  },
});
