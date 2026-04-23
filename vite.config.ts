import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/workouts/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: true,
      manifestFilename: 'manifest.json',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: '/workouts/',
        name: 'Workouts',
        short_name: 'Workouts',
        description: 'Personal training log.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui', 'browser'],
        orientation: 'portrait',
        scope: '/workouts/',
        start_url: '/workouts/index.html',
        icons: [
          { src: '/workouts/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/workouts/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/workouts/icons/icon-192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/workouts/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/workouts/index.html',
        navigateFallbackDenylist: [/^\/workouts\/(assets|icons|sw\.js|workbox|manifest)/],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(gstatic|googleapis)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts' },
          },
        ],
      },
    }),
  ],
});
