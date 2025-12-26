/**
 * 실시간 이벤트 스트림 (Server-Sent Events)
 */

export interface RealtimeEvent {
  type: 'workflow' | 'schedule' | 'task' | 'notification';
  action: 'created' | 'updated' | 'deleted' | 'executed' | 'completed' | 'failed';
  data: any;
  timestamp: Date;
}

class EventStreamManager {
  private clients: Map<string, ReadableStreamDefaultController> = new Map();
  private eventQueue: RealtimeEvent[] = [];

  /**
   * 클라이언트 연결
   */
  addClient(clientId: string, controller: ReadableStreamDefaultController) {
    this.clients.set(clientId, controller);
    
    // 큐에 있는 이벤트 전송
    this.eventQueue.forEach(event => {
      this.sendToClient(clientId, event);
    });
    this.eventQueue = [];
  }

  /**
   * 클라이언트 연결 해제
   */
  removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  /**
   * 이벤트 브로드캐스트
   */
  broadcast(event: RealtimeEvent) {
    if (this.clients.size === 0) {
      // 클라이언트가 없으면 큐에 저장
      this.eventQueue.push(event);
      if (this.eventQueue.length > 100) {
        this.eventQueue.shift(); // 오래된 이벤트 제거
      }
      return;
    }

    this.clients.forEach((controller, clientId) => {
      this.sendToClient(clientId, event);
    });
  }

  /**
   * 특정 클라이언트에 이벤트 전송
   */
  private sendToClient(clientId: string, event: RealtimeEvent) {
    const controller = this.clients.get(clientId);
    if (!controller) return;

    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      console.error('이벤트 전송 실패:', error);
      this.removeClient(clientId);
    }
  }

  /**
   * 워크플로우 이벤트
   */
  workflowEvent(action: RealtimeEvent['action'], data: any) {
    this.broadcast({
      type: 'workflow',
      action,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * 스케줄 이벤트
   */
  scheduleEvent(action: RealtimeEvent['action'], data: any) {
    this.broadcast({
      type: 'schedule',
      action,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * 작업 이벤트
   */
  taskEvent(action: RealtimeEvent['action'], data: any) {
    this.broadcast({
      type: 'task',
      action,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * 알림 이벤트
   */
  notificationEvent(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.broadcast({
      type: 'notification',
      action: 'created',
      data: { message, type },
      timestamp: new Date(),
    });
  }
}

export const eventStreamManager = new EventStreamManager();

