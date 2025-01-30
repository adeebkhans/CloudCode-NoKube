import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // Allows access from external devices (if required)
    port: 5173, // Ensures the dev server runs on this port
    hmr: {
      protocol: 'ws', // Use WebSocket for HMR
      host: 'localhost', // Ensure the WebSocket host is correct
      port: 5173, // Explicitly set WebSocket port
    },
    proxy: {
      '/socket.io': 'http://admin-01.codedate.linkpc.net',
    },
  },

})
