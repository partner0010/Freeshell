/**
 * 사용자 프로젝트 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 실제로는 데이터베이스에서 가져와야 함
    const projects: any[] = [
      // 예시 프로젝트
    ];

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error('[User Projects API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
