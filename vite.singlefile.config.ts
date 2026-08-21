import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Dedicated build that inlines every asset into a single self-contained index.html
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-single',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
