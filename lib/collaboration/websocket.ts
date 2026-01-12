/**
 * 실시간 협업 WebSocket 클라이언트
 * 여러 사용자가 동시에 편집할 수 있도록 지원
 */
'use client';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

export interface CollaborationMessage {
  type: 'cursor' | 'change' | 'selection' | 'join' | 'leave' | 'chat';
  userId: string;
  data: any;
  timestamp: number;
}

class CollaborationClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private roomId: string | null = null;
  private userId: string;
  private userName: string;
  private onMessageCallbacks: Array<(message: CollaborationMessage) => void> = [];
  private onUserJoinCallbacks: Array<(user: CollaborationUser) => void> = [];
  private onUserLeaveCallbacks: Array<(userId: string) => void> = [];
  private onErrorCallbacks: Array<(error: Error) => void> = [];

  constructor(userId: string, userName: string) {
    this.userId = userId;
    this.userName = userName;
  }

  connect(roomId: string) {
    this.roomId = roomId;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:3001`;
    
    try {
      this.ws = new WebSocket(`${wsUrl}/collaboration/${roomId}?userId=${this.userId}&userName=${this.userName}`);

      this.ws.onopen = () => {
        console.log('[Collaboration] 연결됨');
        this.reconnectAttempts = 0;
        this.send({
          type: 'join',
          userId: this.userId,
          data: { name: this.userName },
          timestamp: Date.now(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: CollaborationMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('[Collaboration] 메시지 파싱 실패:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[Collaboration] 오류:', error);
        this.onErrorCallbacks.forEach(cb => cb(new Error('WebSocket 오류')));
      };

      this.ws.onclose = () => {
        console.log('[Collaboration] 연결 종료');
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('[Collaboration] 연결 실패:', error);
      this.onErrorCallbacks.forEach(cb => cb(error as Error));
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomId) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`[Collaboration] 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect(this.roomId!);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(message: CollaborationMessage) {
    switch (message.type) {
      case 'join':
        this.onUserJoinCallbacks.forEach(cb => cb({
          id: message.userId,
          name: message.data.name,
          color: this.generateColor(message.userId),
        }));
        break;
      case 'leave':
        this.onUserLeaveCallbacks.forEach(cb => cb(message.userId));
        break;
      default:
        this.onMessageCallbacks.forEach(cb => cb(message));
    }
  }

  send(message: CollaborationMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendCursor(cursor: { line: number; column: number }) {
    this.send({
      type: 'cursor',
      userId: this.userId,
      data: { cursor },
      timestamp: Date.now(),
    });
  }

  sendChange(change: { file: string; content: string; position: number }) {
    this.send({
      type: 'change',
      userId: this.userId,
      data: { change },
      timestamp: Date.now(),
    });
  }

  sendSelection(selection: { start: number; end: number; file: string }) {
    this.send({
      type: 'selection',
      userId: this.userId,
      data: { selection },
      timestamp: Date.now(),
    });
  }

  sendChat(message: string) {
    this.send({
      type: 'chat',
      userId: this.userId,
      data: { message },
      timestamp: Date.now(),
    });
  }

  onMessage(callback: (message: CollaborationMessage) => void) {
    this.onMessageCallbacks.push(callback);
    return () => {
      this.onMessageCallbacks = this.onMessageCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserJoin(callback: (user: CollaborationUser) => void) {
    this.onUserJoinCallbacks.push(callback);
    return () => {
      this.onUserJoinCallbacks = this.onUserJoinCallbacks.filter(cb => cb !== callback);
    };
  }

  onUserLeave(callback: (userId: string) => void) {
    this.onUserLeaveCallbacks.push(callback);
    return () => {
      this.onUserLeaveCallbacks = this.onUserLeaveCallbacks.filter(cb => cb !== callback);
    };
  }

  onError(callback: (error: Error) => void) {
    this.onErrorCallbacks.push(callback);
    return () => {
      this.onErrorCallbacks = this.onErrorCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private generateColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  }
}

export default CollaborationClient;
