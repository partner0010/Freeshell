/**
 * 관리자 설정 API
 * SNS API, 광고/배너/팝업 설정 저장 및 조회
 */
import { NextRequest, NextResponse } from 'next/server';

// 실제로는 데이터베이스에 저장해야 하지만, 현재는 localStorage/메모리 저장
// 프로덕션에서는 데이터베이스 사용 권장

let settingsCache: {
  snsConfigs?: any[];
  adConfigs?: any[];
} = {};

export async function GET(request: NextRequest) {
  try {
    // 실제로는 데이터베이스에서 조회
    // 현재는 캐시된 값 반환
    return NextResponse.json({
      success: true,
      snsConfigs: settingsCache.snsConfigs || [],
      adConfigs: settingsCache.adConfigs || [],
    });
  } catch (error: any) {
    console.error('[Admin Settings API] GET 오류:', error);
    return NextResponse.json(
      { error: '설정을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { snsConfigs, adConfigs } = body;

    // 입력 검증
    if (!Array.isArray(snsConfigs) || !Array.isArray(adConfigs)) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      );
    }

    // 보안 검증: Client Secret은 마스킹하여 저장
    const sanitizedSNSConfigs = snsConfigs.map((config: any) => ({
      ...config,
      clientSecret: config.clientSecret ? '***' : '', // 실제로는 암호화하여 저장
    }));

    // 실제로는 데이터베이스에 저장
    // 현재는 메모리에 저장
    settingsCache = {
      snsConfigs: sanitizedSNSConfigs,
      adConfigs,
    };

    // 환경 변수에 실제 값 저장 (보안상 실제로는 별도 보안 저장소 사용)
    // 여기서는 예시로만 표시

    return NextResponse.json({
      success: true,
      message: '설정이 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('[Admin Settings API] POST 오류:', error);
    return NextResponse.json(
      { error: '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
