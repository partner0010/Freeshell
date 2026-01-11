import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById } from '@/data/content-templates';

/**
 * 템플릿 조회 API
 * GET /api/templates/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const template = getTemplateById(id);
    
    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      template,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Template API] 오류:', error);
    return NextResponse.json(
      {
        error: '템플릿 조회 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

