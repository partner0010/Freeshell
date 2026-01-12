/**
 * 플러그인 관리자
 */
import { Plugin, PluginManifest, PluginContext } from './types';

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private hooks: Map<string, Array<{ plugin: Plugin; handler: string; priority: number }>> = new Map();

  /**
   * 플러그인 등록
   */
  async register(manifest: PluginManifest): Promise<boolean> {
    try {
      if (this.plugins.has(manifest.id)) {
        console.warn(`플러그인 ${manifest.id}는 이미 등록되어 있습니다.`);
        return false;
      }

      const plugin: Plugin = {
        manifest,
        enabled: false,
        load: async () => {
          // 플러그인 로드 로직
          plugin.enabled = true;
        },
        unload: async () => {
          // 플러그인 언로드 로직
          plugin.enabled = false;
        },
        execute: async (hook: string, context: PluginContext) => {
          if (!plugin.enabled) {
            throw new Error(`플러그인 ${manifest.id}가 활성화되지 않았습니다.`);
          }
          // 플러그인 실행 로직
          return null;
        },
      };

      this.plugins.set(manifest.id, plugin);

      // 훅 등록
      manifest.hooks.forEach((hook) => {
        if (!this.hooks.has(hook.name)) {
          this.hooks.set(hook.name, []);
        }
        this.hooks.get(hook.name)!.push({
          plugin,
          handler: hook.handler,
          priority: hook.priority || 100,
        });
        // 우선순위로 정렬
        this.hooks.get(hook.name)!.sort((a, b) => a.priority - b.priority);
      });

      return true;
    } catch (error) {
      console.error(`플러그인 ${manifest.id} 등록 실패:`, error);
      return false;
    }
  }

  /**
   * 플러그인 활성화
   */
  async enable(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`플러그인 ${pluginId}를 찾을 수 없습니다.`);
      return false;
    }

    if (plugin.enabled) {
      return true;
    }

    try {
      await plugin.load();
      return true;
    } catch (error) {
      console.error(`플러그인 ${pluginId} 활성화 실패:`, error);
      return false;
    }
  }

  /**
   * 플러그인 비활성화
   */
  async disable(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.error(`플러그인 ${pluginId}를 찾을 수 없습니다.`);
      return false;
    }

    if (!plugin.enabled) {
      return true;
    }

    try {
      await plugin.unload();
      return true;
    } catch (error) {
      console.error(`플러그인 ${pluginId} 비활성화 실패:`, error);
      return false;
    }
  }

  /**
   * 플러그인 제거
   */
  async unregister(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    if (plugin.enabled) {
      await this.disable(pluginId);
    }

    // 훅에서 제거
    this.hooks.forEach((handlers, hookName) => {
      const filtered = handlers.filter(h => h.plugin.manifest.id !== pluginId);
      if (filtered.length === 0) {
        this.hooks.delete(hookName);
      } else {
        this.hooks.set(hookName, filtered);
      }
    });

    this.plugins.delete(pluginId);
    return true;
  }

  /**
   * 훅 실행
   */
  async executeHook(hookName: string, context: PluginContext): Promise<any[]> {
    const handlers = this.hooks.get(hookName);
    if (!handlers || handlers.length === 0) {
      return [];
    }

    const results: any[] = [];
    for (const { plugin, handler } of handlers) {
      if (!plugin.enabled) continue;

      try {
        const result = await plugin.execute(handler, context);
        results.push(result);
      } catch (error) {
        console.error(`플러그인 ${plugin.manifest.id}의 훅 ${hookName} 실행 실패:`, error);
      }
    }

    return results;
  }

  /**
   * 등록된 플러그인 목록 조회
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 플러그인 조회
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }
}

// 싱글톤 인스턴스
export const pluginManager = new PluginManager();
export default pluginManager;
