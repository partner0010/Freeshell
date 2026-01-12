/**
 * 데이터베이스 스토리지 (localStorage 백업 포함)
 * 메모리 기반 + localStorage 백업으로 데이터 영속성 향상
 */
'use client';

import type { User } from '@/lib/models/User';
import type { Project } from '@/lib/models/Project';
import type { AIStepResult } from '@/lib/models/AIStepResult';
import type { Payment } from '@/lib/models/Payment';

interface Storage {
  users: Map<string, User>;
  projects: Map<string, Project>;
  aiStepResults: Map<string, AIStepResult>;
  payments: Map<string, Payment>;
}

// 전역 스토리지 (서버 재시작 시 초기화됨)
const storage: Storage = {
  users: new Map(),
  projects: new Map(),
  aiStepResults: new Map(),
  payments: new Map(),
};

// localStorage 키
const STORAGE_KEYS = {
  users: 'freeshell_users',
  projects: 'freeshell_projects',
  aiStepResults: 'freeshell_ai_step_results',
  payments: 'freeshell_payments',
};

// localStorage에서 데이터 로드
function loadFromLocalStorage() {
  if (typeof window === 'undefined') return;

  try {
    // Users
    const usersData = localStorage.getItem(STORAGE_KEYS.users);
    if (usersData) {
      const users = JSON.parse(usersData);
      users.forEach((user: User) => {
        storage.users.set(user.id, user);
      });
    }

    // Projects
    const projectsData = localStorage.getItem(STORAGE_KEYS.projects);
    if (projectsData) {
      const projects = JSON.parse(projectsData);
      projects.forEach((project: Project) => {
        storage.projects.set(project.id, project);
      });
    }

    // AI Step Results
    const aiStepResultsData = localStorage.getItem(STORAGE_KEYS.aiStepResults);
    if (aiStepResultsData) {
      const aiStepResults = JSON.parse(aiStepResultsData);
      aiStepResults.forEach((result: AIStepResult) => {
        storage.aiStepResults.set(result.id, result);
      });
    }

    // Payments
    const paymentsData = localStorage.getItem(STORAGE_KEYS.payments);
    if (paymentsData) {
      const payments = JSON.parse(paymentsData);
      payments.forEach((payment: Payment) => {
        storage.payments.set(payment.id, payment);
      });
    }
  } catch (error) {
    console.error('[Storage] localStorage 로드 실패:', error);
  }
}

// localStorage에 데이터 저장
function saveToLocalStorage() {
  if (typeof window === 'undefined') return;

  try {
    // Users
    const users = Array.from(storage.users.values());
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));

    // Projects
    const projects = Array.from(storage.projects.values());
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));

    // AI Step Results
    const aiStepResults = Array.from(storage.aiStepResults.values());
    localStorage.setItem(STORAGE_KEYS.aiStepResults, JSON.stringify(aiStepResults));

    // Payments
    const payments = Array.from(storage.payments.values());
    localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(payments));
  } catch (error) {
    console.error('[Storage] localStorage 저장 실패:', error);
  }
}

// 초기 로드
if (typeof window !== 'undefined') {
  loadFromLocalStorage();
  
  // 주기적으로 저장 (30초마다)
  setInterval(() => {
    saveToLocalStorage();
  }, 30000);
}

