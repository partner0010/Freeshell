/**
 * API 실제 동작 테스트 유틸리티
 * 실제 API 호출이 이루어지는지 확인 (무료 API만)
 */

export interface APITestResult {
  endpoint: string;
  method: string;
  realAPICall: boolean;
  hasAPIKey: boolean;
  responseTime?: number;
  error?: string;
  success: boolean;
}

/**
 * Google Gemini API 실제 호출 테스트
 */
export async function testGoogleGeminiAPI(): Promise<APITestResult> {
  const startTime = Date.now();
  const hasAPIKey = !!process.env.GOOGLE_API_KEY;

  try {
    if (!hasAPIKey) {
      return {
        endpoint: 'Google Gemini API',
        method: 'POST',
        realAPICall: false,
        hasAPIKey: false,
        success: false,
        error: 'GOOGLE_API_KEY가 설정되지 않았습니다.',
      };
    }

    // 실제 Google Gemini API 호출 테스트
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Hello, this is a test. Please respond with "API test successful".' }],
          }],
        }),
      }
    );

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        endpoint: 'Google Gemini API',
        method: 'POST',
        realAPICall: true,
        hasAPIKey: true,
        responseTime,
        success: false,
        error: `API 호출 실패: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      endpoint: 'Google Gemini API',
      method: 'POST',
      realAPICall: true,
      hasAPIKey: true,
      responseTime,
      success: true,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint: 'Google Gemini API',
      method: 'POST',
      realAPICall: true,
      hasAPIKey: true,
      responseTime,
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * 모든 API 엔드포인트 테스트 (무료 API만)
 */
export async function testAllAPIs(): Promise<APITestResult[]> {
  const results: APITestResult[] = [];

  // Google Gemini API 테스트
  results.push(await testGoogleGeminiAPI());

  return results;
}
