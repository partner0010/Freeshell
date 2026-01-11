import { NextRequest, NextResponse } from 'next/server';
import { planContent } from '@/lib/content-planner';

/**
 * 1단계: 콘텐츠 기획 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetAudience, purpose, platform, additionalInfo } = body;

    if (!targetAudience || !purpose || !platform) {
      return NextResponse.json(
        { error: '타겟 독자, 목적, 플랫폼은 필수입니다.' },
        { status: 400 }
      );
    }

    if (!['traffic', 'conversion', 'branding'].includes(purpose)) {
      return NextResponse.json(
        { error: '목적은 traffic, conversion, branding 중 하나여야 합니다.' },
        { status: 400 }
      );
    }

    const plan = await planContent(
      targetAudience,
      purpose as 'traffic' | 'conversion' | 'branding',
      platform,
      additionalInfo
    );

    return NextResponse.json({
      success: true,
      plan,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Content Plan API] 오류:', error);
    return NextResponse.json(
      {
        error: '콘텐츠 기획 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

