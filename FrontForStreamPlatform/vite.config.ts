import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The backend serves auth under /api/v1/auth but the resources at bare /movies and /lists,
// so each prefix is forwarded verbatim - no rewrite. That keeps the paths the app requests
// identical in dev and in a same-origin production build.
//
// Client-side routes deliberately avoid these prefixes (/browse, /my-lists) so a hard
// refresh hits the SPA instead of being proxied to the API.
const api = { target: 'http://localhost:8080', changeOrigin: true }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': api,
      '/movies': api,
      '/lists': api,
    },
    port: 3000,
    open: true,
  },
})
