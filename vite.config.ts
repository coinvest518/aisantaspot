import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { ConfigEnv, UserConfig } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => ({
  server: {
    host: "::",
    port: mode === 'development' ? 8080 : undefined,
    proxy: {
      '/api/webhook': {
        target: 'https://santaspot.xyz',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Stripe-Signature': ''
        }
      },
      '/stripe': {
        target: 'https://api.stripe.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/stripe/, '')
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Use direct string values instead of import.meta.env in the config
    __STRIPE_WEBHOOK_SECRET__: `"${process.env.VITE_STRIPE_WEBHOOK_SECRET}"`,
    __STRIPE_SECRET_KEY__: `"${process.env.VITE_STRIPE_SECRET_KEY}"`
  },
  build: {
    modulePreload: true,
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: 'es'
      }
    }
  },
  envPrefix: ['VITE_']
}));