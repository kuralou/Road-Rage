import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 8000,
    host: true // This allows you to test on your mobile phone over Wi-Fi
  },
  build: {
    assetsInlineLimit: 0
  }
});