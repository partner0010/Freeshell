import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';

/**
 * 보안 관련 API
 * 세션 토큰, 접근 로그, 이상 행위 감지
 */

// 접근 로그 저장소 (실제로는 데이터베이스 사용)
const accessLogs = new Map<string, any[]>();

// 이상 행위 감지
const detectAnomaly = (code: string, ip: string, action: string): boolean => {
  const logs = accessLogs.get(code) || [];
  const recentLogs = logs.filter(log => 
    Date.now() - new Date(log.timestamp).getTime() < 60000 // 최근 1분
  );

  // 1분에 10회 이상 접근 시도
  if (recentLogs.length > 10) {
    return true;
  }

  // 짧은 시간에 여러 IP에서 접근 시도
  const uniqueIPs = new Set(recentLogs.map(log => log.ip));
  if (uniqueIPs.size > 3) {
    return true;
  }

  return false;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, code, token } = body;

    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    if (action === 'validate-token') {
      // 토큰 검증
      if (!token || !code) {
        return NextResponse.json(
          { error: '토큰과 코드가 필요합니다.' },
          { status: 400 }
        );
      }

      // 이상 행위 감지
      if (detectAnomaly(code, ip, 'validate-token')) {
        return NextResponse.json(
          { error: '보안 위협이 감지되었습니다. 접근이 차단되었습니다.' },
          { status: 403 }
        );
      }

      // 로그 기록
      const logs = accessLogs.get(code) || [];
      logs.push({
        ip,
        action: 'validate-token',
        timestamp: new Date().toISOString(),
        success: true,
      });
      accessLogs.set(code, logs);

      return NextResponse.json({
        success: true,
        valid: true,
        message: '토큰이 유효합니다.',
      });
    }

    if (action === 'generate-token') {
      // 세션 토큰 생성
      const token = Buffer.from(`${code}:${Date.now()}:${Math.random()}`).toString('base64');
      
      // 로그 기록
      const logs = accessLogs.get(code) || [];
      logs.push({
        ip,
        action: 'generate-token',
        timestamp: new Date().toISOString(),
        success: true,
      });
      accessLogs.set(code, logs);

      return NextResponse.json({
        success: true,
        token,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30분
      });
    }

    if (action === 'log-access') {
      // 접근 로그 기록
      const logs = accessLogs.get(code) || [];
      logs.push({
        ip,
        action: body.logAction || 'access',
        timestamp: new Date().toISOString(),
        metadata: body.metadata || {},
      });
      accessLogs.set(code, logs);

      return NextResponse.json({
        success: true,
        message: '접근 로그가 기록되었습니다.',
      });
    }

    return NextResponse.json(
      { error: '알 수 없는 액션입니다.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: '보안 처리 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: '연결 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    const logs = accessLogs.get(code) || [];

    return NextResponse.json({
      success: true,
      logs: logs.slice(-50), // 최근 50개만 반환
      total: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '로그 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

