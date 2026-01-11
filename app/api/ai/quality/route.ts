import { NextRequest, NextResponse } from 'next/server';
import { aiQualityController } from '@/lib/controllers/aiQualityController';
import { aiStepResultStorage } from '@/lib/db/storage';

/**
 * AI Quality API (4단계: 품질 개선)
 * POST /api/ai/quality
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, user_id, content_type } = body;

    // 필수 필드 확인
    if (!project_id || !user_id || !content_type) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 단계 실행
    const result = await aiQualityController.execute(project_id, user_id, {
      contentType: content_type,
    });

    return NextResponse.json({
      success: result.status === 'success',
      step_result: result,
      output: result.output_data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI Quality API] 오류:', error);
    
    // 업그레이드 필요 에러 처리
    if (error.message.includes('업그레이드')) {
      return NextResponse.json(
        {
          error: error.message,
          requires_upgrade: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'AI 품질 개선 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * AI Quality 결과 조회
 * GET /api/ai/quality?project_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id는 필수입니다.' },
        { status: 400 }
      );
    }

    const result = aiStepResultStorage.findByProjectIdAndStepType(projectId, 'QUALITY');

    if (!result) {
      return NextResponse.json(
        { error: '결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      step_result: result,
      output: result.output_data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AI Quality API] 오류:', error);
    return NextResponse.json(
      {
        error: 'AI 품질 개선 결과 조회 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

