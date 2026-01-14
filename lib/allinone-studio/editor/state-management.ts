/**
 * STEP 4: 에디터 상태 관리 구조 (Undo/Redo 포함)
 * Scene 기반 콘텐츠 에디터 상태 관리
 */

/**
 * ============================================
 * 전체 상태 관리 구조
 * ============================================
 */

/**
 * 에디터 상태
 */
export interface EditorState {
  // 프로젝트 데이터
  project: {
    id: string;
    name: string;
    scenes: any[];  // Scene JSON 배열
    characters: any[];  // Character JSON 배열
  };
  
  // 편집 상태
  editing: {
    selectedSceneId: string | null;
    selectedCharacterId: string | null;
    selectedDialogueId: string | null;
    selectedElement: {
      type: 'scene' | 'character' | 'dialogue' | null;
      path: string;  // JSON 경로
    } | null;
  };
  
  // 타임라인 상태
  timeline: {
    currentTime: number;
    playhead: number;
    zoom: number;
    selectedTracks: string[];
  };
  
  // AI 편집 기록
  aiHistory: Array<{
    id: string;
    timestamp: number;
    type: 'suggestion' | 'auto-generate' | 'analyze';
    suggestionId?: string;
    changes: Array<{
      path: string;
      oldValue: any;
      newValue: any;
    }>;
  }>;
  
  // UI 상태
  ui: {
    leftSidebarOpen: boolean;
    rightSidebarOpen: boolean;
    bottomTimelineOpen: boolean;
    activeTab: string;
  };
}

/**
 * ============================================
 * 상태 스냅샷 전략
 * ============================================
 */

/**
 * 상태 스냅샷
 */
export interface StateSnapshot {
  id: string;
  timestamp: number;
  state: EditorState;
  action: string;  // 액션 이름 (예: "edit-dialogue", "add-scene")
  description?: string;
}

/**
 * 히스토리 스택
 */
export interface HistoryStack {
  past: StateSnapshot[];  // Undo 가능한 상태들
  present: StateSnapshot | null;  // 현재 상태
  future: StateSnapshot[];  // Redo 가능한 상태들
  maxSize: number;  // 최대 히스토리 크기
}

/**
 * 상태 스냅샷 생성
 */
