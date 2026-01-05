import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';

/**
 * 실제 API 동작 테스트 엔드포인트
 * API 키가 설정되어 있고 실제로 작동하는지 확인
 */
export async function GET(request: NextRequest) {
  try {
    const testResults: any[] = [];
    
    // 1. Google Gemini API 테스트
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const hasGoogleKey = !!googleApiKey;
    
    let googleTest = {
      service: 'Google Gemini API',
      hasApiKey: hasGoogleKey,
      apiKeyPrefix: hasGoogleKey ? googleApiKey.substring(0, 10) + '...' : '없음',
      realApiCall: false,
      success: false,
      responseTime: 0,
      error: null as string | null,
      response: null as string | null,
    };

    if (hasGoogleKey) {
      const startTime = Date.now();
      try {
        // 실제 API 호출 테스트
        const testPrompt = '안녕하세요를 영어로 번역해주세요.';
        const response = await aiModelManager.generateWithModel('gemini-1.5-flash', testPrompt);
        const endTime = Date.now();
        
        googleTest.realApiCall = true;
        googleTest.success = true;
        googleTest.responseTime = endTime - startTime;
        googleTest.response = response.substring(0, 100) + '...';
        
        // 응답이 시뮬레이션인지 확인
        if (response.includes('시뮬레이션') || response.includes('API 키')) {
          googleTest.success = false;
          googleTest.error = '시뮬레이션된 응답이 반환되었습니다. API 키가 올바르지 않을 수 있습니다.';
        }
      } catch (error: any) {
        const endTime = Date.now();
        googleTest.realApiCall = true;
        googleTest.success = false;
        googleTest.responseTime = endTime - startTime;
        googleTest.error = error.message || 'API 호출 실패';
      }
    } else {
      googleTest.error = 'GOOGLE_API_KEY가 설정되지 않았습니다.';
    }

    testResults.push(googleTest);

    // 2. 이미지 API 테스트
    const imageApis = [
      { name: 'Pexels', key: 'PEXELS_API_KEY', env: process.env.PEXELS_API_KEY },
      { name: 'Unsplash', key: 'UNSPLASH_ACCESS_KEY', env: process.env.UNSPLASH_ACCESS_KEY },
      { name: 'Pixabay', key: 'PIXABAY_API_KEY', env: process.env.PIXABAY_API_KEY },
    ];

    for (const api of imageApis) {
      testResults.push({
        service: `${api.name} API`,
        hasApiKey: !!api.env,
        apiKeyPrefix: api.env ? api.env.substring(0, 10) + '...' : '없음',
        realApiCall: false,
        success: !!api.env,
        responseTime: 0,
        error: api.env ? null : `${api.key}가 설정되지 않았습니다.`,
        response: null,
      });
    }

    // 요약
    const summary = {
      totalTests: testResults.length,
      successfulTests: testResults.filter(t => t.success).length,
      realApiCalls: testResults.filter(t => t.realApiCall).length,
      hasApiKeys: testResults.filter(t => t.hasApiKey).length,
      criticalService: googleTest.success ? '✅ Google Gemini API 정상 작동' : '❌ Google Gemini API 작동 안함',
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production',
        platform: process.env.NETLIFY ? 'Netlify' : 'Local',
      },
      testResults,
      summary,
      recommendations: {
        ifGoogleFails: [
          'Netlify 환경 변수에서 GOOGLE_API_KEY를 확인하세요.',
          'API 키 형식이 올바른지 확인하세요 (AIzaSy...로 시작).',
          'API 키가 활성화되어 있는지 Google AI Studio에서 확인하세요.',
          '환경 변수 설정 후 재배포가 필요합니다.',
        ],
        ifGoogleWorks: [
          '✅ Google Gemini API가 정상적으로 작동하고 있습니다!',
          '검색 기능, 번역 기능, AI 콘텐츠 생성이 실제 API를 사용합니다.',
        ],
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '테스트 중 오류 발생',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

