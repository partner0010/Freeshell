import { NextRequest, NextResponse } from 'next/server';
import { gemini } from '@/lib/gemini';
import { aiModelManager } from '@/lib/ai-models';

/**
 * 종합 AI 진단 엔드포인트
 * 실제 AI 작동 상태를 테스트하고 문제를 진단
 */
export async function GET(request: NextRequest) {
  const diagnosis = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      hasGoogleApiKey: !!process.env.GOOGLE_API_KEY,
      googleApiKeyLength: process.env.GOOGLE_API_KEY?.length || 0,
      googleApiKeyPrefix: process.env.GOOGLE_API_KEY?.substring(0, 10) || '없음',
    },
    tests: [] as any[],
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      hasWorkingAI: false,
    },
    recommendations: [] as string[],
  };

  // 테스트 1: Google Gemini API 직접 호출 테스트
  if (process.env.GOOGLE_API_KEY) {
    try {
      const testStart = Date.now();
      const testPrompt = '안녕하세요';
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: testPrompt }] }],
            generationConfig: {
              maxOutputTokens: 50,
              temperature: 0.7,
            },
          }),
        }
      );

      const responseTime = Date.now() - testStart;
      const responseText = await response.text();

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          diagnosis.tests.push({
            name: 'Google Gemini API 직접 호출',
            success: true,
            responseTime,
            hasResponse: !!text,
            responseLength: text?.length || 0,
            responsePreview: text?.substring(0, 100) || '',
            message: '✅ Google Gemini API가 정상 작동합니다',
          });
          diagnosis.summary.passedTests++;
          diagnosis.summary.hasWorkingAI = true;
        } catch (e) {
          diagnosis.tests.push({
            name: 'Google Gemini API 직접 호출',
            success: false,
            responseTime,
            error: 'JSON 파싱 실패',
            rawResponse: responseText.substring(0, 200),
            message: '❌ 응답을 파싱할 수 없습니다',
          });
          diagnosis.summary.failedTests++;
        }
      } else {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          errorMessage = responseText.substring(0, 200);
        }

        diagnosis.tests.push({
          name: 'Google Gemini API 직접 호출',
          success: false,
          responseTime,
          status: response.status,
          error: errorMessage,
          message: `❌ API 오류: ${errorMessage}`,
        });
        diagnosis.summary.failedTests++;
        
        if (response.status === 401 || response.status === 403) {
          diagnosis.recommendations.push('API 키 인증 실패. GOOGLE_API_KEY가 올바른지 확인하세요.');
        } else if (response.status === 429) {
          diagnosis.recommendations.push('API 사용량 한도 초과. 잠시 후 다시 시도하세요.');
        }
      }
    } catch (error: any) {
      diagnosis.tests.push({
        name: 'Google Gemini API 직접 호출',
        success: false,
        error: error.message,
        message: `❌ 연결 실패: ${error.message}`,
      });
      diagnosis.summary.failedTests++;
      diagnosis.recommendations.push('네트워크 연결을 확인하세요.');
    }
  } else {
    diagnosis.tests.push({
      name: 'Google Gemini API 직접 호출',
      success: false,
      error: 'API 키 없음',
      message: '❌ GOOGLE_API_KEY가 설정되지 않았습니다',
    });
    diagnosis.summary.failedTests++;
    diagnosis.recommendations.push('GOOGLE_API_KEY를 환경 변수에 설정하세요.');
  }

  // 테스트 2: GeminiClient를 통한 호출 테스트
  try {
    const testStart = Date.now();
    const testPrompt = '간단한 테스트입니다';
    const result = await gemini.generateText(testPrompt, {
      maxTokens: 50,
      temperature: 0.7,
    });
    const responseTime = Date.now() - testStart;

    const isSimulation = result.includes('시뮬레이션') || result.includes('GOOGLE_API_KEY를 설정');
    
    diagnosis.tests.push({
      name: 'GeminiClient 래퍼 테스트',
      success: !isSimulation,
      responseTime,
      isSimulation,
      responseLength: result.length,
      responsePreview: result.substring(0, 100),
      message: isSimulation 
        ? '⚠️ 시뮬레이션 모드 (API 키 없음)'
        : '✅ 실제 AI 응답 생성 성공',
    });

    if (!isSimulation) {
      diagnosis.summary.passedTests++;
      diagnosis.summary.hasWorkingAI = true;
    } else {
      diagnosis.summary.failedTests++;
    }
  } catch (error: any) {
    diagnosis.tests.push({
      name: 'GeminiClient 래퍼 테스트',
      success: false,
      error: error.message,
      message: `❌ 오류: ${error.message}`,
    });
    diagnosis.summary.failedTests++;
  }

  // 테스트 3: AIModelManager를 통한 호출 테스트
  try {
    const testStart = Date.now();
    const testPrompt = 'AI 모델 테스트';
    const result = await aiModelManager.generateWithModel('gemini-pro', testPrompt);
    const responseTime = Date.now() - testStart;

    const isSimulation = result.includes('시뮬레이션') || result.includes('API 키를 설정');
    
    diagnosis.tests.push({
      name: 'AIModelManager 테스트',
      success: !isSimulation,
      responseTime,
      isSimulation,
      responseLength: result.length,
      responsePreview: result.substring(0, 100),
      message: isSimulation
        ? '⚠️ 시뮬레이션 모드 (API 키 없음)'
        : '✅ 실제 AI 응답 생성 성공',
    });

    if (!isSimulation) {
      diagnosis.summary.passedTests++;
      diagnosis.summary.hasWorkingAI = true;
    } else {
      diagnosis.summary.failedTests++;
    }
  } catch (error: any) {
    diagnosis.tests.push({
      name: 'AIModelManager 테스트',
      success: false,
      error: error.message,
      message: `❌ 오류: ${error.message}`,
    });
    diagnosis.summary.failedTests++;
  }

  // 테스트 4: 검색 API 엔드포인트 테스트
  try {
    const testStart = Date.now();
    const testResponse = await fetch(
      new URL('/api/search', request.url).toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '테스트 검색' }),
      }
    );
    const responseTime = Date.now() - testStart;
    const data = await testResponse.json();

    const isRealApi = data.apiInfo?.isRealApiCall || false;
    const hasError = !!data.error;

    diagnosis.tests.push({
      name: '검색 API 엔드포인트 테스트',
      success: !hasError && isRealApi,
      responseTime,
      isRealApiCall: isRealApi,
      hasError,
      error: data.error || null,
      message: hasError
        ? `❌ 오류: ${data.error}`
        : isRealApi
        ? '✅ 실제 AI API 사용'
        : '⚠️ 시뮬레이션 모드',
    });

    if (!hasError && isRealApi) {
      diagnosis.summary.passedTests++;
      diagnosis.summary.hasWorkingAI = true;
    } else {
      diagnosis.summary.failedTests++;
    }
  } catch (error: any) {
    diagnosis.tests.push({
      name: '검색 API 엔드포인트 테스트',
      success: false,
      error: error.message,
      message: `❌ 연결 실패: ${error.message}`,
    });
    diagnosis.summary.failedTests++;
  }

  // 요약 계산
  diagnosis.summary.totalTests = diagnosis.tests.length;

  // 최종 권장사항
  if (!diagnosis.summary.hasWorkingAI) {
    if (!process.env.GOOGLE_API_KEY) {
      diagnosis.recommendations.push('1. GOOGLE_API_KEY를 환경 변수에 설정하세요.');
      diagnosis.recommendations.push('2. Google AI Studio (https://makersuite.google.com/app/apikey)에서 무료 API 키를 발급받으세요.');
    } else {
      diagnosis.recommendations.push('API 키가 설정되어 있지만 작동하지 않습니다. 키가 올바른지 확인하세요.');
      diagnosis.recommendations.push('API 키 형식: "AIzaSy"로 시작해야 합니다.');
    }
  } else {
    diagnosis.recommendations.push('✅ AI가 정상적으로 작동하고 있습니다!');
  }

  return NextResponse.json(diagnosis, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
