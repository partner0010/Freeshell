/**
 * 에러 수집 API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorReport = await request.json();

    // 여기서 데이터베이스에 저장하거나 에러 추적 서비스로 전송
    // 예: Sentry, LogRocket, 자체 로깅 시스템 등
    
    // 현재는 로그만 기록 (실제로는 데이터베이스에 저장)
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Report]', errorReport);
    }

    // 성공 응답 (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // 에러는 무시 (에러 리포팅은 비중요)
    return new NextResponse(null, { status: 204 });
  }
}

