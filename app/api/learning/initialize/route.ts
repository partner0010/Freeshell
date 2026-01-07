import { NextRequest, NextResponse } from 'next/server';
import { aiKnowledgeBase } from '@/lib/ai-knowledge-base';

/**
 * 초기 학습 데이터 로드 API
 * 네트워크를 통해 풍부한 학습 데이터를 확보
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = false } = body;

    // 이미 학습 데이터가 있고 force가 false면 스킵
    const stats = aiKnowledgeBase.getStats();
    if (!force && stats.totalEntries > 50) {
      return NextResponse.json({
        success: true,
        message: '이미 충분한 학습 데이터가 있습니다.',
        stats,
        skipped: true,
      });
    }

    // 초기 학습 데이터 로드 시작 (비동기)
    aiKnowledgeBase.loadInitialLearningData().then((loaded) => {
      console.log(`[Learning Initialize] 초기 학습 데이터 로드 완료: ${loaded}개 주제`);
    }).catch((error) => {
      console.error('[Learning Initialize] 초기 학습 데이터 로드 실패:', error);
    });

    return NextResponse.json({
      success: true,
      message: '초기 학습 데이터 로드를 시작했습니다. 백그라운드에서 진행됩니다.',
      stats,
      loading: true,
    });
  } catch (error: any) {
    console.error('[Learning Initialize] 오류:', error);
    return NextResponse.json(
      {
        error: '초기 학습 데이터 로드 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * 초기 학습 데이터 로드 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const stats = aiKnowledgeBase.getStats();

    return NextResponse.json({
      success: true,
      stats,
      hasInitialData: stats.totalEntries > 50,
    });
  } catch (error: any) {
    console.error('[Learning Initialize] 오류:', error);
    return NextResponse.json(
      {
        error: '학습 데이터 상태 조회 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

