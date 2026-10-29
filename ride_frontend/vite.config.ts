import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const backend = loadEnv(mode, process.cwd(), 'VITE_').VITE_BACKEND_URL;
    if (!backend) throw new Error('Set VITE_BACKEND_URL before building the frontend. It is embedded at build time.');
    let url: URL;
    try { url = new URL(backend); } catch { throw new Error('VITE_BACKEND_URL must be a valid HTTP(S) origin'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
      throw new Error('VITE_BACKEND_URL must be an HTTP(S) origin without an API path, query, or credentials');
    }
    if ((process.env.VERCEL || process.env.CI) && (url.protocol !== 'https:' || /^(localhost|127\..*|\[::1\])$/.test(url.hostname) || url.hostname.endsWith('.localhost'))) {
      throw new Error('VITE_BACKEND_URL must point to the public HTTPS backend for hosted builds');
    }
  }
  return {
  plugins: [react()],
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
