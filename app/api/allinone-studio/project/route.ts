/**
 * 올인원 스튜디오 프로젝트 API
 * 프로젝트 저장 및 조회
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';

export const dynamic = 'force-dynamic';

/**
 * 프로젝트 목록 조회
 */
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
    // 임시로 로컬 스토리지 대신 메모리 기반 저장소 사용
    // 프로덕션에서는 데이터베이스 사용 필요
    
    const projects: any[] = [];

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error: any) {
    console.error('[AllInOne Studio Project API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 프로젝트 저장
 */
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
    const { id, name, type, prompt, steps, status, videoUrl, thumbnail } = body;

    if (!id || !type) {
      return NextResponse.json(
        { error: '프로젝트 ID와 타입은 필수입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에 저장해야 함
    // 임시로 성공 응답만 반환
    const project = {
      id,
      userId: session.userId,
      name: name || '제목 없음',
      type,
      prompt: prompt || '',
      steps: steps || {},
      status: status || 'draft',
      videoUrl: videoUrl || null,
      thumbnail: thumbnail || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      project,
      message: '프로젝트가 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('[AllInOne Studio Project API] 저장 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
