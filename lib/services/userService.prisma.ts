/**
 * User 서비스 (Prisma 버전)
 * 데이터베이스 마이그레이션 후 사용
 */
import { prisma } from '@/lib/db/prisma';
import type { User, CreateUserInput } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { PlanType } from '@prisma/client';

export class UserServicePrisma {
  /**
   * 사용자 생성 (비밀번호 해시)
   */
  async createUser(input: CreateUserInput): Promise<User> {
    // 이메일 중복 확인
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    
    if (existing) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // PlanType 변환
    const planType: PlanType = (input.plan || 'free').toUpperCase() as PlanType;

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        plan: planType,
      },
    });

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      plan: user.plan.toLowerCase() as 'free' | 'personal' | 'pro' | 'enterprise',
      created_at: user.createdAt,
    };
  }

  /**
   * 사용자 인증
   */
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      plan: user.plan.toLowerCase() as 'free' | 'personal' | 'pro' | 'enterprise',
      created_at: user.createdAt,
    };
  }

  /**
   * 사용자 조회
   */
  async getUserById(id: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return undefined;
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      plan: user.plan.toLowerCase() as 'free' | 'personal' | 'pro' | 'enterprise',
      created_at: user.createdAt,
    };
  }

  /**
   * 이메일로 사용자 조회
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return undefined;
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      plan: user.plan.toLowerCase() as 'free' | 'personal' | 'pro' | 'enterprise',
      created_at: user.createdAt,
    };
  }

  /**
   * 사용자 업데이트
   */
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const updateData: any = {};
    
    if (updates.email) updateData.email = updates.email;
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }
    if (updates.plan) {
      updateData.plan = updates.plan.toUpperCase() as PlanType;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      plan: user.plan.toLowerCase() as 'free' | 'personal' | 'pro' | 'enterprise',
      created_at: user.createdAt,
    };
  }

  /**
   * 사용자 삭제
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}

// 싱글톤 인스턴스
export const userServicePrisma = new UserServicePrisma();

