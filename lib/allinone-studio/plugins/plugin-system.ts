/**
 * STEP 3: 플러그인 구조 (기능 마켓화)
 * 확장 가능한 플러그인 시스템
 */

/**
 * ============================================
 * 플러그인 메타데이터 스펙
 * ============================================
 */

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: 'voice-engine' | 'style-pack' | 'render-option' | 'ai-model' | 'special-effect' | 'other';
  icon?: string;
  thumbnail?: string;
  
  // 의존성
  dependencies?: Array<{
    pluginId: string;
    version: string;
  }>;
  
  // 호환성
  compatibility: {
    minVersion: string;
    maxVersion?: string;
    platforms: ('web' | 'desktop' | 'mobile')[];
  };
  
  // 권한
  permissions: Array<{
    type: 'read-scene' | 'write-scene' | 'access-api' | 'file-system' | 'network';
    scope: 'project' | 'global';
    description: string;
  }>;
  
  // 설정
  settings?: Array<{
    key: string;
    type: 'string' | 'number' | 'boolean' | 'select';
    label: string;
    defaultValue: any;
    options?: any[];
  }>;
  
  // 가격 정보
  pricing?: {
    type: 'free' | 'one-time' | 'subscription';
    price?: number;
    currency?: string;
    trialDays?: number;
  };
  
  // 통계
  stats?: {
    downloads: number;
    rating: number;
    reviews: number;
  };
}

/**
 * ============================================
 * 플러그인 인터페이스
 * ============================================
 */

export interface Plugin {
  metadata: PluginMetadata;
  
  // 초기화
  initialize(context: PluginContext): Promise<void>;
  
  // 활성화
  activate(): Promise<void>;
  
  // 비활성화
  deactivate(): Promise<void>;
  
  // 정리
  cleanup(): Promise<void>;
  
  // 훅 등록
  registerHooks?(hooks: PluginHooks): void;
  
  // API 제공
  getAPI?(): PluginAPI;
}

/**
 * 플러그인 컨텍스트
 */
export interface PluginContext {
  project: {
    id: string;
    scenes: any[];
    characters: any[];
  };
  editor: {
    getCurrentScene(): any;
    updateScene(sceneId: string, updates: any): void;
    addScene(scene: any): void;
  };
  api: {
    callAI(prompt: string): Promise<string>;
    generateAsset(type: string, prompt: string): Promise<string>;
  };
  storage: {
    get(key: string): any;
    set(key: string, value: any): void;
  };
}

/**
 * 플러그인 훅
 */
export interface PluginHooks {
  'scene:before-update': (scene: any) => Promise<any> | any;
  'scene:after-update': (scene: any) => void;
  'dialogue:before-add': (dialogue: any) => Promise<any> | any;
  'render:before-start': (settings: any) => Promise<any> | any;
  'render:after-complete': (output: any) => void;
}

/**
 * 플러그인 API
 */
export interface PluginAPI {
  [key: string]: (...args: any[]) => any;
}

