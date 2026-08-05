import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PLATAFORMAS COM BÔNUS DE ROLETA NO CADASTRO',
        short_name: 'Bônus Roleta',
        description: 'Plataformas com bônus de roleta',
        theme_color: '#0f0f0f',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/jroleta-512x512.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/jroleta-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
})
