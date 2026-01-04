import { NextRequest, NextResponse } from 'next/server';

/**
 * AI 서비스 상태 및 API 키 진단 엔드포인트
 * 실제 연결 상태와 필요한 설정을 확인합니다 (무료 API만)
 */
export async function GET(request: NextRequest) {
  try {
    const getApiKeyStatus = (key: string, prefix: string = '') => {
      const hasValue = !!process.env[key];
      const startsWithPrefix = hasValue && prefix ? process.env[key]?.startsWith(prefix) : false;
      return {
        configured: hasValue,
        hasValue: hasValue,
        prefix: prefix,
        valid: hasValue ? (prefix ? startsWithPrefix : true) : false,
        message: hasValue
          ? (prefix && startsWithPrefix ? '✅ API 키가 올바르게 설정되었습니다.' : prefix ? `⚠️ API 키 형식이 올바르지 않을 수 있습니다 (시작: ${prefix}).` : '✅ 설정됨')
          : '❌ API 키가 설정되지 않았습니다.',
      };
    };

    const status = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production',
        platform: process.env.NETLIFY ? 'Netlify' : undefined,
      },
      apiKeys: {
        google: getApiKeyStatus('GOOGLE_API_KEY', ''),
        pexels: getApiKeyStatus('PEXELS_API_KEY', ''),
        unsplash: getApiKeyStatus('UNSPLASH_ACCESS_KEY', ''),
        pixabay: getApiKeyStatus('PIXABAY_API_KEY', ''),
      },
      services: {
        search: {
          name: 'AI 검색 엔진',
          required: 'GOOGLE_API_KEY',
          status: process.env.GOOGLE_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '시뮬레이션된 응답 제공',
          description: 'Google Gemini API를 사용하여 검색 결과 생성',
        },
        spark: {
          name: 'Spark 워크스페이스',
          required: 'GOOGLE_API_KEY',
          status: process.env.GOOGLE_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '시뮬레이션된 응답 제공',
          description: 'Google Gemini API를 사용하여 작업 자동화',
        },
        translate: {
          name: 'AI 번역',
          required: 'GOOGLE_API_KEY',
          status: process.env.GOOGLE_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '원문 반환',
          description: 'Google Gemini API를 사용하여 번역',
        },
        research: {
          name: '심층 연구',
          required: 'GOOGLE_API_KEY',
          status: process.env.GOOGLE_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '시뮬레이션된 연구 결과',
          description: 'Google Gemini API를 사용하여 심층 분석',
        },
        webSearch: {
          name: '웹 검색',
          required: '없음 (완전 무료)',
          status: '✅ 항상 사용 가능',
          fallback: '없음',
          description: 'DuckDuckGo + Wikipedia (API 키 불필요)',
        },
        imageSearch: {
          name: '이미지 검색',
          required: 'PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY (하나 이상 권장)',
          status: (process.env.PEXELS_API_KEY || process.env.UNSPLASH_ACCESS_KEY || process.env.PIXABAY_API_KEY) ? '✅ 사용 가능' : '⚠️ API 키 없으면 결과 없음',
          fallback: '검색 결과 없음',
          description: 'Pexels + Unsplash + Pixabay (무료)',
        },
      },
      recommendations: {
        critical: [] as string[],
        important: [] as string[],
        optional: [] as string[],
      },
    };

    // 권장사항 생성
    if (!process.env.GOOGLE_API_KEY) {
      status.recommendations.critical.push('GOOGLE_API_KEY를 설정해야 대부분의 AI 기능이 실제로 작동합니다. (무료 티어 제공)');
    }

    if (!process.env.PEXELS_API_KEY && !process.env.UNSPLASH_ACCESS_KEY && !process.env.PIXABAY_API_KEY) {
      status.recommendations.important.push('이미지 검색을 사용하려면 PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, 또는 PIXABAY_API_KEY 중 하나 이상을 설정하세요. (모두 무료)');
    }

    if (!process.env.PEXELS_API_KEY) {
      status.recommendations.optional.push('PEXELS_API_KEY를 설정하면 Pexels 이미지 검색을 사용할 수 있습니다. (무료)');
    }
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      status.recommendations.optional.push('UNSPLASH_ACCESS_KEY를 설정하면 Unsplash 이미지 검색을 사용할 수 있습니다. (무료 티어)');
    }
    if (!process.env.PIXABAY_API_KEY) {
      status.recommendations.optional.push('PIXABAY_API_KEY를 설정하면 Pixabay 이미지 검색을 사용할 수 있습니다. (무료 티어)');
    }

    // Netlify 환경 확인
    if (process.env.NETLIFY) {
      status.environment.platform = 'Netlify';
      status.recommendations.important.push('Netlify 환경 변수는 Site settings > Environment variables에서 설정해야 합니다.');
      status.recommendations.important.push('환경 변수 설정 후 Deploys 탭에서 "Trigger deploy"를 클릭하여 재배포해야 합니다.');
    }

    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '상태 확인 중 오류 발생',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
