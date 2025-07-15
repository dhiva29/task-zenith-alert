zimport { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa'; // --- 1. Import the PWA plugin ---

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),

    // --- 2. Add the VitePWA plugin configuration ---
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Task Zenith Alert', // <-- CHANGE THIS: Your app's full name
        short_name: 'TaskZenith',    // <-- CHANGE THIS: Short name for home screen
        description: 'An application for task alerts.', // <-- CHANGE THIS: A good description
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png', // Icon file
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // Icon file
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })

  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));