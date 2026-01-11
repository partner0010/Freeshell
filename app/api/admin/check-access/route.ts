import { NextRequest, NextResponse } from 'next/server';
import { planLimitService } from '@/lib/services/planLimitService';

/**
 * 관리자 도구 접근 확인 API
 * GET /api/admin/check-access?tool=xxx&user_id=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tool = searchParams.get('tool') as 'electronicSignature' | 'systemDiagnostics' | 'debugTools' | 'siteCheck' | 'remoteSolution';
    const userId = searchParams.get('user_id');

    if (!tool || !userId) {
      return NextResponse.json(
        { error: 'tool와 user_id는 필수입니다.' },
        { status: 400 }
      );
    }

    const accessCheck = planLimitService.checkAdminToolAccess(userId, tool);

    return NextResponse.json({
      success: true,
      allowed: accessCheck.allowed,
      reason: accessCheck.reason,
      requiresUpgrade: accessCheck.requiresUpgrade,
      upgradePlan: accessCheck.upgradePlan,
      remainingUsage: accessCheck.remainingUsage,
      maxUsage: accessCheck.maxUsage,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Admin Access Check API] 오류:', error);
    return NextResponse.json(
      {
        error: '접근 확인 중 오류가 발생했습니다.',
        message: error.message || '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

