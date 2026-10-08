import { defineConfig } from 'vite';

// This repository is deployed as a GitHub Pages project site.
// Keep the base explicit so production asset URLs always resolve from
// /Science-Lab-Simulator-/ instead of the domain root.
export default defineConfig({
  base: '/Science-Lab-Simulator-/',
  build: {
    outDir: 'dist',
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 2000
  },
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    allowedHosts: ['.style.dev', 'localhost']
  }
});
