import { NextRequest, NextResponse } from 'next/server';
import { conversationManager } from '@/lib/conversation-manager';
import { expertAI, ExpertMode } from '@/lib/expert-ai';
import { learningSystem } from '@/lib/learning-system';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

/**
 * ChatGPT처럼 대화하는 AI API
 * 이전 대화를 기억하고 맥락을 유지
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 50, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, sessionId, mode = 'chat' } = body;

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 검증
    const validation = validateInput(message, {
      maxLength: 2000,
      minLength: 1,
      required: true,
      allowHtml: false,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // 세션 관리
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = conversationManager.createSession(mode as any);
    }

    // 사용자 메시지 추가
    conversationManager.addMessage(currentSessionId, 'user', validation.sanitized);

    // 대화 컨텍스트 생성
    const context = conversationManager.buildContext(currentSessionId);
    const fullPrompt = `${context}\n\n[현재 메시지] ${validation.sanitized}\n\n위 대화를 이어서 자연스럽고 유용한 답변을 제공해주세요.`;

    // 전문가 AI 사용
    const expertMode = mode as ExpertMode;
    const response = await expertAI.handleMultimodalTask(fullPrompt, expertMode, {
      format: 'markdown',
      includeCode: expertMode === 'developer',
    });

    // 학습 시스템을 통한 응답 개선
    const improvedResponse = learningSystem.improveResponse(validation.sanitized, response);

    // AI 응답 추가
    conversationManager.addMessage(currentSessionId, 'assistant', improvedResponse, {
      source: 'expert-ai',
      confidence: 0.8,
    });

    // 학습 데이터 저장
    learningSystem.saveLearningData({
      prompt: validation.sanitized,
      response: improvedResponse,
      feedback: {},
      metadata: {
        mode: expertMode,
        source: 'expert-ai',
        timestamp: Date.now(),
      },
    });

    // 대화 히스토리 가져오기
    const history = conversationManager.getHistory(currentSessionId, 10);

    return NextResponse.json({
      success: true,
      response,
      sessionId: currentSessionId,
      history: history.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      context: conversationManager.getSession(currentSessionId)?.context,
      apiInfo: {
        isRealApiCall: !!process.env.GOOGLE_API_KEY,
        message: process.env.GOOGLE_API_KEY 
          ? '✅ 실제 AI API를 사용하여 대화합니다.'
          : '⚠️ GOOGLE_API_KEY를 설정하면 더 자연스러운 대화가 가능합니다.',
      },
    });
  } catch (error: any) {
    console.error('[Chat API] 오류:', error);
    return NextResponse.json(
      { error: '대화 처리 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * 세션 정보 가져오기
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId가 필요합니다.' },
        { status: 400 }
      );
    }

    const session = conversationManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        createdAt: session.createdAt,
        lastAccessed: session.lastAccessed,
        context: session.context,
        messageCount: session.messages.length,
      },
      history: conversationManager.getHistory(sessionId, 10).map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error: any) {
    console.error('[Chat API] 오류:', error);
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.', message: error.message },
      { status: 500 }
    );
  }
}

