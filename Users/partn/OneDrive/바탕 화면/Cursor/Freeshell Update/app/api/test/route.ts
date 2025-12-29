import { NextRequest, NextResponse } from 'next/server';
import { testAllAPIs } from '@/lib/security/api-test';
import { getSecureEnv, validateEnv } from '@/lib/security/env-security';

/**
 * API 실제 동작 테스트 엔드포인트
 * 실제로 API가 호출되는지 확인
 */
export async function GET(request: NextRequest) {
  try {
    // 환경 변수 확인
    const envValidation = validateEnv();
    
    // API 테스트
    const testResults = await testAllAPIs();

    // 환경 변수 상태
    const envStatus = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '설정됨' : '설정 안됨',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '설정됨' : '설정 안됨',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? '설정됨' : '설정 안됨',
    };

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        validation: envValidation,
        apiKeys: envStatus,
      },
      apiTests: testResults,
      summary: {
        totalTests: testResults.length,
        successfulTests: testResults.filter(r => r.success).length,
        realAPICalls: testResults.filter(r => r.realAPICall).length,
        hasAPIKeys: testResults.filter(r => r.hasAPIKey).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: '테스트 중 오류 발생',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

