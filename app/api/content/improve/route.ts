import { NextRequest, NextResponse } from 'next/server';
import { improveContent } from '@/lib/content-improver';
import { ContentDraft } from '@/lib/content-drafter';
import { ContentPlan } from '@/lib/content-planner';

/**
 * 4단계: 품질 개선 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draft, plan, contentType } = body;

    if (!draft || !plan || !contentType) {
      return NextResponse.json(
        { error: '초안 정보, 기획 정보, 콘텐츠 유형은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!['youtube-script', 'blog-post', 'sns-post', 'instagram-caption', 'twitter-thread'].includes(contentType)) {
      return NextResponse.json(
        { error: '지원하지 않는 콘텐츠 유형입니다.' },
        { status: 400 }
      );
    }

    const improved = await improveContent(
      draft as ContentDraft,
      plan as ContentPlan,
      contentType as 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread'
    );

    return NextResponse.json({
      success: true,
      improved,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Content Improve API] 오류:', error);
    return NextResponse.json(
      {
        error: '품질 개선 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

