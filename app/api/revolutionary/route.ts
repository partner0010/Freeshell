import { NextRequest, NextResponse } from 'next/server';
import { revolutionaryAI } from '@/lib/revolutionary-ai';

/**
 * 독보적인 AI API
 * 다른 어떤 AI와도 비교할 수 없는 독특하고 혁신적인 AI 응답
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, mode = 'revolutionary' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    let response;

    switch (mode) {
      case 'revolutionary':
        // 독보적인 응답
        response = await revolutionaryAI.generateRevolutionaryResponse(prompt);
        break;
      
      case 'solve':
        // 독보적인 문제 해결
        const solution = await revolutionaryAI.solveRevolutionary(prompt);
        response = {
          text: solution,
          insights: [],
          creativeIdeas: [],
          uniquePerspective: '문제 해결 모드',
          innovationLevel: 90,
          originality: 95,
          timestamp: Date.now(),
        };
        break;
      
      case 'creative':
        // 독보적인 창의성
        const creative = await revolutionaryAI.generateRevolutionaryCreative(prompt);
        response = {
          text: creative,
          insights: [],
          creativeIdeas: [],
          uniquePerspective: '창의성 모드',
          innovationLevel: 85,
          originality: 90,
          timestamp: Date.now(),
        };
        break;
      
      default:
        response = await revolutionaryAI.generateRevolutionaryResponse(prompt);
    }

    // 통계 정보 추가
    const stats = revolutionaryAI.getRevolutionaryStats();

    return NextResponse.json({
      success: true,
      response,
      stats,
      message: '독보적인 AI 응답이 생성되었습니다.',
    });
  } catch (error: any) {
    console.error('[Revolutionary AI] 오류:', error);
    return NextResponse.json(
      {
        error: '독보적인 AI 응답 생성 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 독보적 AI 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const stats = revolutionaryAI.getRevolutionaryStats();
    
    return NextResponse.json({
      success: true,
      stats,
      message: '독보적 AI 통계입니다.',
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

