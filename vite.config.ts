import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'react-vendor';
          }

          if (id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/@remix-run')) {
            return 'router-vendor';
          }

          if (id.includes('node_modules/@supabase')) {
            return 'supabase-vendor';
          }

          if (id.includes('node_modules/lucide-react')) {
            return 'ui-icons';
          }

          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }

          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdf-vendor';
          }

          if (id.includes('node_modules/exceljs')) {
            return 'excel-vendor';
          }

          if (id.includes('node_modules/mammoth')) {
            return 'word-vendor';
          }

          if (id.includes('node_modules/pptx2json')) {
            return 'pptx-vendor';
          }

          if (id.includes('node_modules/zustand')) {
            return 'state-vendor';
          }

          if (id.includes('node_modules/react-doc-viewer')) {
            return 'doc-viewer-vendor';
          }

          if (id.includes('/src/components/viewers/')) {
            return 'document-viewers';
          }

          if (id.includes('/src/components/') && id.includes('Modal.tsx')) {
            return 'modals';
          }

          if (id.includes('/src/services/uploadService') ||
              id.includes('/src/services/documentService') ||
              id.includes('/src/services/versionService') ||
              id.includes('/src/services/searchService')) {
            return 'services';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500,
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
  },
  server: {
    hmr: true,
  },
});
