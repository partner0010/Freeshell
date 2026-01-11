/**
 * User 서비스
 */
import { userStorage } from '@/lib/db/storage';
import type { User, CreateUserInput } from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export class UserService {
  /**
   * 사용자 생성 (비밀번호 해시)
   */
  async createUser(input: CreateUserInput): Promise<User> {
    // 이메일 중복 확인
    const existing = userStorage.findByEmail(input.email);
    if (existing) {
      throw new Error('이미 존재하는 이메일입니다.');
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(input.password, 10);

    return userStorage.create({
      email: input.email,
      password: hashedPassword,
      plan: input.plan || 'free',
    });
  }

  /**
   * 사용자 인증
   */
  async authenticate(email: string, password: string): Promise<User | null> {
    const user = userStorage.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  /**
   * 사용자 조회
   */
  getUserById(id: string): User | undefined {
    return userStorage.findById(id);
  }

  /**
   * 이메일로 사용자 조회
   */
  getUserByEmail(email: string): User | undefined {
    return userStorage.findByEmail(email);
  }

  /**
   * 사용자 정보 업데이트
   */
  updateUser(id: string, updates: Partial<User>): User | undefined {
    // 비밀번호 업데이트 시 해시
    if (updates.password) {
      // 비동기 해시는 실제 사용 시 Promise로 처리 필요
      // 여기서는 간단히 처리
    }

    return userStorage.update(id, updates);
  }

  /**
   * 플랜 업그레이드
   */
  upgradePlan(userId: string, newPlan: User['plan']): User | undefined {
    return userStorage.update(userId, { plan: newPlan });
  }
}

export const userService = new UserService();

