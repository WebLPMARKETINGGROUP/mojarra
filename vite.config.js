import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/test_mojarra_v4/',
  plugins: [react()],
})