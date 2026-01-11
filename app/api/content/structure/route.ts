import { NextRequest, NextResponse } from 'next/server';
import { structureContent } from '@/lib/content-structurer';

/**
 * 2단계: 콘텐츠 구조 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, coreMessage, platform, contentType } = body;

    if (!topic || !coreMessage || !platform || !contentType) {
      return NextResponse.json(
        { error: '주제, 핵심 메시지, 플랫폼, 콘텐츠 유형은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!['youtube-script', 'blog-post', 'sns-post', 'instagram-caption', 'twitter-thread'].includes(contentType)) {
      return NextResponse.json(
        { error: '지원하지 않는 콘텐츠 유형입니다.' },
        { status: 400 }
      );
    }

    const structure = await structureContent(
      topic,
      coreMessage,
      platform,
      contentType as 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread'
    );

    return NextResponse.json({
      success: true,
      structure,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Content Structure API] 오류:', error);
    return NextResponse.json(
      {
        error: '콘텐츠 구조 작성 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

