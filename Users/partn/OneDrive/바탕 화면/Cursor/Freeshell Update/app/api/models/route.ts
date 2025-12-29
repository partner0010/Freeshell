import { NextRequest, NextResponse } from 'next/server';
import { aiModelManager } from '@/lib/ai-models';
import { validateInput, validateJson } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 100, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const models = aiModelManager.getAllModels();
    // API 키는 클라이언트에 노출하지 않음
    const safeModels = models.map(model => ({
      id: model.id,
      name: model.name,
      provider: model.provider,
      // apiKey는 제외
    }));
    return NextResponse.json({ models: safeModels });
  } catch (error) {
    console.error('Models GET error:', error);
    return NextResponse.json(
      { error: '모델 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 30, 60000); // 1분에 30회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();

    // 입력 검증
    const jsonValidation = validateJson(body);
    if (!jsonValidation.valid) {
      return NextResponse.json(
        { error: jsonValidation.error || 'Invalid JSON input' },
        { status: 400 }
      );
    }

    const parsedBody = JSON.parse(jsonValidation.sanitized);
    const { modelId, prompt, useMultiple } = parsedBody;

    // 개별 필드 검증
    const modelIdValidation = validateInput(modelId, {
      maxLength: 50,
      required: true,
      allowHtml: false,
    });

    const promptValidation = validateInput(prompt, {
      maxLength: 10000,
      required: true,
      allowHtml: false,
    });

    if (!modelIdValidation.valid || !promptValidation.valid) {
      return NextResponse.json(
        { error: modelIdValidation.error || promptValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    const sanitizedModelId = modelIdValidation.sanitized;
    const sanitizedPrompt = promptValidation.sanitized;

    if (useMultiple && Array.isArray(sanitizedModelId)) {
      // 여러 모델 동시 사용
      const results = await aiModelManager.generateWithMultipleModels(sanitizedPrompt, sanitizedModelId);
      return NextResponse.json({ results });
    } else {
      // 단일 모델 사용
      const result = await aiModelManager.generateWithModel(sanitizedModelId, sanitizedPrompt);
      return NextResponse.json({ result, modelId: sanitizedModelId });
    }
  } catch (error) {
    console.error('Models POST error:', error);
    return NextResponse.json(
      { error: '모델 실행 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

