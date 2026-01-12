import { NextRequest, NextResponse } from 'next/server';
import { websiteTemplates } from '@/data/website-templates';

export const dynamic = 'force-dynamic';

/**
 * 웹사이트/앱 템플릿 API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const templateId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filteredTemplates = [...websiteTemplates];

    // ID로 직접 검색
    if (templateId) {
      const template = filteredTemplates.find(t => t.id === templateId);
      if (template) {
        return NextResponse.json({
          success: true,
          template: template,
        });
      } else {
        return NextResponse.json(
          { error: '템플릿을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // 카테고리 필터
    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    // 검색 필터
    if (search) {
      const query = search.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t =>
        t.id.toLowerCase().includes(query) ||
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 페이지네이션
    const paginatedTemplates = filteredTemplates.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      templates: paginatedTemplates,
      total: filteredTemplates.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('[Website Templates API] 오류:', error);
    return NextResponse.json(
      { error: '템플릿을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
