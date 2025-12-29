/**
 * API 실제 동작 테스트 유틸리티
 * 실제 API 호출이 이루어지는지 확인
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
 * OpenAI API 실제 호출 테스트
 */
export async function testOpenAIAPI(): Promise<APITestResult> {
  const startTime = Date.now();
  const hasAPIKey = !!process.env.OPENAI_API_KEY;

  try {
    if (!hasAPIKey) {
      return {
        endpoint: 'OpenAI API',
        method: 'POST',
        realAPICall: false,
        hasAPIKey: false,
        success: false,
        error: 'OPENAI_API_KEY가 설정되지 않았습니다.',
      };
    }

    // 실제 OpenAI API 호출 테스트
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, this is a test. Please respond with "API test successful".' },
        ],
        max_tokens: 10,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        endpoint: 'OpenAI API',
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
      endpoint: 'OpenAI API',
      method: 'POST',
      realAPICall: true,
      hasAPIKey: true,
      responseTime,
      success: true,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    return {
      endpoint: 'OpenAI API',
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
 * 모든 API 엔드포인트 테스트
 */
export async function testAllAPIs(): Promise<APITestResult[]> {
  const results: APITestResult[] = [];

  // OpenAI API 테스트
  results.push(await testOpenAIAPI());

  return results;
}

