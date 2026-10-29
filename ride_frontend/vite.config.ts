import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const backend = loadEnv(mode, process.cwd(), 'VITE_').VITE_BACKEND_URL;
    if (backend && backend !== '/backend') throw new Error('Cookie sessions require same-origin VITE_BACKEND_URL=/backend (or omit it).');
  }
  return {
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': { target: 'http://localhost:3000', changeOrigin: false },
      '/backend': { target: 'http://localhost:3000', changeOrigin: false, ws: true, rewrite: path => path.replace(/^\/backend/, '') },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vite 8 uses rolldown which requires manualChunks as a function (not an object)
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          if (id.includes('node_modules/@lottiefiles')) {
            return 'vendor-lottie';
          }
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) {
            return 'vendor-socket';
          }
        },
      },
    },
  },
  };
});
