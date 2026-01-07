import { NextRequest, NextResponse } from 'next/server';
import { testGoogleGeminiAPI } from '@/lib/security/api-test';

/**
 * AI 서비스 상세 진단 엔드포인트
 * 실제 API 호출 테스트, 문제 원인 분석, 조치 방법 제공
 */
export async function GET(request: NextRequest) {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      overall: {
        status: 'unknown',
        healthScore: 0,
        criticalIssues: 0,
        warnings: 0,
        workingServices: 0,
        totalServices: 0,
      },
      services: {} as any,
      recommendations: {
        critical: [] as string[],
        important: [] as string[],
        optional: [] as string[],
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production',
        platform: process.env.NETLIFY ? 'Netlify' : 'Local',
      },
    };

    // Google Gemini API 상세 진단
    const googleApiKey = process.env.GOOGLE_API_KEY || '';
    const googleDiagnostics: any = {
      name: 'Google Gemini AI',
      provider: 'Google',
      required: true,
      apiKey: {
        configured: !!googleApiKey,
        hasValue: googleApiKey.length > 0,
        length: googleApiKey.length,
        prefix: googleApiKey ? googleApiKey.substring(0, 10) + '...' : 'N/A',
        valid: false,
        issues: [] as string[],
      },
      test: {
        performed: false,
        success: false,
        responseTime: 0,
        error: null as string | null,
        details: {} as any,
      },
      status: 'unknown',
      issues: [] as string[],
      solutions: [] as string[],
    };

    // API 키 검증
    if (!googleApiKey) {
      googleDiagnostics.apiKey.issues.push('API 키가 설정되지 않았습니다.');
      googleDiagnostics.apiKey.valid = false;
      googleDiagnostics.status = 'error';
      googleDiagnostics.issues.push('GOOGLE_API_KEY 환경 변수가 설정되지 않았습니다.');
      googleDiagnostics.solutions.push(
        '1. Netlify 대시보드에서 Site settings > Environment variables로 이동',
        '2. "Add variable" 클릭',
        '3. Key: GOOGLE_API_KEY, Value: (Google AI Studio에서 발급받은 API 키) 입력',
        '4. "Save" 클릭 후 "Trigger deploy"로 재배포'
      );
    } else if (googleApiKey.length < 20) {
      googleDiagnostics.apiKey.issues.push('API 키 길이가 너무 짧습니다 (최소 20자 필요).');
      googleDiagnostics.apiKey.valid = false;
      googleDiagnostics.status = 'error';
      googleDiagnostics.issues.push('API 키 형식이 올바르지 않습니다.');
      googleDiagnostics.solutions.push(
        '1. Google AI Studio (https://aistudio.google.com/)에서 새 API 키 발급',
        '2. 기존 키 삭제 후 새 키로 교체',
        '3. Netlify 환경 변수 업데이트 후 재배포'
      );
    } else {
      googleDiagnostics.apiKey.valid = true;
      
      // 실제 API 호출 테스트
      try {
        const testResult = await testGoogleGeminiAPI();
        googleDiagnostics.test.performed = true;
        googleDiagnostics.test.success = testResult.success;
        googleDiagnostics.test.responseTime = testResult.responseTime || 0;
        googleDiagnostics.test.details = {
          endpoint: testResult.endpoint,
          method: testResult.method,
          realAPICall: testResult.realAPICall,
        };

        if (testResult.success) {
          googleDiagnostics.status = 'healthy';
          googleDiagnostics.issues = [];
          googleDiagnostics.solutions = [];
        } else {
          googleDiagnostics.status = 'error';
          googleDiagnostics.test.error = testResult.error || '알 수 없는 오류';
          
          // 에러 타입별 원인 분석
          if (testResult.error?.includes('401') || testResult.error?.includes('403')) {
            googleDiagnostics.issues.push('API 키 인증 실패');
            googleDiagnostics.solutions.push(
              '1. Google AI Studio에서 API 키가 활성화되어 있는지 확인',
              '2. API 키에 Gemini API 사용 권한이 있는지 확인',
              '3. API 키가 만료되지 않았는지 확인',
              '4. 새 API 키를 발급받아 교체'
            );
          } else if (testResult.error?.includes('429')) {
            googleDiagnostics.issues.push('API 요청 한도 초과');
            googleDiagnostics.solutions.push(
              '1. 잠시 후 다시 시도',
              '2. Google AI Studio에서 사용량 확인',
              '3. 무료 티어 한도를 초과했다면 유료 플랜 고려'
            );
          } else if (testResult.error?.includes('500') || testResult.error?.includes('503')) {
            googleDiagnostics.issues.push('Google 서버 오류');
            googleDiagnostics.solutions.push(
              '1. Google Gemini API 서비스 상태 확인',
              '2. 잠시 후 다시 시도',
              '3. Google AI Studio 공지사항 확인'
            );
          } else {
            googleDiagnostics.issues.push(`API 호출 실패: ${testResult.error}`);
            googleDiagnostics.solutions.push(
              '1. 네트워크 연결 확인',
              '2. 방화벽 설정 확인',
              '3. API 키 형식 확인',
              '4. Google AI Studio에서 API 키 상태 확인'
            );
          }
        }
      } catch (error: any) {
        googleDiagnostics.test.performed = true;
        googleDiagnostics.test.success = false;
        googleDiagnostics.test.error = error.message || '테스트 중 오류 발생';
        googleDiagnostics.status = 'error';
        googleDiagnostics.issues.push('API 테스트 중 예외 발생');
        googleDiagnostics.solutions.push(
          '1. 서버 로그 확인',
          '2. 네트워크 연결 확인',
          '3. API 키 설정 확인'
        );
      }
    }

    diagnostics.services.google = googleDiagnostics;

    // 이미지 검색 API 진단
    const imageApis = {
      pexels: {
        name: 'Pexels',
        key: process.env.PEXELS_API_KEY || '',
        required: false,
      },
      unsplash: {
        name: 'Unsplash',
        key: process.env.UNSPLASH_ACCESS_KEY || '',
        required: false,
      },
      pixabay: {
        name: 'Pixabay',
        key: process.env.PIXABAY_API_KEY || '',
        required: false,
      },
    };

    for (const [id, api] of Object.entries(imageApis)) {
      const apiDiagnostics: any = {
        name: api.name,
        provider: id,
        required: api.required,
        apiKey: {
          configured: !!api.key,
          hasValue: api.key.length > 0,
          length: api.key.length,
          valid: api.key.length > 0,
        },
        status: api.key ? 'healthy' : 'not_configured',
        issues: [] as string[],
        solutions: [] as string[],
      };

      if (!api.key) {
        apiDiagnostics.issues.push('API 키가 설정되지 않았습니다.');
        apiDiagnostics.solutions.push(
          `1. ${api.name} 웹사이트에서 API 키 발급`,
          `2. Netlify 환경 변수에 ${id === 'unsplash' ? 'UNSPLASH_ACCESS_KEY' : id === 'pixabay' ? 'PIXABAY_API_KEY' : 'PEXELS_API_KEY'} 설정`,
          '3. 재배포'
        );
      }

      diagnostics.services[id] = apiDiagnostics;
    }

    // 전체 상태 계산
    const services = Object.values(diagnostics.services);
    diagnostics.overall.totalServices = services.length;
    diagnostics.overall.workingServices = services.filter((s: any) => s.status === 'healthy').length;
    diagnostics.overall.criticalIssues = services.filter((s: any) => s.status === 'error' && s.required).length;
    diagnostics.overall.warnings = services.filter((s: any) => s.status === 'not_configured' && !s.required).length;

    // 건강 점수 계산 (0-100)
    const healthyCount = diagnostics.overall.workingServices;
    const totalCount = diagnostics.overall.totalServices;
    diagnostics.overall.healthScore = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;

    // 전체 상태 결정
    if (diagnostics.overall.criticalIssues > 0) {
      diagnostics.overall.status = 'error';
    } else if (diagnostics.overall.warnings > 0) {
      diagnostics.overall.status = 'warning';
    } else if (diagnostics.overall.healthScore === 100) {
      diagnostics.overall.status = 'healthy';
    } else {
      diagnostics.overall.status = 'partial';
    }

    // 권장사항 생성
    if (diagnostics.services.google?.status === 'error') {
      diagnostics.recommendations.critical.push('Google Gemini API가 작동하지 않습니다. 위의 조치 방법을 따라 수정하세요.');
    }
    if (!diagnostics.services.google?.apiKey.configured) {
      diagnostics.recommendations.critical.push('GOOGLE_API_KEY를 설정해야 대부분의 AI 기능이 작동합니다.');
    }

    const imageApiCount = Object.values(diagnostics.services).filter((s: any) => 
      ['pexels', 'unsplash', 'pixabay'].includes(s.provider) && s.status === 'healthy'
    ).length;
    if (imageApiCount === 0) {
      diagnostics.recommendations.important.push('이미지 검색을 사용하려면 PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, 또는 PIXABAY_API_KEY 중 하나 이상을 설정하세요.');
    }

    return NextResponse.json(diagnostics, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '진단 중 오류 발생',
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

