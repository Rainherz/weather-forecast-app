import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
      '@components': resolve(import.meta.dirname, './src/components'),
      '@services': resolve(import.meta.dirname, './src/services'),
      '@utils': resolve(import.meta.dirname, './src/utils'),
      '@types': resolve(import.meta.dirname, './src/types'),
      '@hooks': resolve(import.meta.dirname, './src/hooks'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
  },
})
