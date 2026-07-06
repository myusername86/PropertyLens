import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward API calls to the .NET backend during development,
    // so the browser sees a single origin and CORS never enters the picture.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
