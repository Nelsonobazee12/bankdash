import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  optimizeDeps: {
    include: ['@emotion/styled'],
  },
  plugins: [
    tsconfigPaths(),
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ],
  base: '/bankdash/', // Ensure this matches the base path of your app
  build: {
    outDir: 'build',  // Correct output directory
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://yourbackend.loca.lt',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});


