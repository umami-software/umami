import { fileURLToPath } from 'node:url';
import replace from '@rollup/plugin-replace';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    replace({
      __COLLECT_API_HOST__: '',
      __COLLECT_API_ENDPOINT__: '/api/send',
      delimiters: ['', ''],
      preventAssignment: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'tests/api/coverage/**/*.test.ts'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
