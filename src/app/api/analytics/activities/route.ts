/**
 * 사용자 활동 추적 API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { activities } = await request.json();

    if (!Array.isArray(activities)) {
      return NextResponse.json(
        { error: '활동 데이터가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 여기서 실제로는 데이터베이스에 저장하거나 분석 서비스로 전송
    // 예: Prisma, Google Analytics, Mixpanel 등

    // 로그만 기록 (실제 구현 시 데이터베이스 저장)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] 활동 추적:', activities.length, '개 이벤트');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('활동 추적 API 오류:', error);
    return NextResponse.json(
      { error: '활동 추적 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