// ID 생성기
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// User 관련 함수
export const userStorage = {
  create: (user: Omit<User, 'id' | 'created_at'>): User => {
    const newUser: User = {
      ...user,
      id: generateId(),
      created_at: new Date(),
    };
    storage.users.set(newUser.id, newUser);
    saveToLocalStorage();
    return newUser;
  },
  
  findById: (id: string): User | undefined => {
    return storage.users.get(id);
  },
  
  findByEmail: (email: string): User | undefined => {
    return Array.from(storage.users.values()).find(u => u.email === email);
  },
  
  update: (id: string, updates: Partial<User>): User | undefined => {
    const user = storage.users.get(id);
    if (user) {
      const updated = { ...user, ...updates };
      storage.users.set(id, updated);
      saveToLocalStorage();
      return updated;
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const deleted = storage.users.delete(id);
    if (deleted) {
      saveToLocalStorage();
    }
    return deleted;
  },
  
  findAll: (): User[] => {
    return Array.from(storage.users.values());
  },
};

// Project 관련 함수
export const projectStorage = {
  create: (project: Omit<Project, 'id' | 'created_at'>): Project => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      created_at: new Date(),
    };
    storage.projects.set(newProject.id, newProject);
    saveToLocalStorage();
    return newProject;
  },
  
  findById: (id: string): Project | undefined => {
    return storage.projects.get(id);
  },
  
  findByUserId: (userId: string): Project[] => {
    return Array.from(storage.projects.values()).filter(p => p.user_id === userId);
  },
  
  update: (id: string, updates: Partial<Project>): Project | undefined => {
    const project = storage.projects.get(id);
    if (project) {
      const updated = { ...project, ...updates };
      storage.projects.set(id, updated);
      saveToLocalStorage();
      return updated;
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const deleted = storage.projects.delete(id);
    if (deleted) {
      saveToLocalStorage();
    }
    return deleted;
  },
  
  findAll: (): Project[] => {
    return Array.from(storage.projects.values());
  },
};

// AI Step Result 관련 함수
export const aiStepResultStorage = {
  create: (result: Omit<AIStepResult, 'id' | 'created_at'>): AIStepResult => {
    const newResult: AIStepResult = {
      ...result,
      id: generateId(),
      created_at: new Date(),
    };
    storage.aiStepResults.set(newResult.id, newResult);
    saveToLocalStorage();
    return newResult;
  },
  
  findById: (id: string): AIStepResult | undefined => {
    return storage.aiStepResults.get(id);
  },
  
  findByProjectId: (projectId: string): AIStepResult[] => {
    return Array.from(storage.aiStepResults.values()).filter(r => r.project_id === projectId);
  },
  
  update: (id: string, updates: Partial<AIStepResult>): AIStepResult | undefined => {
    const result = storage.aiStepResults.get(id);
    if (result) {
      const updated = { ...result, ...updates };
      storage.aiStepResults.set(id, updated);
      saveToLocalStorage();
      return updated;
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const deleted = storage.aiStepResults.delete(id);
    if (deleted) {
      saveToLocalStorage();
    }
    return deleted;
  },
  
  findAll: (): AIStepResult[] => {
    return Array.from(storage.aiStepResults.values());
  },
};

// Payment 관련 함수
export const paymentStorage = {
  create: (payment: Omit<Payment, 'id' | 'created_at'>): Payment => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      created_at: new Date(),
    };
    storage.payments.set(newPayment.id, newPayment);
    saveToLocalStorage();
    return newPayment;
  },
  
  findById: (id: string): Payment | undefined => {
    return storage.payments.get(id);
  },
  
  findByUserId: (userId: string): Payment[] => {
    return Array.from(storage.payments.values()).filter(p => p.user_id === userId);
  },
  
  update: (id: string, updates: Partial<Payment>): Payment | undefined => {
    const payment = storage.payments.get(id);
    if (payment) {
      const updated = { ...payment, ...updates };
      storage.payments.set(id, updated);
      saveToLocalStorage();
      return updated;
    }
    return undefined;
  },
  
  delete: (id: string): boolean => {
    const deleted = storage.payments.delete(id);
    if (deleted) {
      saveToLocalStorage();
    }
    return deleted;
  },
  
  findAll: (): Payment[] => {
    return Array.from(storage.payments.values());
  },
};

// 수동 저장 함수 (필요시 호출)
export function saveStorage() {
  saveToLocalStorage();
}

// 수동 로드 함수 (필요시 호출)
export function loadStorage() {
  loadFromLocalStorage();
}
