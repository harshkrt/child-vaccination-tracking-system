import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // Add this resolve section for path aliases like @/components
    alias: {
      "@": "/src",
    },
  },
})