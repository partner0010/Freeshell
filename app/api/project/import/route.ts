/**
 * 프로젝트 가져오기 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import { projectService } from '@/lib/services/projectService';
import { paymentService } from '@/lib/services/paymentService';

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
    const { projectData } = body;

    if (!projectData || !projectData.project) {
      return NextResponse.json(
        { error: '유효하지 않은 프로젝트 데이터입니다.' },
        { status: 400 }
      );
    }

    // 플랜 제한 확인
    const { plan } = paymentService.getActivePlan(session.userId);
    const userProjects = projectService.getProjectsByUserId(session.userId);
    const PLAN_LIMITS: Record<string, { maxProjects: number }> = {
      free: { maxProjects: 3 },
      personal: { maxProjects: 10 },
      pro: { maxProjects: -1 },
      enterprise: { maxProjects: -1 }
    };
    const maxProjects = PLAN_LIMITS[plan]?.maxProjects ?? 3;
    
    if (maxProjects !== -1 && userProjects.length >= maxProjects) {
      return NextResponse.json(
        { error: '프로젝트 생성 한도를 초과했습니다. 플랜을 업그레이드해주세요.' },
        { status: 403 }
      );
    }

    // 프로젝트 가져오기
    const importedProject = projectService.createProject({
      user_id: session.userId,
      title: projectData.project.title || '가져온 프로젝트',
      target_audience: projectData.project.target_audience || '',
      purpose: projectData.project.purpose || 'traffic',
      platform: projectData.project.platform || '',
      content_type: projectData.project.content_type || 'blog-post',
      template_id: null,
    });

    // 단계별 결과 복원 (실제로는 데이터베이스에 저장)
    // 여기서는 시뮬레이션

    return NextResponse.json({
      success: true,
      project: importedProject,
      message: '프로젝트가 가져와졌습니다.',
    });
  } catch (error: any) {
    console.error('[프로젝트 가져오기 API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 가져오기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
