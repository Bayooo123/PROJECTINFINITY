import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['learned_logo.png'],
        manifest: {
          name: 'Learned - Legal Education',
          short_name: 'Learned',
          description: 'AI-powered legal education platform for Nigerian law students.',
          theme_color: '#f59e0b',
          background_color: '#f8fafc',
          display: 'standalone',
          icons: [
            {
              src: 'learned_logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'learned_logo.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'learned_logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    define: {
      // Vite automatically exposes VITE_ prefixed env vars
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
