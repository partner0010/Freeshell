/**
 * API 연동 테스트 API
 */
import { NextRequest, NextResponse } from 'next/server';

let apiConfigs: any[] = [];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    const config = apiConfigs.find(c => c.id === configId);

    if (!config) {
      return NextResponse.json(
        { error: '설정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 실제로는 API 연결 테스트 수행
    // 여기서는 시뮬레이션
    const testSuccess = Math.random() > 0.3; // 70% 성공률

    if (testSuccess) {
      config.status = 'success';
      config.lastTested = new Date();
      config.errorMessage = undefined;
    } else {
      config.status = 'error';
      config.errorMessage = '연결에 실패했습니다. 설정을 확인해주세요.';
    }

    return NextResponse.json({
      success: testSuccess,
      status: config.status,
      error: config.errorMessage,
    });
  } catch (error: any) {
    console.error('[API Test API] 오류:', error);
    return NextResponse.json(
      { error: '테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
