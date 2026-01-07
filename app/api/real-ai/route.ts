import { NextRequest, NextResponse } from 'next/server';
import { realAIEngine } from '@/lib/real-ai-engine';

/**
 * 실제 구동되는 AI API
 * 겉할기 식이 아닌 실제로 작동하는 AI 시스템
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, config } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 설정 업데이트 (있는 경우)
    if (config) {
      // realAIEngine.config 업데이트 로직
    }

    // 실제 AI 응답 생성
    const response = await realAIEngine.generateRealResponse(prompt);

    // 실제 통계
    const stats = realAIEngine.getRealStats();

    return NextResponse.json({
      success: true,
      response,
      stats,
      message: '실제 구동되는 AI 응답이 생성되었습니다.',
      isRealAI: true,
    });
  } catch (error: any) {
    console.error('[Real AI] 오류:', error);
    return NextResponse.json(
      {
        error: '실제 AI 응답 생성 중 오류가 발생했습니다.',
        message: error.message,
        isRealAI: false,
      },
      { status: 500 }
    );
  }
}

/**
 * 실제 AI 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const stats = realAIEngine.getRealStats();
    
    return NextResponse.json({
      success: true,
      stats,
      message: '실제 AI 통계입니다.',
      isRealAI: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '통계 조회 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

