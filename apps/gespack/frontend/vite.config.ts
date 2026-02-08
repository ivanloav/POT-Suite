import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,              // front dev en 3000
    watch: { usePolling: true },
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // ⬅️ TU API EN DEV
        changeOrigin: true,
        secure: false,
        ws: true,
        // SIN rewrite si tu backend ya tiene el prefijo /api
      },
    },
  },
});