import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    outDir: 'public/dist',
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      input: 'src/main.js',
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});