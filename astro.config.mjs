import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'static',
  build: {
    format: 'file'
  },
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      manifest: {
        name: 'PayQR Studio — Professional Offline Payment Suite',
        short_name: 'PayQR',
        description: 'Generate UPI payment QR codes instantly. Enter amount, generate QR, share via WhatsApp. No signup needed. Free and works offline.',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}']
      }
    })
  ]
});
