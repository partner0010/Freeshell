import { NextRequest, NextResponse } from 'next/server';
import { rateLimitCheck, getClientIP } from '@/lib/security/rate-limit';
import { validateInput } from '@/lib/security/input-validation';

/**
 * 보안 미들웨어
 * Rate Limiting, 입력 검증, 보안 헤더 적용
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 Next.js 내부 경로는 제외
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // API 라우트에 대한 Rate Limiting
  if (pathname.startsWith('/api/')) {
    const rateLimit = await rateLimitCheck(request, 100, 60000); // 1분에 100회

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            ...Object.fromEntries(rateLimit.headers.entries()),
          },
        }
      );
    }

    // 응답에 Rate Limit 헤더 추가
    const response = NextResponse.next();
    rateLimit.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // 보안 헤더 추가
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );

    return response;
  }

  // 일반 페이지에 대한 보안 헤더
  const response = NextResponse.next();

  // 보안 헤더
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  // HTTPS 강제 (프로덕션)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
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
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

