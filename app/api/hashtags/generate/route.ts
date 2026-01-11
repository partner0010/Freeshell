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
      // TODO: 실제 사용량 추적 구현
      // const usageCheck = planLimitService.checkHashtagGenerationLimit(userId, currentCount);
      // if (!usageCheck.allowed) {
      //   return NextResponse.json(
      //     { error: usageCheck.reason, requires_upgrade: true, upgradePlan: usageCheck.upgradePlan },
      //     { status: 403 }
      //   );
      // }
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

