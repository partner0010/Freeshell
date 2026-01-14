/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
  
  // 성능 최적화
  compress: true,
  poweredByHeader: false,
  
  // 실험적 기능
  experimental: {
    // optimizeCss: true, // critters 모듈이 필요하므로 비활성화
    optimizePackageImports: ['framer-motion', 'react-syntax-highlighter'],
  },
  
  // 웹팩 최적화
  webpack: (config, { isServer, webpack }) => {
    // Monaco Editor는 클라이언트 사이드 전용이므로 서버 사이드에서 완전히 제외
    // 클라이언트 사이드에서도 빌드 시점 분석 방지
    config.plugins = config.plugins || [];
    
    // 서버 사이드에서 Monaco Editor 관련 모듈 무시
    if (isServer) {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^@monaco-editor\/react$/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /^monaco-editor$/,
        })
      );
      
      config.resolve.alias = {
        ...config.resolve.alias,
        '@monaco-editor/react': false,
        'monaco-editor': false,
      };
    } else {
      // 클라이언트 사이드에서도 빌드 시점에 모듈을 찾지 않도록 설정
      // 런타임에만 동적으로 로드되도록
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    
    // 서버 사이드에서도 모듈을 올바르게 해결
    if (isServer) {
      // 서버 사이드에서 외부 모듈 해결 개선
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
        },
        // 모듈 해결 경로 명시
        modules: [
          ...(config.resolve.modules || []),
          'node_modules',
        ],
        // 확장자 해결 순서 명시
        extensions: [...(config.resolve.extensions || []), '.js', '.json', '.ts', '.tsx'],
      };
      
      // 동적 import 모듈을 빌드 시점에 분석하지 않도록 설정
      // IgnorePlugin을 사용하여 빌드 시점 모듈 해결 오류 방지
      // 런타임에 동적으로 로드되므로 빌드 시점에는 무시
      const path = require('path');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(otplib|qrcode)$/,
          contextRegExp: /app\/api\/auth\/2fa\/utils/,
        })
      );
    } else {
      // 클라이언트 사이드에서는 서버 전용 모듈을 사용하지 않음
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
      
      // otplib와 qrcode는 서버 사이드 전용이므로 클라이언트 번들에서 제외
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias['otplib'] = false;
      config.resolve.alias['qrcode'] = false;
      
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
              },
              name(module) {
                const hash = require('crypto').createHash('sha1');
                hash.update(module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
            shared: {
              name(module, chunks) {
                return require('crypto')
                  .createHash('sha1')
                  .update(chunks.reduce((acc, chunk) => acc + chunk.name, ''))
                  .digest('hex')
                  .substring(0, 8);
              },
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
          maxInitialRequests: 25,
          minSize: 20000,
        },
      };
    }
    return config;
  },
  
  // 보안 헤더 설정
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://www.google-analytics.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

