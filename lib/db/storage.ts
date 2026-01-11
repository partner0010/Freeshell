/**
 * 데이터베이스 스토리지 (메모리 기반)
 * TODO: 실제 DB로 마이그레이션 (Prisma, PostgreSQL 등)
 */

import type { User } from '@/lib/models/User';
import type { Project } from '@/lib/models/Project';
import type { AIStepResult } from '@/lib/models/AIStepResult';
import type { Payment } from '@/lib/models/Payment';

// 메모리 기반 스토리지 (개발용)
// 프로덕션에서는 실제 DB 사용 필요

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
    return newUser;
  },
  
  findById: (id: string): User | undefined => {
    return storage.users.get(id);
  },
  
  findByEmail: (email: string): User | undefined => {
    for (const user of storage.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  },
  
  update: (id: string, updates: Partial<User>): User | undefined => {
    const user = storage.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...updates };
    storage.users.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    return storage.users.delete(id);
  },
  
  findAll: (): User[] => {
    return Array.from(storage.users.values());
  },
};

// Project 관련 함수
export const projectStorage = {
  create: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Project => {
    const now = new Date();
    const newProject: Project = {
      ...project,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    storage.projects.set(newProject.id, newProject);
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
    if (!project) return undefined;
    
    const updated = { ...project, ...updates, updated_at: new Date() };
    storage.projects.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    // 관련 AI Step Results도 삭제
    const relatedResults = Array.from(storage.aiStepResults.values())
      .filter(r => r.project_id === id)
      .map(r => r.id);
    relatedResults.forEach(resultId => storage.aiStepResults.delete(resultId));
    
    return storage.projects.delete(id);
  },
  
  findAll: (): Project[] => {
    return Array.from(storage.projects.values());
  },
};

// AI Step Result 관련 함수
export const aiStepResultStorage = {
  create: (result: Omit<AIStepResult, 'id' | 'created_at' | 'updated_at'>): AIStepResult => {
    const now = new Date();
    const newResult: AIStepResult = {
      ...result,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    storage.aiStepResults.set(newResult.id, newResult);
    return newResult;
  },
  
  findById: (id: string): AIStepResult | undefined => {
    return storage.aiStepResults.get(id);
  },
  
  findByProjectId: (projectId: string): AIStepResult[] => {
    return Array.from(storage.aiStepResults.values())
      .filter(r => r.project_id === projectId)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  },
  
  findByProjectIdAndStepType: (projectId: string, stepType: AIStepResult['step_type']): AIStepResult | undefined => {
    const results = Array.from(storage.aiStepResults.values())
      .filter(r => r.project_id === projectId && r.step_type === stepType)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime()); // 최신순
    
    return results[0]; // 가장 최신 것 반환
  },
  
  update: (id: string, updates: Partial<AIStepResult>): AIStepResult | undefined => {
    const result = storage.aiStepResults.get(id);
    if (!result) return undefined;
    
    const updated = { ...result, ...updates, updated_at: new Date() };
    storage.aiStepResults.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    return storage.aiStepResults.delete(id);
  },
  
  findAll: (): AIStepResult[] => {
    return Array.from(storage.aiStepResults.values());
  },
};

// Payment 관련 함수
export const paymentStorage = {
  create: (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Payment => {
    const now = new Date();
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      created_at: now,
      updated_at: now,
    };
    storage.payments.set(newPayment.id, newPayment);
    return newPayment;
  },
  
  findById: (id: string): Payment | undefined => {
    return storage.payments.get(id);
  },
  
  findByUserId: (userId: string): Payment[] => {
    return Array.from(storage.payments.values())
      .filter(p => p.user_id === userId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  },
  
  findActiveByUserId: (userId: string): Payment | undefined => {
    const now = new Date();
    const payments = Array.from(storage.payments.values())
      .filter(p => 
        p.user_id === userId && 
        p.status === 'completed' &&
        p.period_start <= now &&
        p.period_end >= now
      )
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    return payments[0]; // 가장 최신 활성 결제
  },
  
  update: (id: string, updates: Partial<Payment>): Payment | undefined => {
    const payment = storage.payments.get(id);
    if (!payment) return undefined;
    
    const updated = { ...payment, ...updates, updated_at: new Date() };
    storage.payments.set(id, updated);
    return updated;
  },
  
  delete: (id: string): boolean => {
    return storage.payments.delete(id);
  },
  
  findAll: (): Payment[] => {
    return Array.from(storage.payments.values());
  },
};

// 전역 스토리지 접근 (디버깅용)
export function getStorageStats() {
  return {
    users: storage.users.size,
    projects: storage.projects.size,
    aiStepResults: storage.aiStepResults.size,
    payments: storage.payments.size,
  };
}

