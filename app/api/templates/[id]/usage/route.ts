/**
 * 템플릿 사용 통계 API
 * POST /api/templates/[id]/usage - 템플릿 사용 횟수 증가
 * GET /api/templates/[id]/usage - 템플릿 사용 통계 조회
 */
import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById, incrementTemplateUsage } from '@/data/content-templates';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    
    if (!templateId) {
      return NextResponse.json(
        { error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 템플릿 사용 횟수 증가
    const updated = incrementTemplateUsage(templateId);

    if (!updated) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: {
        id: updated.id,
        title: updated.title,
        usageCount: updated.usageCount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Template Usage API] 오류:', error);
    return NextResponse.json(
      {
        error: '템플릿 사용 통계 업데이트 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    
    if (!templateId) {
      return NextResponse.json(
        { error: '템플릿 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        title: template.title,
        usageCount: template.usageCount || 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Template Usage API] 오류:', error);
    return NextResponse.json(
      {
        error: '템플릿 사용 통계 조회 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

