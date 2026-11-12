import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work from any URL path (GitHub Pages, Netlify, Vercel, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Forward API calls to the Express server (npm run server).
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
