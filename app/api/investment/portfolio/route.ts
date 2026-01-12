import { NextRequest, NextResponse } from 'next/server';
import { virtualTrading } from '@/lib/virtual-trading';

export const dynamic = 'force-dynamic';

/**
 * 포트폴리오 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';
    const accountId = `account-${userId}`;

    const portfolio = await virtualTrading.getPortfolio(accountId);

    if (!portfolio) {
      // 계좌가 없으면 생성
      const account = virtualTrading.getOrCreateAccount(userId, 100000);
      const newPortfolio = await virtualTrading.getPortfolio(account.id);
      return NextResponse.json({
        success: true,
        portfolio: newPortfolio,
      });
    }

    return NextResponse.json({
      success: true,
      portfolio,
    });
  } catch (error: any) {
    console.error('[Portfolio API] 오류:', error);
    return NextResponse.json(
      {
        error: '포트폴리오 조회 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

