import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/pacific-dataviz-2026/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@data': path.resolve(import.meta.dirname, '../data/processed'),
    },
  },
})