/**
 * ============================================
 * 플러그인 로딩 흐름
 * ============================================
 */

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private hooks: Map<string, Array<(...args: any[]) => any>> = new Map();
  
  /**
   * 플러그인 등록
   */
  async registerPlugin(plugin: Plugin): Promise<{ success: boolean; error?: string }> {
    // 1. 메타데이터 검증
    const validation = validatePluginMetadata(plugin.metadata);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    // 2. 의존성 확인
    if (plugin.metadata.dependencies) {
      const missing = plugin.metadata.dependencies.filter(dep => 
        !this.plugins.has(dep.pluginId)
      );
      if (missing.length > 0) {
        return {
          success: false,
          error: `Missing dependencies: ${missing.map(d => d.pluginId).join(', ')}`,
        };
      }
    }
    
    // 3. 충돌 확인
    const conflicts = this.checkConflicts(plugin);
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Plugin conflicts: ${conflicts.join(', ')}`,
      };
    }
    
    // 4. 플러그인 등록
    this.plugins.set(plugin.metadata.id, plugin);
    
    // 5. 초기화
    try {
      await plugin.initialize(this.createContext());
    } catch (error: any) {
      this.plugins.delete(plugin.metadata.id);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
  
  /**
   * 플러그인 활성화
   */
  async activatePlugin(pluginId: string): Promise<{ success: boolean; error?: string }> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: 'Plugin not found' };
    }
    
    if (this.activePlugins.has(pluginId)) {
      return { success: false, error: 'Plugin already active' };
    }
    
    try {
      await plugin.activate();
      
      // 훅 등록
      if (plugin.registerHooks) {
        plugin.registerHooks(this.createHookRegistry());
      }
      
      this.activePlugins.add(pluginId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 플러그인 비활성화
   */
  async deactivatePlugin(pluginId: string): Promise<{ success: boolean; error?: string }> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: 'Plugin not found' };
    }
    
    if (!this.activePlugins.has(pluginId)) {
      return { success: false, error: 'Plugin not active' };
    }
    
    try {
      await plugin.deactivate();
      
      // 훅 제거
      this.removeHooks(pluginId);
      
      this.activePlugins.delete(pluginId);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 훅 실행
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    const handlers = this.hooks.get(hookName) || [];
    const results = await Promise.all(handlers.map(handler => handler(...args)));
    return results;
  }
  
  /**
   * 충돌 확인
   */
  private checkConflicts(plugin: Plugin): string[] {
    const conflicts: string[] = [];
    
    // 같은 카테고리의 활성 플러그인 확인
    const sameCategory = Array.from(this.activePlugins)
      .map(id => this.plugins.get(id))
      .filter(p => p && p.metadata.category === plugin.metadata.category);
    
    if (sameCategory.length > 0) {
      // 카테고리별 충돌 규칙
      const conflictCategories: string[] = ['voice-engine', 'render-option'];
      if (conflictCategories.includes(plugin.metadata.category)) {
        conflicts.push(`Category conflict: ${plugin.metadata.category}`);
      }
    }
    
    return conflicts;
  }
  
  /**
   * 훅 레지스트리 생성
   */
  private createHookRegistry(): PluginHooks {
    return {
      'scene:before-update': async (scene: any) => {
        const results = await this.executeHook('scene:before-update', scene);
        return results[0] || scene;
      },
      'scene:after-update': (scene: any) => {
        this.executeHook('scene:after-update', scene);
      },
      'dialogue:before-add': async (dialogue: any) => {
        const results = await this.executeHook('dialogue:before-add', dialogue);
        return results[0] || dialogue;
      },
      'render:before-start': async (settings: any) => {
        const results = await this.executeHook('render:before-start', settings);
        return results[0] || settings;
      },
      'render:after-complete': (output: any) => {
        this.executeHook('render:after-complete', output);
      },
    };
  }
  
  /**
   * 훅 제거
   */
  private removeHooks(pluginId: string): void {
    // 플러그인 ID로 훅 제거 (구현 필요)
    this.hooks.forEach((handlers, hookName) => {
      // 플러그인 ID 기반 필터링 (실제 구현 필요)
    });
  }
  
  /**
   * 컨텍스트 생성
   */
  private createContext(): PluginContext {
    // 실제 구현 필요
    return {} as PluginContext;
  }
}

/**
 * ============================================
 * 에디터 연동 방식
 * ============================================
 */

export interface EditorPluginIntegration {
  // 플러그인 목록 조회
  getPlugins(filter?: {
    category?: string;
    active?: boolean;
    search?: string;
  }): Plugin[];
  
  // 플러그인 설치
  installPlugin(pluginId: string): Promise<{ success: boolean; error?: string }>;
  
  // 플러그인 활성화/비활성화
  togglePlugin(pluginId: string, active: boolean): Promise<{ success: boolean; error?: string }>;
  
  // 플러그인 설정
  configurePlugin(pluginId: string, settings: Record<string, any>): void;
  
  // 플러그인 API 호출
  callPluginAPI(pluginId: string, method: string, ...args: any[]): Promise<any>;
}

/**
 * ============================================
 * 마켓 등록 구조
 * ============================================
 */

export interface PluginMarketplace {
  // 플러그인 목록
  plugins: PluginMetadata[];
  
  // 카테고리별 필터
  categories: Record<string, PluginMetadata[]>;
  
  // 검색
  search(query: string): PluginMetadata[];
  
  // 플러그인 다운로드
  download(pluginId: string): Promise<Plugin>;
  
  // 플러그인 업데이트 확인
  checkUpdates(installedPlugins: PluginMetadata[]): Array<{
    pluginId: string;
    currentVersion: string;
    latestVersion: string;
  }>;
}

/**
 * ============================================
 * 보안 고려 사항
 * ============================================
 */

export const PluginSecurity = {
  // 권한 검증
  validatePermissions: (plugin: Plugin, action: string): boolean => {
    const requiredPermission = getRequiredPermission(action);
    return plugin.metadata.permissions.some(p => 
      p.type === requiredPermission
    );
  },
  
  // 샌드박스 실행
  sandboxExecution: {
    enabled: true,
    restrictions: [
      'no-file-system-write',
      'no-network-external',
      'no-eval',
      'no-dynamic-import',
    ],
  },
  
  // 코드 서명
  codeSigning: {
    required: true,
    verification: 'verify-plugin-signature',
  },
};

function getRequiredPermission(action: string): string {
  const permissionMap: Record<string, string> = {
    'update-scene': 'write-scene',
    'read-scene': 'read-scene',
    'call-api': 'access-api',
  };
  return permissionMap[action] || 'read-scene';
}

function validatePluginMetadata(metadata: PluginMetadata): { valid: boolean; error?: string } {
  if (!metadata.id || !metadata.name || !metadata.version) {
    return { valid: false, error: 'Missing required fields' };
  }
  
  if (!metadata.category) {
    return { valid: false, error: 'Category is required' };
  }
  
  return { valid: true };
}
