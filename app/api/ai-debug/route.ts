import { NextRequest, NextResponse } from 'next/server';

/**
 * AI 디버깅 API
 * API 키 상태, 응답 생성 과정, 오류 등을 상세히 확인
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testPrompt = searchParams.get('prompt') || 'AI란?';
    
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      testPrompt,
      apiKeys: {
        GOOGLE_API_KEY: {
          exists: !!process.env.GOOGLE_API_KEY,
          length: process.env.GOOGLE_API_KEY?.length || 0,
          prefix: process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 10) + '...' : '없음',
        },
        OPENAI_API_KEY: {
          exists: !!process.env.OPENAI_API_KEY,
          length: process.env.OPENAI_API_KEY?.length || 0,
        },
        ANTHROPIC_API_KEY: {
          exists: !!process.env.ANTHROPIC_API_KEY,
          length: process.env.ANTHROPIC_API_KEY?.length || 0,
        },
      },
      testResults: [],
    };

    // Google Gemini API 테스트
    if (process.env.GOOGLE_API_KEY) {
      try {
        const startTime = Date.now();
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: testPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
              },
            }),
          }
        );

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          debugInfo.testResults.push({
            api: 'Google Gemini',
            success: true,
            responseTime,
            hasResponse: !!text,
            responseLength: text?.length || 0,
            responsePreview: text?.substring(0, 200) || '없음',
            fullResponse: text || '없음',
            status: response.status,
          });
        } else {
          const errorText = await response.text();
          debugInfo.testResults.push({
            api: 'Google Gemini',
            success: false,
            responseTime,
            status: response.status,
            statusText: response.statusText,
            error: errorText.substring(0, 500),
          });
        }
      } catch (error: any) {
        debugInfo.testResults.push({
          api: 'Google Gemini',
          success: false,
          error: error.message,
          stack: error.stack?.substring(0, 500),
        });
      }
    } else {
      debugInfo.testResults.push({
        api: 'Google Gemini',
        success: false,
        error: 'GOOGLE_API_KEY가 설정되지 않았습니다.',
      });
    }

    // Tracked AI 테스트
    try {
      const { generateTrackedAI } = await import('@/lib/tracked-ai');
      const startTime = Date.now();
      const result = await generateTrackedAI(testPrompt);
      const responseTime = Date.now() - startTime;
      
      debugInfo.trackedAI = {
        success: result.success,
        source: result.source,
        responseTime,
        hasResponse: !!result.text,
        responseLength: result.text?.length || 0,
        responsePreview: result.text?.substring(0, 300) || '없음',
        processId: result.processId,
        processSteps: result.process?.steps?.length || 0,
        apiCalls: result.process?.apiCalls || [],
      };
    } catch (error: any) {
      debugInfo.trackedAI = {
        success: false,
        error: error.message,
        stack: error.stack?.substring(0, 500),
      };
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    });
  } catch (error: any) {
    console.error('[AI Debug] 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '디버깅 정보 수집 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

