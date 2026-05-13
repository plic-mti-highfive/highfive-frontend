import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/projects': 'http://localhost:3000',
      '/skills': 'http://localhost:3000',
      '/connections': 'http://localhost:3000',
      '/tenants': 'http://localhost:3000',
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
})