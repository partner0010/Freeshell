import { NextRequest, NextResponse } from 'next/server';
import { searchTemplates, getTemplateById, getPopularTemplates, getTemplatesByCategory } from '@/data/content-templates';

export const dynamic = 'force-dynamic';

/**
 * 템플릿 검색 API
 * GET /api/templates?category=xxx&contentType=xxx&platform=xxx&tags=xxx&isPremium=xxx&searchQuery=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      category: searchParams.get('category') || undefined,
      contentType: searchParams.get('contentType') || undefined,
      platform: searchParams.get('platform') || undefined,
      tags: searchParams.get('tags')?.split(',') || undefined,
      isPremium: searchParams.get('isPremium') === 'true' ? true : searchParams.get('isPremium') === 'false' ? false : undefined,
      searchQuery: searchParams.get('searchQuery') || undefined,
    };

    // 특수 쿼리
    const action = searchParams.get('action');
    
    if (action === 'popular') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const templates = getPopularTemplates(limit);
      return NextResponse.json({
        success: true,
        templates,
        count: templates.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'category') {
      const category = searchParams.get('category');
      if (!category) {
        return NextResponse.json(
          { error: 'category 파라미터가 필요합니다.' },
          { status: 400 }
        );
      }
      const templates = getTemplatesByCategory(category);
      return NextResponse.json({
        success: true,
        templates,
        count: templates.length,
        timestamp: new Date().toISOString(),
      });
    }

    // 일반 검색
    const templates = searchTemplates(filters);

    return NextResponse.json({
      success: true,
      templates,
      count: templates.length,
      filters,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Templates API] 오류:', error);
    return NextResponse.json(
      {
        error: '템플릿 검색 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

