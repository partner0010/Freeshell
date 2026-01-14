/**
 * 템플릿 조회/검색 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { templateStorage } from '@/lib/templates/template-storage';
import { TemplateFilter } from '@/lib/templates/template-schema';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const filter: TemplateFilter = {
      type: searchParams.get('type') as any,
      category: searchParams.get('category') as any,
      tags: searchParams.get('tags')?.split(',').filter(Boolean),
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // ID로 조회
    const id = searchParams.get('id');
    if (id) {
      const template = templateStorage.get(id);
      if (!template) {
        return NextResponse.json(
          { error: '템플릿을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ template });
    }

    // 검색/필터
    const templates = templateStorage.search(filter);

    return NextResponse.json({
      templates,
      count: templates.length,
      total: templateStorage.count(),
    });
  } catch (error: any) {
    console.error('템플릿 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
