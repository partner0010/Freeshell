/**
 * 로그아웃 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/security/auth-enhanced';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    await logoutUser(request);

    const cookieStore = await cookies();
    cookieStore.delete('session');

    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  } catch (error: any) {
    console.error('[Logout API] 오류:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
