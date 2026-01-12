/**
 * 프로젝트 공유 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import { validateInput } from '@/lib/security/input-validation';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, userIds, permission = 'view' } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: '공유할 사용자 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    const validPermissions = ['view', 'edit', 'admin'];
    if (!validPermissions.includes(permission)) {
      return NextResponse.json(
        { error: '유효하지 않은 권한입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에 공유 정보 저장
    const shareRecords = userIds.map((userId: string) => ({
      projectId,
      userId,
      permission,
      sharedBy: session.userId,
      sharedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      shared: shareRecords.length,
      message: `${shareRecords.length}명에게 프로젝트가 공유되었습니다.`,
    });
  } catch (error: any) {
    console.error('[프로젝트 공유 API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 공유 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

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
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: '프로젝트 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 공유 정보 조회
    const sharedWith = [
      {
        userId: 'user2',
        email: 'user2@example.com',
        permission: 'edit',
        sharedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      sharedWith,
    });
  } catch (error: any) {
    console.error('[프로젝트 공유 조회 API] 오류:', error);
    return NextResponse.json(
      { error: '공유 정보 조회 중 오류가 발생했습니다.' },
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

    const body = await request.json();
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: '프로젝트 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 공유 정보 삭제

    return NextResponse.json({
      success: true,
      message: '공유가 취소되었습니다.',
    });
  } catch (error: any) {
    console.error('[프로젝트 공유 취소 API] 오류:', error);
    return NextResponse.json(
      { error: '공유 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
