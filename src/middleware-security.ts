/**
 * AI Security Guard Middleware
 * 모든 요청을 실시간으로 분석하고 위협을 차단
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSecurityGuard } from '@/lib/security/ai-security-guard';
import { wafSystem } from '@/lib/security/waf';
import { dlpSystem } from '@/lib/security/dlp';

export async function securityMiddleware(request: NextRequest) {
  const ip = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown';

  const userAgent = request.headers.get('user-agent') || '';
  const method = request.method;
  const url = request.url;
  const pathname = new URL(url).pathname;

  // 정적 파일 및 정상 페이지는 스킵
  const normalPages = [
    '/editor', '/creator', '/agents', '/signature', 
    '/trends', '/community', '/help', '/debug', '/validate', '/remote',
    '/auth/signin', '/auth/signup', '/mypage', '/privacy', '/terms',
    '/api/ai', '/api/content', '/api/signature', '/api/debug', '/api/validate'
  ];
  
  const isNormalPage = normalPages.some(page => pathname.startsWith(page));
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/health') ||
    pathname === '/' ||
    isNormalPage
  ) {
    return NextResponse.next();
  }

  try {
    // WAF 검사
    const wafRequest = {
      ip,
      method,
      path: pathname,
      headers: Object.fromEntries(request.headers.entries()),
      userAgent,
    };

    const wafResponse = await wafSystem.inspectRequest(wafRequest);
    
    if (!wafResponse.allowed) {
      await aiSecurityGuard.logSecurityEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ipAddress: ip,
        userAgent,
        endpoint: pathname,
        method,
        threatType: 'unauthorized_access',
        severity: 'high',
        action: 'blocked',
        details: {
          reason: wafResponse.reason,
          matchedRules: wafResponse.matchedRules,
        },
      });

      return new NextResponse('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // AI Security Guard 위협 감지
    let body: any = null;
    try {
      if (request.body) {
        const clonedRequest = request.clone();
        body = await clonedRequest.json().catch(() => null);
      }
    } catch {
      // JSON 파싱 실패는 무시
    }

    const query = Object.fromEntries(
      new URL(url).searchParams.entries()
    );

    const threat = await aiSecurityGuard.detectThreat({
      ip,
      userAgent,
      method,
      url: pathname,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      query,
    });

    if (threat) {
      // 위협 로그 기록
      await aiSecurityGuard.logSecurityEvent({
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ipAddress: ip,
        userAgent,
        endpoint: pathname,
        method,
        threatType: threat.type,
        severity: threat.severity,
        action: threat.action,
        details: threat.metadata,
        dataAccessed: threat.action === 'blocked' ? [] : undefined,
      });

      // 차단된 경우
      if (threat.action === 'blocked') {
        return new NextResponse(
          JSON.stringify({
            error: 'Access Denied',
            reason: threat.description,
            threatType: threat.type,
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // DLP 검사 (POST/PUT 요청만)
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      const bodyString = JSON.stringify(body);
      const dlpResult = dlpSystem.scanData(bodyString, {
        location: pathname,
      });

      if (dlpResult.detected && dlpResult.events.some(e => e.action === 'blocked')) {
        await aiSecurityGuard.logSecurityEvent({
          id: crypto.randomUUID(),
          timestamp: new Date(),
          ipAddress: ip,
          userAgent,
          endpoint: pathname,
          method,
          threatType: 'data_exfiltration',
          severity: 'critical',
          action: 'blocked',
          details: {
            dlpEvents: dlpResult.events,
          },
          dataLeaked: dlpResult.events.map(e => e.dataType),
        });

        return new NextResponse(
          JSON.stringify({
            error: 'Sensitive data detected',
            reason: 'Request contains sensitive information',
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    // 요청 헤더에 보안 정보 추가
    const response = NextResponse.next();
    response.headers.set('X-Security-Check', 'passed');
    
    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    // 오류 발생 시 요청 통과 (보안 미들웨어 오류는 치명적이지 않음)
    return NextResponse.next();
  }
}

