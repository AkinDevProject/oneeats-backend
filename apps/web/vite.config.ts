import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // SPA fallback - toutes les routes non-fichiers servent index.html
    middlewareMode: false,
  },
  // Fallback SPA pour le build et le dev
  appType: 'spa',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
