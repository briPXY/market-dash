import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env files based on mode (development, production)
  // eslint-disable-next-line no-undef
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback: use localhost in development, empty in production
  const VITE_DOMAIN = mode === 'development'
    ? env.VITE_DOMAIN || 'http://localhost:3000'
    : env.VITE_DOMAIN || '';

  return {
    define: {
      'import.meta.env.VITE_DOMAIN': JSON.stringify(VITE_DOMAIN),
    },
    plugins: [react(), tailwindcss()],
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
  };
});
