/**
 * 클라우드 저장소 로드 API
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
    const fileId = searchParams.get('fileId');
    const provider = searchParams.get('provider');

    if (!fileId || !provider) {
      return NextResponse.json(
        { error: '파일 ID와 제공자가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 해당 클라우드 저장소 API를 사용하여 로드
    // 여기서는 시뮬레이션
    const files: Array<{ name: string; type: string; content: string }> = [];

    return NextResponse.json({
      success: true,
      files,
      provider,
    });
  } catch (error: any) {
    console.error('[클라우드 저장소 로드 API] 오류:', error);
    return NextResponse.json(
      { error: '로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
