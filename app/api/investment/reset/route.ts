import { NextRequest, NextResponse } from 'next/server';
import { virtualTrading } from '@/lib/virtual-trading';

/**
 * 계좌 초기화 API (테스트용)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default', initialBalance = 100000 } = body;

    const accountId = `account-${userId}`;
    const account = virtualTrading.resetAccount(accountId, initialBalance);

    const portfolio = await virtualTrading.getPortfolio(account.id);

    return NextResponse.json({
      success: true,
      message: '계좌가 초기화되었습니다.',
      portfolio,
    });
  } catch (error: any) {
    console.error('[Reset API] 오류:', error);
    return NextResponse.json(
      {
        error: '계좌 초기화 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

