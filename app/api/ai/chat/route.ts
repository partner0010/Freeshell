/**
 * ChatGPT-like AI Chat API
 * 대화 메모리 시스템을 활용한 대화형 AI
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';
import { generateWithFreeAI } from '@/lib/free-ai-services';
import {
  getConversationMemory,
  addMessage,
  setSystemPrompt,
  buildConversationHistory,
  getMemoryStats,
} from '@/lib/services/ai-memory-manager';
import { getSystemPrompt } from '@/lib/services/ai-prompt-manager';

export const dynamic = 'force-dynamic';

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
    const { message, userId, mode = 'default', code, language, fileName } = body;

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 입력 검증
    const validation = validateInput(message, {
      maxLength: 5000,
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

    const sanitizedMessage = validation.sanitized || message || '';
    const finalUserId = userId || 'anonymous';

    // System Prompt 설정
    const systemPrompt = getSystemPrompt(mode as 'default' | 'code-editor' | 'tutor');
    setSystemPrompt(finalUserId, systemPrompt);

    // 코드가 있으면 메시지에 포함
    let finalMessage = sanitizedMessage;
    if (code && language) {
      finalMessage = `다음 ${language} 코드에 대해 질문합니다:\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n질문: ${sanitizedMessage}`;
    }

    // 사용자 메시지 추가
    addMessage(finalUserId, 'user', finalMessage);

    // 대화 히스토리 빌드
    const conversationHistory = buildConversationHistory(finalUserId);

    // AI 응답 생성
    let aiResponse = '';
    let aiSource = 'fallback';

    try {
      // 무료 AI 서비스 사용 (Groq > Ollama > Together > OpenRouter > HuggingFace)
      const freeAIResult = await generateWithFreeAI(finalMessage);
      
      if (freeAIResult.success && freeAIResult.text && freeAIResult.text.trim()) {
        aiResponse = freeAIResult.text;
        aiSource = freeAIResult.source;
      } else {
        // Fallback: 대화 히스토리를 고려한 응답
        const historyContext = conversationHistory
          .slice(-4) // 최근 4개 메시지만
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');
        
        const contextPrompt = `${historyContext}\n\nassistant:`;
        const fallbackResult = await generateWithFreeAI(contextPrompt);
        aiResponse = fallbackResult.success ? fallbackResult.text : '죄송합니다. 응답을 생성할 수 없습니다.';
      }
    } catch (error) {
      console.error('[AI Chat] 오류:', error);
      aiResponse = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    // AI 응답을 메모리에 추가
    if (aiResponse) {
      addMessage(finalUserId, 'assistant', aiResponse);
    }

    // 메모리 통계
    const memoryStats = getMemoryStats(finalUserId);

    return NextResponse.json({
      message: aiResponse,
      source: aiSource,
      memory: {
        messageCount: memoryStats.messageCount,
        totalTokens: memoryStats.totalTokens,
        hasSummary: memoryStats.summaryLength > 0,
      },
    });
  } catch (error: any) {
    console.error('AI Chat API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 대화 히스토리 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'anonymous';

    const memory = getConversationMemory(userId);
    const history = buildConversationHistory(userId);
    const stats = getMemoryStats(userId);

    return NextResponse.json({
      messages: memory.messages.filter(m => m.role !== 'system'),
      summary: memory.summary,
      stats,
    });
  } catch (error: any) {
    console.error('AI Chat GET 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
