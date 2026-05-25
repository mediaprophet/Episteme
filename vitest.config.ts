import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 180000,   // 3 minutes - needed for CSS startup in CI
    testTimeout: 60000,
    include: ['vanilla-core/tests/**/*.test.{js,ts}'],
  },
});
