/**
 * 플러그인 시스템 타입 정의
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  entry: string;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  settings?: PluginSettings;
}

export interface PluginPermission {
  type: 'read' | 'write' | 'execute' | 'network' | 'storage';
  resource?: string;
}

export interface PluginHook {
  name: string;
  handler: string;
  priority?: number;
}

export interface PluginSettings {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'select' | 'color';
    label: string;
    description?: string;
    default: any;
    options?: { label: string; value: any }[];
    validation?: (value: any) => boolean | string;
  };
}

export interface PluginContext {
  projectId?: string;
  files?: Array<{ name: string; type: string; content: string }>;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  api: PluginAPI;
}

export interface PluginAPI {
  readFile: (name: string) => Promise<string | null>;
  writeFile: (name: string, content: string) => Promise<boolean>;
  addComponent: (component: { name: string; html: string; css?: string; js?: string }) => Promise<boolean>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  fetch: (url: string, options?: RequestInit) => Promise<Response>;
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    remove: (key: string) => Promise<void>;
  };
}

export interface Plugin {
  manifest: PluginManifest;
  enabled: boolean;
  instance?: any;
  load: () => Promise<void>;
  unload: () => Promise<void>;
  execute: (hook: string, context: PluginContext) => Promise<any>;
}
