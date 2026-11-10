import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work from any URL path (GitHub Pages, Netlify, Vercel, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
});
