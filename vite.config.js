import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8001,
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      mangle: {
        properties: true,
        reserved: [],
        keep_classnames: false,
        keep_fnames: false,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      output: {
        comments: false,
      },
    }
  }
});

