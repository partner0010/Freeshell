import { NextRequest, NextResponse } from 'next/server';
import { infiniteAI } from '@/lib/infinite-ai';

/**
 * 무한한 가능성을 가진 자율 AI API
 * 신의 경지에서 스스로 판단하고 개선하는 완전 자율 AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    // 무한한 가능성의 응답 생성
    const response = await infiniteAI.generateInfiniteResponse(prompt);

    // 통계
    const stats = infiniteAI.getInfiniteStats();

    return NextResponse.json({
      success: true,
      response,
      stats,
      message: '무한한 가능성을 가진 자율 AI 응답이 생성되었습니다.',
      isInfiniteAI: true,
      isAutonomous: true,
      isDivineLevel: true,
    });
  } catch (error: any) {
    console.error('[Infinite AI] 오류:', error);
    return NextResponse.json(
      {
        error: '무한 AI 응답 생성 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 무한 AI 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const stats = infiniteAI.getInfiniteStats();
    
    return NextResponse.json({
      success: true,
      stats,
      message: '무한 AI 통계입니다.',
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

