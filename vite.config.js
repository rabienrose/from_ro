import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 8001,
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      mangle: {
        // properties:"true",
        properties:{
          reserved: ['0x69', '0x6a', '0x6b'],
          regex: /\bENUM_[A-Z_0-9]*\b/
          
        },
        reserved: ["job"],
        keep_classnames: false,
        keep_fnames: false,
        
      },
      compress: {
        drop_console: false,
        drop_debugger: true,
      },
      output: {
        comments: false,
      },
    }
  }
});

