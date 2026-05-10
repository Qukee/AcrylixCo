import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // `server-only` throws on import unless a bundler resolves it via the
      // `react-server` export condition (which Next.js sets for RSC bundles).
      // Vitest runs in plain Node/jsdom without that condition, so we alias
      // the import directly to the empty shim the package ships for that
      // purpose. Tests that import server-only modules then load cleanly.
      'server-only': path.resolve(__dirname, './node_modules/server-only/empty.js'),
    },
  },
});
