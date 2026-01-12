import { NextRequest, NextResponse } from 'next/server';
import { hashtagGenerator } from '@/lib/services/hashtagGenerator';
import { planLimitService } from '@/lib/services/planLimitService';

/**
 * AI 해시태그 생성 API
 * POST /api/hashtags/generate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, platform, topic, targetAudience, user_id } = body;

    // 필수 필드 확인
    if (!content || !platform) {
      return NextResponse.json(
        { error: 'content와 platform은 필수입니다.' },
        { status: 400 }
      );
    }

    // 사용량 확인 (해시태그 생성은 무료 플랜에서도 제한적으로 제공)
    if (user_id) {
      const { usageTracker } = await import('@/lib/services/usageTracker');
      const currentCount = await usageTracker.getUsage(user_id, 'hashtag-generation', 'monthly');
      
      // 무료 플랜: 월 50회 제한
      const maxUsage = 50;
      if (currentCount >= maxUsage) {
        return NextResponse.json(
          { 
            error: '월 사용량 한도에 도달했습니다. 유료 플랜으로 업그레이드하시면 더 많은 해시태그를 생성할 수 있습니다.',
            requires_upgrade: true,
            upgradePlan: 'personal',
            currentUsage: currentCount,
            maxUsage,
          },
          { status: 403 }
        );
      }

      // 사용량 기록
      await usageTracker.recordUsage(user_id, 'hashtag-generation', 1, 'monthly');
    }

    // 해시태그 생성
    const result = await hashtagGenerator.generateHashtags(
      content,
      platform,
      topic,
      targetAudience
    );

    return NextResponse.json({
      success: true,
      hashtags: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Hashtag API] 오류:', error);
    return NextResponse.json(
      {
        error: '해시태그 생성 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

/**
 * 트렌딩 주제 조회 API
 * GET /api/hashtags/trending?category=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;

    const topics = await hashtagGenerator.getTrendingTopics(category);

    return NextResponse.json({
      success: true,
      topics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Hashtag API] 오류:', error);
    return NextResponse.json(
      {
        error: '트렌딩 주제 조회 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

