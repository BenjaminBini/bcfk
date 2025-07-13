import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteInspector } from "@sveltejs/vite-plugin-svelte-inspector";

export default defineConfig({
  plugins: [
    svelte(),
    svelteInspector({
      /* plugin options */
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    outDir: "public/dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: "index.html",
    },
  },
  publicDir: "public/assets",
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});