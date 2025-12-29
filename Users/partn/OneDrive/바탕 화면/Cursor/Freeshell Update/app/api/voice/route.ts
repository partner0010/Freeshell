import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

// AI 기반 전화 통화 시뮬레이션
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000); // 전화 통화는 제한적
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { phoneNumber, purpose, script } = body;

    // 입력 검증
    const phoneValidation = validateInput(phoneNumber, {
      maxLength: 20,
      required: true,
      allowHtml: false,
    });

    // 전화번호 형식 검증
    if (phoneValidation.valid) {
      const phonePattern = /^[0-9+\-\s()]+$/;
      if (!phonePattern.test(phoneValidation.sanitized)) {
        return NextResponse.json(
          { error: '올바른 전화번호 형식이 아닙니다.' },
          { status: 400 }
        );
      }
    }

    const purposeValidation = validateInput(purpose, {
      maxLength: 200,
      required: true,
      allowHtml: false,
    });

    if (!phoneValidation.valid || !purposeValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error || purposeValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // 스크립트 검증 (선택적)
    let sanitizedScript = '';
    if (script) {
      const scriptValidation = validateInput(script, {
        maxLength: 5000,
        allowHtml: false,
      });
      if (!scriptValidation.valid) {
        return NextResponse.json(
          { error: scriptValidation.error || 'Invalid script' },
          { status: 400 }
        );
      }
      sanitizedScript = scriptValidation.sanitized;
    }

    // 실제 구현 시 음성 합성 API (예: ElevenLabs, Google TTS) 사용
    // 여기서는 시뮬레이션된 응답 반환

    const response = {
      callId: `call_${Date.now()}`,
      phoneNumber: phoneValidation.sanitized,
      purpose: purposeValidation.sanitized,
      status: 'scheduled',
      script: sanitizedScript || `${purposeValidation.sanitized}에 대한 전화 통화 스크립트가 생성되었습니다.`,
      estimatedDuration: '5분',
      scheduledAt: new Date().toISOString(),
      voiceSettings: {
        voice: 'natural',
        language: 'ko-KR',
        speed: 1.0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Voice call error:', error);
    return NextResponse.json(
      { error: '전화 통화 예약 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

