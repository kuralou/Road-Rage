import { defineConfig } from 'vite';

export default defineConfig({
  // Adding the base property ensures the site looks for files 
  // in the /Road-Rage/ folder instead of the root.
  base: './', 
  server: {
    port: 8000,
    host: true 
  },
  build: {
    assetsInlineLimit: 0
  }
});