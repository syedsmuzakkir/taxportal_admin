import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
   server: {
    proxy: {
      "/api": {
        target: "https://1379e77c1f3c.ngrok-free.app",
        changeOrigin: true,
        secure: false
      }
    }
  }
});
