/**
 * 세션 확인 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    
    if (!session) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error: any) {
    console.error('[Session API] 오류:', error);
    return NextResponse.json(
      { authenticated: false, error: '세션 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
