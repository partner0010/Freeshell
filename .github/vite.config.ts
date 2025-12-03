import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // 소스맵 제거 (프로덕션)
    sourcemap: false,
    
    // 코드 난독화 및 최적화
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false,
      },
    },
    
    // 청크 크기 최적화
    chunkSizeWarningLimit: 1000,
    
    // 롤업 옵션
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        compact: true,
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios'],
        },
      },
    },
    
    // 빌드 최적화
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
  
  // 개발 서버 설정
  server: {
    port: 3000,
    strictPort: false,
    host: true, // 모든 호스트 허용
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // 프리뷰 서버 설정 (프로덕션 빌드 테스트)
  preview: {
    port: 3000,
    strictPort: false,
    host: true, // 모든 호스트 허용
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  // 환경 변수 보호
  define: {
    'import.meta.env.VITE_API_KEY': process.env.NODE_ENV === 'production' 
      ? 'undefined' 
      : JSON.stringify(process.env.VITE_API_KEY || ''),
  },
})
