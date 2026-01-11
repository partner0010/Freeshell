import { NextRequest, NextResponse } from 'next/server';
import { draftContent } from '@/lib/content-drafter';
import { ContentStructure } from '@/lib/content-structurer';
import { ContentPlan } from '@/lib/content-planner';

/**
 * 3단계: 초안 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { structure, plan, contentType } = body;

    if (!structure || !plan || !contentType) {
      return NextResponse.json(
        { error: '구조 정보, 기획 정보, 콘텐츠 유형은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!['youtube-script', 'blog-post', 'sns-post', 'instagram-caption', 'twitter-thread'].includes(contentType)) {
      return NextResponse.json(
        { error: '지원하지 않는 콘텐츠 유형입니다.' },
        { status: 400 }
      );
    }

    const draft = await draftContent(
      structure as ContentStructure,
      plan as ContentPlan,
      contentType as 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread'
    );

    return NextResponse.json({
      success: true,
      draft,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Content Draft API] 오류:', error);
    return NextResponse.json(
      {
        error: '초안 생성 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

