import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.spec.{ts,tsx}'],
    css: false,
    coverage: {
      provider: 'v8',
      exclude: [
        'src/components/ui/**',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        '**/*.css',
      ],
    },
  },
});
