/**
 * 관리자 도구 접근 확인 미들웨어
 * 각 관리자 기능 페이지에서 플랜 제한 확인
 */
import { planLimitService } from '@/lib/services/planLimitService';
import type { NextRequest } from 'next/server';

export interface AdminAccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiresUpgrade?: boolean;
  upgradePlan?: 'personal' | 'pro' | 'enterprise';
  remainingUsage?: number;
  maxUsage?: number;
}

/**
 * 관리자 도구 접근 확인
 */
export function checkAdminAccess(
  userId: string,
  tool: 'electronicSignature' | 'systemDiagnostics' | 'debugTools' | 'siteCheck' | 'remoteSolution'
): AdminAccessCheckResult {
  const result = planLimitService.checkAdminToolAccess(userId, tool);
  // upgradePlan이 'free'가 아닌지 확인
  const upgradePlan = result.upgradePlan && result.upgradePlan !== 'free' 
    ? result.upgradePlan as 'personal' | 'pro' | 'enterprise'
    : undefined;
  return {
    ...result,
    upgradePlan,
  };
}

/**
 * API 라우트에서 사용하는 접근 확인 헬퍼
 */
export function getAdminAccessCheckResult(request: NextRequest): {
  userId?: string;
  tool?: string;
  result?: AdminAccessCheckResult;
  error?: string;
} {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('user_id') || request.headers.get('x-user-id');
  const tool = searchParams.get('tool') as 'electronicSignature' | 'systemDiagnostics' | 'debugTools' | 'siteCheck' | 'remoteSolution' | null;

  if (!userId) {
    return { error: '사용자 ID가 필요합니다.' };
  }

  if (!tool) {
    return { userId, error: '도구 이름이 필요합니다.' };
  }

  const result = checkAdminAccess(userId, tool);

  return {
    userId,
    tool,
    result,
  };
}

