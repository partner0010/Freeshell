import { NextRequest, NextResponse } from 'next/server';
import { learningSystem } from '@/lib/learning-system';
import { validateInput } from '@/lib/security/input-validation';

/**
 * 학습 피드백 API
 * 사용자 피드백을 받아 AI를 개선
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { learningId, rating, helpful, accurate, comments } = body;

    if (!learningId) {
      return NextResponse.json(
        { error: 'learningId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 학습 데이터 찾기
    const learningData = (global as any).__learningData?.find(
      (d: any) => d.id === learningId
    );

    if (!learningData) {
      return NextResponse.json(
        { error: '학습 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 피드백 업데이트
    learningData.feedback = {
      rating: rating || learningData.feedback.rating,
      helpful: helpful !== undefined ? helpful : learningData.feedback.helpful,
      accurate: accurate !== undefined ? accurate : learningData.feedback.accurate,
      comments: comments || learningData.feedback.comments,
    };

    // 개선 사항 분석
    const improvements = learningSystem.analyzeImprovements();

    return NextResponse.json({
      success: true,
      message: '피드백이 저장되었습니다. AI가 이를 바탕으로 개선됩니다.',
      improvements,
      stats: learningSystem.getStats(),
    });
  } catch (error: any) {
    console.error('[Learning Feedback API] 오류:', error);
    return NextResponse.json(
      { error: '피드백 저장 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 학습 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const stats = learningSystem.getStats();
    const improvements = learningSystem.analyzeImprovements();

    return NextResponse.json({
      success: true,
      stats,
      improvements,
    });
  } catch (error: any) {
    console.error('[Learning Stats API] 오류:', error);
    return NextResponse.json(
      { error: '통계 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

