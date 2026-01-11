import { NextRequest, NextResponse } from 'next/server';
import { convertToPlatform } from '@/lib/content-converter';
import { ImprovedContent } from '@/lib/content-improver';

/**
 * 5단계: 플랫폼 변환 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { improvedContent, targetPlatform, originalPlatform } = body;

    if (!improvedContent || !targetPlatform) {
      return NextResponse.json(
        { error: '개선된 콘텐츠, 대상 플랫폼은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!['youtube-script', 'blog-post', 'sns-post', 'instagram-caption', 'twitter-thread'].includes(targetPlatform)) {
      return NextResponse.json(
        { error: '지원하지 않는 플랫폼입니다.' },
        { status: 400 }
      );
    }

    const converted = await convertToPlatform(
      improvedContent as ImprovedContent,
      targetPlatform as 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread',
      originalPlatform
    );

    return NextResponse.json({
      success: true,
      converted,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Content Convert API] 오류:', error);
    return NextResponse.json(
      {
        error: '플랫폼 변환 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

