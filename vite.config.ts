import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { PluginOption, defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    APP_MODE: process.env.APP_MODE,
  },
  plugins: [
    react(),
    ...(process.env.ANALYZE === 'true' ? [visualizer() as PluginOption] : []),
    nodePolyfills({
      globals: {
        Buffer: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    // include: ['./node_modules/maven-ui/src/components'],
  },
  esbuild: {
    // jsxInject: `import React from 'react'`,
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const packagePath = id.split('node_modules/')[1];
          if (!packagePath) {
            return undefined;
          }
          return packagePath.split('/')[0];
        },
      },
      /**
       * Ignore "use client" waning since we are not using SSR
       * @see {@link https://github.com/TanStack/query/pull/5161#issuecomment-1477389761 Preserve 'use client' directives TanStack/query#5161}
       */
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes(`"use client"`)) {
          return;
        }
        warn(warning);
      },
    },
  },
}));
