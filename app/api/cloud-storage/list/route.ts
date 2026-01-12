/**
 * 클라우드 저장소 목록 조회 API
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

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    // 실제로는 데이터베이스에서 사용자의 프로젝트 목록 조회
    const projects: Array<{ id: string; name: string; modified: Date; provider: string }> = [];

    return NextResponse.json({
      success: true,
      projects: projects.filter(p => !provider || p.provider === provider),
    });
  } catch (error: any) {
    console.error('[클라우드 저장소 목록 조회 API] 오류:', error);
    return NextResponse.json(
      { error: '목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
