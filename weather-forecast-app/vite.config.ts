import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

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
    projects: [
      {
        // Unit and property tests — use vi.stubGlobal('fetch'); no MSW
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: [
            'tests/unit/**/*.test.{ts,tsx}',
            'tests/property/**/*.test.{ts,tsx}',
            'src/**/*.test.{ts,tsx}',
          ],
        },
      },
      {
        // Integration tests — MSW intercepts real fetch calls
        test: {
          name: 'integration',
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts', './tests/integration/setup.ts'],
          include: ['tests/integration/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
})
