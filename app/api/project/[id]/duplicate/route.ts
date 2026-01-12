/**
 * 프로젝트 복제 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import { projectService } from '@/lib/services/projectService';
import { paymentService } from '@/lib/services/paymentService';

export async function POST(
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
    const originalProject = projectService.getProjectById(projectId);

    if (!originalProject) {
      return NextResponse.json(
        { error: '프로젝트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 권한 확인 (본인 프로젝트만 복제 가능)
    if (originalProject.user_id !== session.userId) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
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

    // 프로젝트 복제
    const duplicatedProject = projectService.createProject({
      user_id: session.userId,
      title: `${originalProject.title} (복사본)`,
      target_audience: originalProject.target_audience,
      purpose: originalProject.purpose,
      platform: originalProject.platform,
      content_type: originalProject.content_type,
      template_id: originalProject.template_id || null,
    });

    return NextResponse.json({
      success: true,
      project: duplicatedProject,
      message: '프로젝트가 복제되었습니다.',
    });
  } catch (error: any) {
    console.error('[프로젝트 복제 API] 오류:', error);
    return NextResponse.json(
      { error: '프로젝트 복제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
