/**
 * Freeshell Security Middleware
 * Next.js 보안 미들웨어
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { securityMiddleware } from './middleware-security';
import { validateRequest } from '@/lib/security/vulnerability-scanner';
import { trackRequest } from '@/lib/security/intrusion-detection';
import { logIntrusionAlert, logVulnerabilityReport } from '@/lib/security/security-monitor';
import { validateCSRFRequest, generateCSRFToken } from '@/lib/security/csrf-protection';

// ============================================
// 보안 설정
// ============================================

const SECURITY_CONFIG = {
  // Rate Limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1분
    maxRequests: 100,
  },
  
  // 허용된 호스트
  allowedHosts: [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    'freeshell.co.kr',
    'www.freeshell.co.kr',
  ],
  
  // 차단된 User-Agent
  blockedUserAgents: [
    'curl',
    'wget',
    'python-requests',
    'scrapy',
  ],
  
  // 보호된 경로 (인증 필요)
  protectedPaths: [
    '/admin',
    '/api/admin',
    '/mypage',
  ],
  
  // 공개 경로 (인증 불필요)
  publicPaths: [
    '/',
    '/auth',
    '/api/auth',
    '/genspark',
    '/editor',
    '/creator',
    '/agents',
    '/schedule',
    '/meeting-notes',
    '/trends',
  ],
};

// Rate Limit 저장소
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ============================================
// 보안 헤더
// ============================================

function getSecurityHeaders() {
  return {
    'X-DNS-Prefetch-Control': 'on',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY', // SAMEORIGIN에서 DENY로 강화
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.openai.com https://api-inference.huggingface.co https://api.cohere.ai https://api.together.xyz https://*.supabase.co",
      "frame-src 'self' https://www.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

// ============================================
// Rate Limiting
// ============================================

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.rateLimit.windowMs,
    });
    return true;
  }

  if (record.count >= SECURITY_CONFIG.rateLimit.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// ============================================
// 미들웨어
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  // 정적 파일 및 Next.js 내부 경로는 스캔 제외
  const skipSecurityScan = 
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/healthcheck') ||
    pathname === '/' ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/);

  // 정상적인 페이지 경로는 보안 스캔 완전 제외
  const normalPages = [
    '/editor', '/creator', '/agents', '/signature', 
    '/trends', '/community', '/help', '/debug', '/validate', '/remote',
    '/auth/signin', '/auth/signup', '/mypage', '/privacy', '/terms',
    '/api/ai', '/api/content', '/api/signature', '/api/debug', '/api/validate'
  ];
  
  const isNormalPage = normalPages.some(page => pathname.startsWith(page));
  const isApiRoute = pathname.startsWith('/api/');
  
  // 정상 페이지와 API는 보안 스캔 완전 건너뛰기
  const shouldSkipSecurity = skipSecurityScan || isNormalPage || pathname === '/';

  // 1. 취약점 스캔 - 정상 페이지는 완전 제외
  if (!shouldSkipSecurity) {
    const vulnerabilityCheck = validateRequest(request);
    // Critical만 차단하고, 로그만 기록
    if (vulnerabilityCheck.blocked) {
      // 취약점 발견 시 로그 기록만 (차단은 Critical만)
      const criticalVulns = vulnerabilityCheck.vulnerabilities.filter(
        v => v.severity === 'critical'
      );
      
      if (criticalVulns.length > 0) {
        criticalVulns.forEach(v => {
          logVulnerabilityReport(v);
        });
        
        return new NextResponse(
          JSON.stringify({ 
            error: '보안 위협이 감지되었습니다.',
            blocked: true 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }

  // 2. 침입 탐지 시스템 (IDS) - 정상 페이지는 완전 제외
  if (!shouldSkipSecurity) {
    const intrusionCheck = trackRequest(request);
    // 실제 차단된 경우만 차단 (경고는 로그만)
    if (!intrusionCheck.allowed) {
      const blockedAlerts = intrusionCheck.alerts.filter(a => a.blocked);
      if (blockedAlerts.length > 0) {
        // 침입 시도 로그 기록
        blockedAlerts.forEach(alert => {
          logIntrusionAlert(alert);
        });
        
        return new NextResponse(
          JSON.stringify({ 
            error: '의심스러운 활동이 감지되어 접근이 차단되었습니다.',
            blocked: true 
          }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }

  // 3. AI Security Guard - 정상 페이지는 건너뛰기
  if (!shouldSkipSecurity) {
    const securityResponse = await securityMiddleware(request);
    if (securityResponse.status !== 200) {
      return securityResponse;
    }
  }

  // Rate Limiting
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // User-Agent 차단
  if (SECURITY_CONFIG.blockedUserAgents.some(blocked => userAgent.toLowerCase().includes(blocked))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 호스트 검증
  const host = request.headers.get('host');
  if (host && !SECURITY_CONFIG.allowedHosts.includes(host)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 보호된 경로 인증 확인
  const isProtectedPath = SECURITY_CONFIG.protectedPaths.some(path => pathname.startsWith(path));
  const isPublicPath = SECURITY_CONFIG.publicPaths.some(path => pathname.startsWith(path));

  if (isProtectedPath && !isPublicPath) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 관리자 페이지 접근 제어
    if (pathname.startsWith('/admin')) {
      // 관리자만 접근 가능
      if (token.role !== 'admin') {
        return new NextResponse('Forbidden: 관리자만 접근 가능합니다.', { status: 403 });
      }
    }
  }

  // CSRF 토큰 검증 (POST, PUT, PATCH, DELETE 요청)
  if (isApiRoute && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const csrfCheck = validateCSRFRequest(request);
    if (!csrfCheck.valid) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'CSRF 토큰 검증 실패',
          message: csrfCheck.error 
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // 보안 헤더 추가
  const response = NextResponse.next();
  Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // CSRF 토큰을 쿠키에 설정 (GET 요청 시)
  if (request.method === 'GET' && !request.cookies.get('csrf-token')) {
    const csrfToken = generateCSRFToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1시간
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
