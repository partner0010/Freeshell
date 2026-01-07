/**
 * 대화 관리 시스템
 * ChatGPT처럼 이전 대화를 기억하고 맥락을 유지
 */

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    source?: string;
    confidence?: number;
    tokens?: number;
  };
}

export interface ConversationSession {
  id: string;
  messages: ConversationMessage[];
  createdAt: number;
  lastAccessed: number;
  context: {
    topic?: string;
    mode?: 'chat' | 'developer' | 'creator' | 'general';
    preferences?: Record<string, any>;
  };
}

// 전역 대화 세션 저장소
declare global {
  var __conversationSessions: Map<string, ConversationSession>;
}

if (!global.__conversationSessions) {
  global.__conversationSessions = new Map<string, ConversationSession>();
}

export class ConversationManager {
  /**
   * 새 대화 세션 생성
   */
  createSession(mode: 'chat' | 'developer' | 'creator' | 'general' = 'chat'): string {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const session: ConversationSession = {
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      context: {
        mode,
      },
    };
    
    // 시스템 메시지 추가 (모드에 따라)
    const systemMessage = this.getSystemMessage(mode);
    if (systemMessage) {
      session.messages.push({
        role: 'system',
        content: systemMessage,
        timestamp: Date.now(),
      });
    }
    
    global.__conversationSessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * 모드별 시스템 메시지
   */
  private getSystemMessage(mode: string): string {
    switch (mode) {
      case 'developer':
        return `당신은 Cursor AI처럼 뛰어난 개발자 AI입니다. 코드를 이해하고, 분석하고, 생성하고, 개선할 수 있습니다. 사용자의 의도를 정확히 파악하고 최적의 솔루션을 제공합니다.`;
      case 'creator':
        return `당신은 창의적인 콘텐츠 제작 AI입니다. 영상, 이미지, 글 등 모든 형태의 콘텐츠를 기획하고 제작할 수 있습니다. 사용자의 요구사항을 이해하고 전문가 수준의 콘텐츠를 제공합니다.`;
      case 'chat':
        return `당신은 ChatGPT처럼 자연스럽고 유용한 대화를 나눌 수 있는 AI입니다. 이전 대화를 기억하고 맥락을 유지하며, 사용자에게 도움이 되는 정보를 제공합니다.`;
      default:
        return `당신은 유용하고 정확한 정보를 제공하는 AI입니다. 사용자의 질문에 대해 전문가 수준의 답변을 제공합니다.`;
    }
  }

  /**
   * 메시지 추가
   */
  addMessage(sessionId: string, role: 'user' | 'assistant', content: string, metadata?: any): void {
    const session = global.__conversationSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.messages.push({
      role,
      content,
      timestamp: Date.now(),
      metadata,
    });
    
    session.lastAccessed = Date.now();
    
    // 주제 자동 감지
    if (role === 'user' && session.messages.length <= 3) {
      session.context.topic = this.extractTopic(content);
    }
  }

  /**
   * 주제 추출
   */
  private extractTopic(content: string): string {
    // 간단한 키워드 기반 주제 추출
    const keywords = {
      '개발': ['코드', '프로그래밍', '개발', '프로젝트', '앱', '웹사이트'],
      'AI': ['AI', '인공지능', '머신러닝', '딥러닝'],
      '디자인': ['디자인', 'UI', 'UX', '레이아웃'],
      '콘텐츠': ['영상', '이미지', '글', '콘텐츠', '유튜브', '블로그'],
    };

    for (const [topic, words] of Object.entries(keywords)) {
      if (words.some(word => content.toLowerCase().includes(word))) {
        return topic;
      }
    }

    return '일반';
  }

  /**
   * 대화 히스토리 가져오기
   */
  getHistory(sessionId: string, limit: number = 10): ConversationMessage[] {
    const session = global.__conversationSessions.get(sessionId);
    if (!session) {
      return [];
    }

    // 최근 메시지만 반환
    return session.messages.slice(-limit);
  }

  /**
   * 대화 컨텍스트 생성 (프롬프트 최적화)
   */
  buildContext(sessionId: string): string {
    const session = global.__conversationSessions.get(sessionId);
    if (!session) {
      return '';
    }

    const history = this.getHistory(sessionId, 5); // 최근 5개 메시지
    const contextParts: string[] = [];

    // 시스템 메시지
    const systemMsg = history.find(m => m.role === 'system');
    if (systemMsg) {
      contextParts.push(`[시스템] ${systemMsg.content}`);
    }

    // 대화 히스토리
    if (history.length > 1) {
      contextParts.push('\n[이전 대화]');
      history
        .filter(m => m.role !== 'system')
        .forEach(msg => {
          const role = msg.role === 'user' ? '사용자' : 'AI';
          contextParts.push(`${role}: ${msg.content}`);
        });
    }

    // 주제 정보
    if (session.context.topic) {
      contextParts.push(`\n[주제] ${session.context.topic}`);
    }

    return contextParts.join('\n');
  }

  /**
   * 세션 가져오기
   */
  getSession(sessionId: string): ConversationSession | null {
    return global.__conversationSessions.get(sessionId) || null;
  }

  /**
   * 세션 삭제
   */
  deleteSession(sessionId: string): void {
    global.__conversationSessions.delete(sessionId);
  }

  /**
   * 오래된 세션 정리 (24시간 이상 미접근)
   */
  cleanupOldSessions(): number {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const [id, session] of global.__conversationSessions.entries()) {
      if (now - session.lastAccessed > oneDay) {
        global.__conversationSessions.delete(id);
        deleted++;
      }
    }

    return deleted;
  }
}

export const conversationManager = new ConversationManager();

