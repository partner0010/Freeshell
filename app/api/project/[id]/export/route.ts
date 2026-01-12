/**
 * 프로젝트 내보내기 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import { projectService } from '@/lib/services/projectService';

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
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const project = projectService.getProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인
    if (project.user_id !== session.userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 단계별 결과 가져오기
    const stepResults = {
      step1: null,
      step2: null,
      step3: null,
      step4: null,
      step5: null,
    };

    // 각 단계 결과 조회 (실제로는 데이터베이스에서 가져옴)
    try {
      const step1Response = await fetch(`${request.nextUrl.origin}/api/ai/plan?project_id=${projectId}`);
      if (step1Response.ok) {
        stepResults.step1 = await step1Response.json();
      }
    } catch (error) {
      console.error('Step 1 결과 조회 실패:', error);
    }

    const exportData = {
      project: {
        id: project.id,
        title: project.title,
        target_audience: project.target_audience,
        purpose: project.purpose,
        platform: project.platform,
        content_type: project.content_type,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      stepResults,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="project-${projectId}.json"`,
        },
      });
    } else {
      // PDF 형식은 추후 구현
      return NextResponse.json(
        { error: 'PDF 형식은 아직 지원되지 않습니다.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[프로젝트 내보내기 API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
