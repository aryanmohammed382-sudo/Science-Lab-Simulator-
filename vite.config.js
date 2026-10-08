import { defineConfig } from 'vite';

// Relative base keeps the build working from any GitHub Pages sub-path
// (e.g. https://<user>.github.io/<repo>/) as well as from a custom domain.
export default defineConfig({
  base: './',
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
