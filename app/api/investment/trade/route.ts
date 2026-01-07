import { NextRequest, NextResponse } from 'next/server';
import { virtualTrading } from '@/lib/virtual-trading';

/**
 * 거래 실행 API (구매/판매)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId = 'default', action, symbol, name, type, quantity } = body;

    if (!action || !symbol || !type || !quantity) {
      return NextResponse.json(
        { error: 'action, symbol, type, quantity가 필요합니다.' },
        { status: 400 }
      );
    }

    if (action !== 'buy' && action !== 'sell') {
      return NextResponse.json(
        { error: 'action은 "buy" 또는 "sell"이어야 합니다.' },
        { status: 400 }
      );
    }

    if (type !== 'stock' && type !== 'crypto') {
      return NextResponse.json(
        { error: 'type은 "stock" 또는 "crypto"여야 합니다.' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'quantity는 0보다 커야 합니다.' },
        { status: 400 }
      );
    }

    const accountId = `account-${userId}`;
    
    // 계좌가 없으면 생성
    if (!virtualTrading.getOrCreateAccount(userId, 100000)) {
      return NextResponse.json(
        { error: '계좌를 생성할 수 없습니다.' },
        { status: 500 }
      );
    }

    let result;
    if (action === 'buy') {
      if (!name) {
        return NextResponse.json(
          { error: '구매 시 name이 필요합니다.' },
          { status: 400 }
        );
      }
      result = await virtualTrading.buy(accountId, symbol, name, type, quantity);
    } else {
      result = await virtualTrading.sell(accountId, symbol, type, quantity);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '거래 실패' },
        { status: 400 }
      );
    }

    // 업데이트된 포트폴리오 가져오기
    const portfolio = await virtualTrading.getPortfolio(accountId);

    return NextResponse.json({
      success: true,
      trade: result.trade,
      portfolio,
      message: action === 'buy' ? '구매가 완료되었습니다.' : '판매가 완료되었습니다.',
    });
  } catch (error: any) {
    console.error('[Trade API] 오류:', error);
    return NextResponse.json(
      {
        error: '거래 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

