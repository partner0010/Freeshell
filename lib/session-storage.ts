/**
 * 세션 저장소 유틸리티
 * 서버 인스턴스 간 세션 공유를 위한 안정적인 저장소
 */

// 전역 세션 저장소 (서버 인스턴스 간 공유)
declare global {
  // eslint-disable-next-line no-var
  var __remoteSessions: Map<string, SessionData> | undefined;
}

export interface SessionData {
  code: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'connected' | 'disconnected';
  permissions: {
    screenShare: boolean;
    mouseControl: boolean;
    keyboardControl: boolean;
    recording: boolean;
  };
  clientConnectedAt?: string;
  hostId?: string;
  clientId?: string;
  chatMessages?: Array<{
    from: 'host' | 'client';
    message: string;
    time: Date | string;
  }>;
}

class SessionStorage {
  private sessions: Map<string, SessionData>;

  constructor() {
    // 전역 변수 사용 (서버 재시작 시에도 유지)
    if (globalThis.__remoteSessions) {
      this.sessions = globalThis.__remoteSessions;
    } else {
      this.sessions = new Map<string, SessionData>();
      globalThis.__remoteSessions = this.sessions;
    }

    // 만료된 세션 정리 (1분마다)
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60000);
  }

  /**
   * 세션 생성
   */
  createSession(permissions?: Partial<SessionData['permissions']>): SessionData {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const session: SessionData = {
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30분
      status: 'pending',
      permissions: {
        screenShare: false,
        mouseControl: false,
        keyboardControl: false,
        recording: false,
        ...permissions,
      },
    };

    this.sessions.set(code, session);
    console.log('[SessionStorage] Created session:', code, 'Total:', this.sessions.size);
    return session;
  }

  /**
   * 세션 조회
   */
  getSession(code: string): SessionData | null {
    const session = this.sessions.get(code);
    if (!session) {
      return null;
    }

    // 만료 확인
    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(code);
      return null;
    }

    return session;
  }

  /**
   * 세션 업데이트
   */
  updateSession(code: string, updates: Partial<SessionData>): SessionData | null {
    const session = this.getSession(code);
    if (!session) {
      return null;
    }

    Object.assign(session, updates);
    this.sessions.set(code, session);
    return session;
  }

  /**
   * 세션 삭제
   */
  deleteSession(code: string): boolean {
    return this.sessions.delete(code);
  }

  /**
   * 만료된 세션 정리
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [code, session] of this.sessions.entries()) {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(code);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log('[SessionStorage] Cleaned up', cleaned, 'expired sessions');
    }
  }

  /**
   * 모든 활성 세션 목록
   */
  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 활성 세션 수
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// 싱글톤 인스턴스
export const sessionStorage = new SessionStorage();

