import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: fileURLToPath(new URL('./src/unreal/assets', import.meta.url)),
  plugins: [
    vue({
      // Keep template output in host node operations instead of browser HTML fragments.
      template: { compilerOptions: { hoistStatic: false } },
    }),
  ],
  resolve: {
    alias: [
      { find: /^vue$/, replacement: '@vue/runtime-core' },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  build: {
    outDir: 'dist/unreal',
    emptyOutDir: true,
    // Keep min/max-width queries in the syntax supported by AffineUI.
    cssTarget: 'chrome90',
    lib: {
      entry: fileURLToPath(new URL('./src/unreal/main.ts', import.meta.url)),
      name: 'NativeVueCounter',
      formats: ['iife'],
      fileName: () => 'ui.js',
      cssFileName: 'ui',
    },
  },
})
