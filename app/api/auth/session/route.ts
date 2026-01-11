/**
 * 세션 조회 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: session,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Session API] 오류:', error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

