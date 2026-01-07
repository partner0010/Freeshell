import { NextRequest, NextResponse } from 'next/server';
import { investmentAPI } from '@/lib/investment-api';

/**
 * HOT 주식 종목 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const hotStocks = await investmentAPI.getHotStocks(limit);

    return NextResponse.json({
      success: true,
      stocks: hotStocks,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('[Hot Stocks API] 오류:', error);
    return NextResponse.json(
      {
        error: 'HOT 주식 종목 조회 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

