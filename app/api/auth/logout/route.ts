/**
 * 로그아웃 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await destroySession();

    return NextResponse.json(
      {
        success: true,
        message: '로그아웃되었습니다.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Logout API] 오류:', error);
    return NextResponse.json(
      {
        error: '로그아웃 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

