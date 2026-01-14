/**
 * ChatGPT-like 대화 메모리 관리 시스템
 * 대화 기억, 요약, 토큰 제한 관리
 */

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface ConversationMemory {
  userId: string;
  messages: ConversationMessage[];
  summary: string;
  totalTokens: number;
  lastUpdated: Date;
}

// 메모리 저장소 (실제로는 DB 사용 권장)
const conversationStore: Map<string, ConversationMemory> = new Map();

// 토큰 제한 (무료 모델 기준)
const MAX_TOKENS = 4000; // 대부분의 무료 모델 제한
const SUMMARY_THRESHOLD = 3000; // 이 토큰 수를 넘으면 요약 시작

/**
 * 대화 메모리 가져오기
 */
export function getConversationMemory(userId: string): ConversationMemory {
  if (!conversationStore.has(userId)) {
    conversationStore.set(userId, {
      userId,
      messages: [],
      summary: '',
      totalTokens: 0,
      lastUpdated: new Date(),
    });
  }
  return conversationStore.get(userId)!;
}

/**
 * 대화 메시지 추가
 */
export function addMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): ConversationMemory {
  const memory = getConversationMemory(userId);
  const tokens = estimateTokens(content);
  
  memory.messages.push({
    role,
    content,
    timestamp: new Date(),
    tokens,
  });
  
  memory.totalTokens += tokens;
  memory.lastUpdated = new Date();
  
  // 토큰 제한 초과 시 요약
  if (memory.totalTokens > SUMMARY_THRESHOLD) {
    summarizeConversation(userId);
  }
  
  return memory;
}

/**
 * System Prompt 추가
 */
export function setSystemPrompt(userId: string, systemPrompt: string): void {
  const memory = getConversationMemory(userId);
  
  // 기존 system 메시지 제거
  memory.messages = memory.messages.filter(m => m.role !== 'system');
  
  // 새로운 system 메시지 추가 (맨 앞)
  memory.messages.unshift({
    role: 'system',
    content: systemPrompt,
    timestamp: new Date(),
    tokens: estimateTokens(systemPrompt),
  });
  
  memory.totalTokens = memory.messages.reduce((sum, m) => sum + (m.tokens || 0), 0);
}

/**
 * 대화 요약 (토큰 제한 관리)
 */
async function summarizeConversation(userId: string): Promise<void> {
  const memory = getConversationMemory(userId);
  
  if (memory.messages.length < 5) return; // 너무 적으면 요약 불필요
  
  // 최근 3개 메시지는 유지, 나머지는 요약
  const recentMessages = memory.messages.slice(-3);
  const oldMessages = memory.messages.slice(0, -3);
  
  // 요약 생성 (간단한 버전 - 실제로는 AI로 요약)
  const oldSummary = oldMessages
    .map(m => `${m.role}: ${m.content.substring(0, 100)}...`)
    .join('\n');
  
  memory.summary = memory.summary 
    ? `${memory.summary}\n\n이전 대화 요약:\n${oldSummary}`
    : `이전 대화 요약:\n${oldSummary}`;
  
  // 오래된 메시지 제거
  memory.messages = [
    ...memory.messages.filter(m => m.role === 'system'), // system은 유지
    ...recentMessages,
  ];
  
  // 토큰 재계산
  memory.totalTokens = memory.messages.reduce((sum, m) => sum + (m.tokens || 0), 0);
  memory.totalTokens += estimateTokens(memory.summary);
  
  memory.lastUpdated = new Date();
}

/**
 * 대화 히스토리 빌드 (LLM에 전달할 형식)
 */
export function buildConversationHistory(userId: string): Array<{ role: string; content: string }> {
  const memory = getConversationMemory(userId);
  
  const messages: Array<{ role: string; content: string }> = [];
  
  // System Prompt 추가
  const systemMessage = memory.messages.find(m => m.role === 'system');
  if (systemMessage) {
    messages.push({
      role: 'system',
      content: systemMessage.content,
    });
  }
  
  // 요약 추가 (있는 경우)
  if (memory.summary) {
    messages.push({
      role: 'system',
      content: `대화 요약:\n${memory.summary}`,
    });
  }
  
  // 실제 메시지 추가
  memory.messages
    .filter(m => m.role !== 'system')
    .forEach(m => {
      messages.push({
        role: m.role,
        content: m.content,
      });
    });
  
  return messages;
}

/**
 * 대화 초기화
 */
export function clearConversation(userId: string): void {
  conversationStore.delete(userId);
}

/**
 * 토큰 수 추정 (간단한 버전)
 * 실제로는 tiktoken 같은 라이브러리 사용 권장
 */
function estimateTokens(text: string): number {
  // 한국어는 평균 1.5자 = 1토큰, 영어는 4자 = 1토큰
  // 대략적으로 공백 포함 평균 3자 = 1토큰으로 계산
  return Math.ceil(text.length / 3);
}

/**
 * 대화 메모리 통계
 */
export function getMemoryStats(userId: string): {
  messageCount: number;
  totalTokens: number;
  summaryLength: number;
  lastUpdated: Date;
} {
  const memory = getConversationMemory(userId);
  return {
    messageCount: memory.messages.length,
    totalTokens: memory.totalTokens,
    summaryLength: memory.summary.length,
    lastUpdated: memory.lastUpdated,
  };
}
