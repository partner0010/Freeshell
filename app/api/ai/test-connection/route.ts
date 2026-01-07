import { NextRequest, NextResponse } from 'next/server';

/**
 * API 연결 테스트 엔드포인트
 * 실제로 API가 작동하는지 확인하고 문제를 진단
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isNetlify: !!process.env.NETLIFY,
    },
    apiKeys: {
      google: {
        exists: !!process.env.GOOGLE_API_KEY,
        length: process.env.GOOGLE_API_KEY?.length || 0,
        prefix: process.env.GOOGLE_API_KEY?.substring(0, 10) || '없음',
        expectedPrefix: 'AIzaSy',
        isValidFormat: process.env.GOOGLE_API_KEY?.startsWith('AIzaSy') || false,
      },
      pexels: {
        exists: !!process.env.PEXELS_API_KEY,
        length: process.env.PEXELS_API_KEY?.length || 0,
        prefix: process.env.PEXELS_API_KEY?.substring(0, 10) || '없음',
      },
      pixabay: {
        exists: !!process.env.PIXABAY_API_KEY,
        length: process.env.PIXABAY_API_KEY?.length || 0,
        prefix: process.env.PIXABAY_API_KEY?.substring(0, 10) || '없음',
      },
    },
    tests: [] as any[],
    errors: [] as string[],
  };

  // 1. Google Gemini API 테스트
  if (process.env.GOOGLE_API_KEY) {
    try {
      const testStart = Date.now();
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
            generationConfig: {
              maxOutputTokens: 10,
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
          results.tests.push({
            api: 'Google Gemini',
            success: true,
            responseTime,
            hasResponse: !!text,
            responseLength: text?.length || 0,
            message: '✅ Google Gemini API 연결 성공',
          });
        } catch (e) {
          results.tests.push({
            api: 'Google Gemini',
            success: false,
            responseTime,
            error: 'JSON 파싱 실패',
            rawResponse: responseText.substring(0, 200),
            message: '⚠️ 응답을 파싱할 수 없습니다',
          });
          results.errors.push('Google Gemini: JSON 파싱 실패');
        }
      } else {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          errorMessage = responseText.substring(0, 200);
        }

        results.tests.push({
          api: 'Google Gemini',
          success: false,
          responseTime,
          status: response.status,
          error: errorMessage,
          message: `❌ Google Gemini API 오류: ${errorMessage}`,
        });
        results.errors.push(`Google Gemini: ${errorMessage}`);
      }
    } catch (error: any) {
      results.tests.push({
        api: 'Google Gemini',
        success: false,
        error: error.message,
        message: `❌ Google Gemini API 연결 실패: ${error.message}`,
      });
      results.errors.push(`Google Gemini: ${error.message}`);
    }
  } else {
    results.tests.push({
      api: 'Google Gemini',
      success: false,
      error: 'API 키가 설정되지 않았습니다',
      message: '❌ GOOGLE_API_KEY가 설정되지 않았습니다',
    });
    results.errors.push('Google Gemini: API 키 없음');
  }

  // 2. Pexels API 테스트
  if (process.env.PEXELS_API_KEY) {
    try {
      const testStart = Date.now();
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=test&per_page=1`,
        {
          headers: {
            'Authorization': process.env.PEXELS_API_KEY,
          },
        }
      );

      const responseTime = Date.now() - testStart;

      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'Pexels',
          success: true,
          responseTime,
          hasResults: !!data.photos,
          resultsCount: data.photos?.length || 0,
          message: '✅ Pexels API 연결 성공',
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'Pexels',
          success: false,
          responseTime,
          status: response.status,
          error: errorText.substring(0, 200),
          message: `❌ Pexels API 오류: ${response.status}`,
        });
        results.errors.push(`Pexels: HTTP ${response.status}`);
      }
    } catch (error: any) {
      results.tests.push({
        api: 'Pexels',
        success: false,
        error: error.message,
        message: `❌ Pexels API 연결 실패: ${error.message}`,
      });
      results.errors.push(`Pexels: ${error.message}`);
    }
  } else {
    results.tests.push({
      api: 'Pexels',
      success: false,
      error: 'API 키가 설정되지 않았습니다',
      message: '❌ PEXELS_API_KEY가 설정되지 않았습니다',
    });
  }

  // 3. Pixabay API 테스트
  if (process.env.PIXABAY_API_KEY) {
    try {
      const testStart = Date.now();
      const response = await fetch(
        `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=test&image_type=photo&per_page=1`
      );

      const responseTime = Date.now() - testStart;

      if (response.ok) {
        const data = await response.json();
        results.tests.push({
          api: 'Pixabay',
          success: true,
          responseTime,
          hasResults: !!data.hits,
          resultsCount: data.hits?.length || 0,
          message: '✅ Pixabay API 연결 성공',
        });
      } else {
        const errorText = await response.text();
        results.tests.push({
          api: 'Pixabay',
          success: false,
          responseTime,
          status: response.status,
          error: errorText.substring(0, 200),
          message: `❌ Pixabay API 오류: ${response.status}`,
        });
        results.errors.push(`Pixabay: HTTP ${response.status}`);
      }
    } catch (error: any) {
      results.tests.push({
        api: 'Pixabay',
        success: false,
        error: error.message,
        message: `❌ Pixabay API 연결 실패: ${error.message}`,
      });
      results.errors.push(`Pixabay: ${error.message}`);
    }
  } else {
    results.tests.push({
      api: 'Pixabay',
      success: false,
      error: 'API 키가 설정되지 않았습니다',
      message: '❌ PIXABAY_API_KEY가 설정되지 않았습니다',
    });
  }

  // 진단 및 권장사항
  results.diagnosis = {
    allWorking: results.tests.every((t: any) => t.success),
    someWorking: results.tests.some((t: any) => t.success),
    allFailed: results.tests.every((t: any) => !t.success),
    totalTests: results.tests.length,
    successfulTests: results.tests.filter((t: any) => t.success).length,
  };

  results.recommendations = [];
  
  if (!results.apiKeys.google.exists) {
    results.recommendations.push('GOOGLE_API_KEY를 Netlify 환경 변수에 설정하세요.');
  } else if (!results.apiKeys.google.isValidFormat) {
    results.recommendations.push('GOOGLE_API_KEY 형식이 올바르지 않을 수 있습니다. "AIzaSy"로 시작해야 합니다.');
  }

  if (!results.apiKeys.pexels.exists) {
    results.recommendations.push('PEXELS_API_KEY를 Netlify 환경 변수에 설정하세요.');
  }

  if (!results.apiKeys.pixabay.exists) {
    results.recommendations.push('PIXABAY_API_KEY를 Netlify 환경 변수에 설정하세요.');
  }

  if (results.errors.length > 0) {
    results.recommendations.push('API 오류가 발생했습니다. API 키가 유효한지 확인하세요.');
    results.recommendations.push('Netlify에서 환경 변수를 설정한 후 "Trigger deploy"를 클릭하여 재배포하세요.');
  }

  return NextResponse.json(results, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

