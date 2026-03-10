import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      allowedHosts: ['.run.app'],
    },
    plugins: [react(), tailwindcss()],
    define: mode === 'development' ? {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    } : {},
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'motion': ['motion'],
            'recharts': ['recharts'],
            'genai': ['@google/genai'],
            'ui-libs': ['lucide-react', 'sonner', '@tanstack/react-query'],
            'common': ['./src/components/ErrorBoundary.tsx', './src/components/GlobalErrorBoundary.tsx'],
            'markdown': ['react-markdown', 'dompurify']
          },
        },
      },
    },
  };
});
