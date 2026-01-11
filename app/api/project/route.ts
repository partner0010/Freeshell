import { NextRequest, NextResponse } from 'next/server';
import { projectService } from '@/lib/services/projectService';
import { paymentService } from '@/lib/services/paymentService';

/**
 * 프로젝트 생성 API
 * POST /api/project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, target_audience, purpose, platform, content_type, template_id } = body;

    // 필수 필드 확인
    if (!user_id || !title || !target_audience || !purpose || !platform || !content_type) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 플랜 제한 확인
    const { plan } = paymentService.getActivePlan(user_id);
    const userProjects = projectService.getProjectsByUserId(user_id);
    const PLAN_LIMITS: Record<string, { maxProjects: number }> = {
      free: { maxProjects: 3 },
      personal: { maxProjects: 10 },
      pro: { maxProjects: -1 },
      enterprise: { maxProjects: -1 }
    };
    const maxProjects = PLAN_LIMITS[plan]?.maxProjects ?? 3;
    
    // 실제 프로젝트 수 확인 및 제한 적용
    if (maxProjects !== -1 && userProjects.length >= maxProjects) {
      return NextResponse.json(
        { error: '프로젝트 생성 한도를 초과했습니다. 플랜을 업그레이드해주세요.' },
        { status: 403 }
      );
    }

    // 프로젝트 생성
    const project = projectService.createProject({
      user_id,
      title,
      target_audience,
      purpose,
      platform,
      content_type,
      template_id: template_id || null,
    });

    // 템플릿 사용 통계 업데이트
    if (template_id) {
      try {
        await fetch(`${request.nextUrl.origin}/api/templates/${template_id}/usage`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('템플릿 사용 통계 업데이트 실패:', error);
        // 통계 업데이트 실패해도 프로젝트 생성은 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      project,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Project API] 오류:', error);
    return NextResponse.json(
      {
        error: '프로젝트 생성 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * 프로젝트 목록 조회 API
 * GET /api/project?user_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id는 필수입니다.' },
        { status: 400 }
      );
    }

    const projects = projectService.getProjectsByUserId(userId);

    return NextResponse.json({
      success: true,
      projects,
      count: projects.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Project API] 오류:', error);
    return NextResponse.json(
      {
        error: '프로젝트 조회 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

