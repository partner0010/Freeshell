/**
 * 팀 멤버 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 실제로는 데이터베이스에서 팀 멤버 조회
    // 여기서는 예시 데이터
    const members = [
      {
        id: session.userId,
        name: session.email.split('@')[0],
        email: session.email,
        role: 'owner',
        avatar: null,
        joinedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (error: any) {
    console.error('[팀 멤버 조회 API] 오류:', error);
    return NextResponse.json(
      { error: '멤버 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json(
        { error: '멤버 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 멤버 삭제
    // 권한 확인: owner 또는 admin만 삭제 가능

    return NextResponse.json({
      success: true,
      message: '멤버가 제거되었습니다.',
    });
  } catch (error: any) {
    console.error('[팀 멤버 삭제 API] 오류:', error);
    return NextResponse.json(
      { error: '멤버 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: '멤버 ID와 역할이 필요합니다.' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 역할 업데이트
    // 권한 확인: owner 또는 admin만 역할 변경 가능

    return NextResponse.json({
      success: true,
      message: '역할이 업데이트되었습니다.',
    });
  } catch (error: any) {
    console.error('[팀 멤버 역할 업데이트 API] 오류:', error);
    return NextResponse.json(
      { error: '역할 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
