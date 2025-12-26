/**
 * Web Vitals 수집 API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json();

    // 여기서 데이터베이스에 저장하거나 분석 서비스로 전송
    // 예: Google Analytics, Mixpanel, 자체 분석 시스템 등
    
    // 현재는 로그만 기록 (실제로는 데이터베이스에 저장)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Web Vitals]', metric);
    }

    // 성공 응답 (204 No Content)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // 에러는 무시 (성능 모니터링은 비중요)
    return new NextResponse(null, { status: 204 });
  }
}

