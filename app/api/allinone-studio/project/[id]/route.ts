/**
 * 올인원 스튜디오 프로젝트 상세 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';

export const dynamic = 'force-dynamic';

/**
 * 프로젝트 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // 실제로는 데이터베이스에서 가져와야 함
    // 임시로 빈 프로젝트 반환
    const project = {
      id: projectId,
      name: '프로젝트',
      type: 'shortform',
      status: 'draft',
      prompt: '',
      steps: {
        story: { status: 'pending' },
        character: { status: 'pending' },
        scene: { status: 'pending' },
        animation: { status: 'pending' },
        voice: { status: 'pending' },
        render: { status: 'pending' },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error('[AllInOne Studio Project Detail API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 프로젝트 업데이트
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const projectId = params.id;
    const body = await request.json();

    // 실제로는 데이터베이스에서 업데이트해야 함
    const updatedProject = {
      id: projectId,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      project: updatedProject,
      message: '프로젝트가 업데이트되었습니다.',
    });
  } catch (error: any) {
    console.error('[AllInOne Studio Project Update API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 프로젝트 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // 실제로는 데이터베이스에서 삭제해야 함

    return NextResponse.json({
      success: true,
      message: '프로젝트가 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('[AllInOne Studio Project Delete API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
