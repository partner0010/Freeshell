/**
 * User 모델
 */
export interface User {
  id: string;
  email: string;
  password: string; // 해시된 비밀번호
  plan: 'free' | 'personal' | 'pro' | 'enterprise';
  created_at: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  plan?: 'free' | 'personal' | 'pro' | 'enterprise';
}