export function createSnapshot(
  state: EditorState,
  action: string,
  description?: string
): StateSnapshot {
  return {
    id: `snapshot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    state: deepClone(state),
    action,
    description,
  };
}

/**
 * 깊은 복사 (상태 불변성 유지)
 */
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * ============================================
 * Undo / Redo 알고리즘
 * ============================================
 */

/**
 * 히스토리 관리자
 */
export class HistoryManager {
  private stack: HistoryStack;
  
  constructor(maxSize: number = 50) {
    this.stack = {
      past: [],
      present: null,
      future: [],
      maxSize,
    };
  }
  
  /**
   * 상태 저장
   */
  push(state: EditorState, action: string, description?: string): void {
    const snapshot = createSnapshot(state, action, description);
    
    // 현재 상태를 past에 추가
    if (this.stack.present) {
      this.stack.past.push(this.stack.present);
      
      // 최대 크기 제한
      if (this.stack.past.length > this.stack.maxSize) {
        this.stack.past.shift();
      }
    }
    
    // future 초기화 (새로운 액션 시)
    this.stack.future = [];
    
    // 현재 상태 업데이트
    this.stack.present = snapshot;
  }
  
  /**
   * Undo
   */
  undo(): EditorState | null {
    if (this.stack.past.length === 0) {
      return null;
    }
    
    // 현재 상태를 future에 추가
    if (this.stack.present) {
      this.stack.future.unshift(this.stack.present);
    }
    
    // past에서 이전 상태 가져오기
    const previous = this.stack.past.pop()!;
    this.stack.present = previous;
    
    return previous.state;
  }
  
  /**
   * Redo
   */
  redo(): EditorState | null {
    if (this.stack.future.length === 0) {
      return null;
    }
    
    // 현재 상태를 past에 추가
    if (this.stack.present) {
      this.stack.past.push(this.stack.present);
    }
    
    // future에서 다음 상태 가져오기
    const next = this.stack.future.shift()!;
    this.stack.present = next;
    
    return next.state;
  }
  
  /**
   * Undo 가능 여부
   */
  canUndo(): boolean {
    return this.stack.past.length > 0;
  }
  
  /**
   * Redo 가능 여부
   */
  canRedo(): boolean {
    return this.stack.future.length > 0;
  }
  
  /**
   * 히스토리 초기화
   */
  clear(): void {
    this.stack = {
      past: [],
      present: null,
      future: [],
      maxSize: this.stack.maxSize,
    };
  }
  
  /**
   * 현재 히스토리 상태
   */
  getHistory(): HistoryStack {
    return {
      past: [...this.stack.past],
      present: this.stack.present ? { ...this.stack.present } : null,
      future: [...this.stack.future],
      maxSize: this.stack.maxSize,
    };
  }
}

/**
 * ============================================
 * AI 수정 기록 분리
 * ============================================
 */

/**
 * AI 수정 기록 관리
 */
export class AIHistoryManager {
  private aiHistory: EditorState['aiHistory'] = [];
  private maxSize: number = 100;
  
  /**
   * AI 수정 기록 추가
   */
  addAIChange(
    type: 'suggestion' | 'auto-generate' | 'analyze',
    suggestionId: string | undefined,
    changes: Array<{ path: string; oldValue: any; newValue: any }>
  ): void {
    this.aiHistory.push({
      id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      type,
      suggestionId,
      changes,
    });
    
    // 최대 크기 제한
    if (this.aiHistory.length > this.maxSize) {
      this.aiHistory.shift();
    }
  }
  
  /**
   * AI 수정 취소
   */
  revertAIChange(aiHistoryId: string, currentState: EditorState): EditorState {
    const aiChange = this.aiHistory.find(h => h.id === aiHistoryId);
    if (!aiChange) {
      throw new Error(`AI history not found: ${aiHistoryId}`);
    }
    
    // 변경 사항 역순으로 적용
    const revertedState = deepClone(currentState);
    aiChange.changes.reverse().forEach(change => {
      applyChange(revertedState, change.path, change.oldValue);
    });
    
    return revertedState;
  }
  
  /**
   * AI 수정 기록 조회
   */
  getAIHistory(): EditorState['aiHistory'] {
    return [...this.aiHistory];
  }
  
  /**
   * AI 수정 기록 초기화
   */
  clear(): void {
    this.aiHistory = [];
  }
}

/**
 * ============================================
 * 충돌 방지
 * ============================================
 */

/**
 * 동시 편집 충돌 방지
 */
export class ConflictResolver {
  private lockedPaths: Set<string> = new Set();
  
  /**
   * 경로 잠금
   */
  lock(path: string): boolean {
    if (this.lockedPaths.has(path)) {
      return false;  // 이미 잠금됨
    }
    
    this.lockedPaths.add(path);
    return true;
  }
  
  /**
   * 경로 잠금 해제
   */
  unlock(path: string): void {
    this.lockedPaths.delete(path);
  }
  
  /**
   * 잠금 확인
   */
  isLocked(path: string): boolean {
    return this.lockedPaths.has(path);
  }
  
  /**
   * 모든 잠금 해제
   */
  unlockAll(): void {
    this.lockedPaths.clear();
  }
}

/**
 * ============================================
 * 대용량 Scene 대응
 * ============================================
 */

/**
 * 상태 최적화 전략
 */
export class StateOptimizer {
  /**
   * 부분 스냅샷 (전체 상태 대신 변경된 부분만)
   */
  createPartialSnapshot(
    state: EditorState,
    changedPaths: string[]
  ): Partial<StateSnapshot> {
    const partialState: Partial<EditorState> = {};
    
    changedPaths.forEach(path => {
      const value = getValueByPath(state, path);
      setValueByPath(partialState, path, value);
    });
    
    return {
      id: `partial-${Date.now()}`,
      timestamp: Date.now(),
      state: partialState as EditorState,
      action: 'partial-update',
    };
  }
  
  /**
   * 상태 압축 (오래된 히스토리)
   */
  compressHistory(history: HistoryStack, keepRecent: number = 10): HistoryStack {
    const compressed: HistoryStack = {
      past: history.past.slice(-keepRecent),
      present: history.present,
      future: history.future.slice(0, keepRecent),
      maxSize: history.maxSize,
    };
    
    return compressed;
  }
  
  /**
   * 메모리 사용량 최적화
   */
  optimizeMemory(state: EditorState): EditorState {
    // 큰 데이터는 참조로 유지, 작은 데이터만 복사
    const optimized = {
      ...state,
      project: {
        ...state.project,
        scenes: state.project.scenes,  // 참조 유지
        characters: state.project.characters,  // 참조 유지
      },
    };
    
    return optimized;
  }
}

/**
 * ============================================
 * 에디터 성능 최적화 전략
 * ============================================
 */

/**
 * 성능 최적화 설정
 */
export const PerformanceOptimization = {
  // 디바운스 설정
  debounce: {
    stateUpdate: 300,  // ms
    autoSave: 2000,  // ms
    aiAnalysis: 1000,  // ms
  },
  
  // 메모이제이션
  memoization: {
    sceneRender: true,
    characterRender: true,
    timelineCalculation: true,
  },
  
  // 가상화
  virtualization: {
    sceneList: true,
    timelineTracks: true,
    dialogueList: true,
  },
  
  // 지연 로딩
  lazyLoading: {
    characterModels: true,
    backgroundImages: true,
    audioFiles: true,
  },
};

// 헬퍼 함수들
function getValueByPath(obj: any, path: string): any {
  const parts = path.split('/').filter(p => p);
  return parts.reduce((current, part) => {
    if (current === undefined || current === null) return undefined;
    return current[part];
  }, obj);
}

function setValueByPath(obj: any, path: string, value: any): void {
  const parts = path.split('/').filter(p => p);
  const lastPart = parts.pop()!;
  const target = parts.reduce((current, part) => {
    if (!current[part]) {
      current[part] = isNaN(parseInt(parts[parts.indexOf(part) + 1] || '')) ? {} : [];
    }
    return current[part];
  }, obj);
  
  target[lastPart] = value;
}

function applyChange(obj: any, path: string, value: any): void {
  setValueByPath(obj, path, value);
}
