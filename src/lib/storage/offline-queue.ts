/**
 * 오프라인 큐 시스템
 * IndexedDB 기반 오프라인 작업 저장 및 동기화
 */

interface QueuedAction {
  id: string;
  type: 'api' | 'create' | 'update' | 'delete';
  endpoint: string;
  method: string;
  payload: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
}

class OfflineQueue {
  private dbName = 'freeshell-offline-queue';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  /**
   * 데이터베이스 초기화
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('queue')) {
          const store = db.createObjectStore('queue', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  /**
   * 작업을 큐에 추가
   */
  async enqueue(action: Omit<QueuedAction, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const queuedAction: QueuedAction = {
      id: `action-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
      ...action,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.add(queuedAction);

      request.onsuccess = () => resolve(queuedAction.id);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 큐에서 작업 가져오기
   */
  async dequeue(): Promise<QueuedAction | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const index = store.index('status');
      const request = index.openCursor(IDBKeyRange.only('pending'));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const action = cursor.value;
          action.status = 'processing';
          cursor.update(action);
          resolve(action);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 모든 대기 중인 작업 가져오기
   */
  async getPendingActions(): Promise<QueuedAction[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readonly');
      const store = transaction.objectStore('queue');
      const index = store.index('status');
      const request = index.getAll(IDBKeyRange.only('pending'));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 작업 상태 업데이트
   */
  async updateStatus(id: string, status: QueuedAction['status']): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const action = getRequest.result;
        if (action) {
          action.status = status;
          if (status === 'failed') {
            action.retries += 1;
          }
          const updateRequest = store.put(action);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * 작업 삭제
   */
  async remove(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 오래된 완료된 작업 정리
   */
  async cleanup(olderThan: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['queue'], 'readwrite');
      const store = transaction.objectStore('queue');
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const action = cursor.value;
          const age = Date.now() - action.timestamp;
          
          if (action.status === 'completed' && age > olderThan) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// 싱글톤 인스턴스
export const offlineQueue = typeof window !== 'undefined' ? new OfflineQueue() : null;

/**
 * 오프라인 큐 동기화
 */
export async function syncOfflineQueue(): Promise<void> {
  if (!offlineQueue || !navigator.onLine) {
    return;
  }

  try {
    const pendingActions = await offlineQueue.getPendingActions();

    for (const action of pendingActions) {
      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.payload),
        });

        if (response.ok) {
          await offlineQueue.updateStatus(action.id, 'completed');
          // 완료 후 일정 시간 후 삭제
          setTimeout(() => {
            offlineQueue?.remove(action.id);
          }, 60000); // 1분 후
        } else {
          if (action.retries >= 3) {
            await offlineQueue.updateStatus(action.id, 'failed');
          } else {
            await offlineQueue.updateStatus(action.id, 'pending');
          }
        }
      } catch (error) {
        if (action.retries >= 3) {
          await offlineQueue.updateStatus(action.id, 'failed');
        } else {
          await offlineQueue.updateStatus(action.id, 'pending');
        }
      }
    }
  } catch (error) {
    console.error('오프라인 큐 동기화 실패:', error);
  }
}

