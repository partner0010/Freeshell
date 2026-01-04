import { NextRequest, NextResponse } from 'next/server';

/**
 * AI 서비스 상태 및 API 키 진단 엔드포인트
 * 실제 연결 상태와 필요한 설정을 확인합니다
 */
export async function GET(request: NextRequest) {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        isProduction: process.env.NODE_ENV === 'production',
        platform: process.env.NETLIFY ? 'Netlify' : undefined,
      },
      apiKeys: {
        openai: {
          configured: !!process.env.OPENAI_API_KEY,
          hasValue: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length > 0 : false,
          prefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'not set',
          valid: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.startsWith('sk-') : false,
          message: process.env.OPENAI_API_KEY 
            ? (process.env.OPENAI_API_KEY.startsWith('sk-') ? '✅ 유효한 형식' : '⚠️ 형식이 올바르지 않을 수 있습니다 (sk-로 시작해야 함)')
            : '❌ 설정되지 않음',
        },
        anthropic: {
          configured: !!process.env.ANTHROPIC_API_KEY,
          hasValue: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length > 0 : false,
          prefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 10) + '...' : 'not set',
          valid: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.length > 20 : false,
          message: process.env.ANTHROPIC_API_KEY 
            ? '✅ 설정됨' 
            : '⚠️ 선택사항 (Claude 모델 사용 시 필요)',
        },
        google: {
          configured: !!process.env.GOOGLE_API_KEY,
          hasValue: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length > 0 : false,
          prefix: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 10) + '...' : 'not set',
          valid: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length > 20 : false,
          message: process.env.GOOGLE_API_KEY 
            ? '✅ 설정됨' 
            : '⚠️ 선택사항 (Gemini 모델 사용 시 필요)',
        },
      },
      services: {
        search: {
          name: 'AI 검색 엔진',
          required: 'OPENAI_API_KEY',
          status: process.env.OPENAI_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '시뮬레이션된 응답 제공',
          description: 'OpenAI GPT-4를 사용하여 검색 결과 생성',
        },
        spark: {
          name: 'Spark 워크스페이스',
          required: 'OPENAI_API_KEY',
          status: process.env.OPENAI_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '시뮬레이션된 응답 제공',
          description: 'OpenAI GPT-4를 사용하여 작업 자동화',
        },
        translate: {
          name: 'AI 번역',
          required: 'OPENAI_API_KEY',
          status: process.env.OPENAI_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '원문 반환',
          description: 'OpenAI GPT-4를 사용하여 번역',
        },
        imageGeneration: {
          name: '이미지 생성',
          required: 'OPENAI_API_KEY',
          status: process.env.OPENAI_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '플레이스홀더 이미지',
          description: 'DALL-E 3를 사용하여 이미지 생성',
        },
        research: {
          name: '심층 연구',
          required: 'OPENAI_API_KEY',
          status: process.env.OPENAI_API_KEY ? '✅ 사용 가능' : '❌ API 키 필요',
          fallback: '시뮬레이션된 연구 결과',
          description: 'OpenAI GPT-4를 사용하여 심층 분석',
        },
        aiModels: {
          name: 'AI 모델 관리',
          required: 'OPENAI_API_KEY (필수), ANTHROPIC_API_KEY (선택), GOOGLE_API_KEY (선택)',
          status: process.env.OPENAI_API_KEY ? '✅ 기본 모델 사용 가능' : '❌ 최소 1개 API 키 필요',
          fallback: '시뮬레이션된 응답',
          description: '다중 AI 모델 지원 (GPT-4, Claude, Gemini)',
        },
      },
      recommendations: {
        critical: [] as string[],
        important: [] as string[],
        optional: [] as string[],
      },
    };

    // 권장사항 생성
    if (!process.env.OPENAI_API_KEY) {
      status.recommendations.critical.push('OPENAI_API_KEY를 설정해야 대부분의 AI 기능이 실제로 작동합니다.');
    } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
      status.recommendations.critical.push('OPENAI_API_KEY 형식이 올바르지 않습니다. "sk-"로 시작해야 합니다.');
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      status.recommendations.important.push('ANTHROPIC_API_KEY를 설정하면 Claude 모델을 사용할 수 있습니다.');
    }

    if (!process.env.GOOGLE_API_KEY) {
      status.recommendations.optional.push('GOOGLE_API_KEY를 설정하면 Gemini 모델을 사용할 수 있습니다.');
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

