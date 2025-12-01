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
        drop_console: true, // console.log 제거
        drop_debugger: true, // debugger 제거
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 특정 함수 제거
      },
      format: {
        comments: false, // 주석 제거
      },
    },
    
    // 청크 크기 최적화
    chunkSizeWarningLimit: 1000,
    
    // 롤업 옵션 (코드 난독화 강화)
    rollupOptions: {
      output: {
        // 파일명 해시로 변경 (캐시 무효화 및 소스 추적 방지)
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        
        // 코드 난독화
        compact: true,
        
        // 매뉴얼 청크 분할 (소스 추적 방지)
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios'],
        },
      },
    },
    
    // 빌드 최적화
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: false, // 빌드 시간 단축
  },
  
  // 개발 서버 설정
  server: {
    port: 3000,
    strictPort: true,
  },
  
  // 환경 변수 보호
  define: {
    // 프로덕션에서만 환경 변수 제거
    'import.meta.env.VITE_API_KEY': process.env.NODE_ENV === 'production' 
      ? 'undefined' 
      : JSON.stringify(process.env.VITE_API_KEY || ''),
  },
  
  // 보안 헤더
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
})

