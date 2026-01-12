/**
 * 보안 미들웨어
 * CSRF, 세션 관리, 요청 검증
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from './lib/security/session-enhanced';
import { rateLimitCheck } from './lib/security/rate-limit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일은 제외
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/status') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Rate Limiting
  const rateLimit = await rateLimitCheck(request, 100, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // 공개 경로 (인증 불필요)
  const publicPaths = [
    '/',
    '/about',
    '/help',
    '/auth/login',
    '/auth/signup',
    '/auth/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/status',
    '/templates/website', // 템플릿 갤러리는 공개
  ];
  const isPublic = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // 보호된 경로 확인 (모든 기능은 회원가입 필수)
  const protectedPaths = [
    '/admin',
    '/mypage',
    '/projects',
    '/build',
    '/editor',
    '/dashboard',
    '/templates/marketplace', // 마켓플레이스는 회원가입 필수
  ];
  const isProtected = !isPublic && (
    protectedPaths.some(path => pathname.startsWith(path)) ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/status')
  );

  if (isProtected) {
    // 세션 검증
    const session = await verifySession(request);
    if (!session) {
      // 로그인 페이지로 리다이렉트 (회원가입 강조)
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('requireSignup', 'true');
      return NextResponse.redirect(loginUrl);
    }

    // 관리자 경로는 추가 권한 확인
    if (pathname.startsWith('/admin')) {
      if (session.role !== 'admin') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
  }

  // 보안 헤더 추가
  const response = NextResponse.next();
  
  // XSS 방지
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 개발 환경용 (프로덕션에서는 제거)
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
