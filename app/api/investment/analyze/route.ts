import { NextRequest, NextResponse } from 'next/server';
import { investmentAPI } from '@/lib/investment-api';

/**
 * 투자 분석 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, type } = body;

    if (!symbol || !type) {
      return NextResponse.json(
        { error: 'symbol과 type이 필요합니다.' },
        { status: 400 }
      );
    }

    if (type !== 'stock' && type !== 'crypto') {
      return NextResponse.json(
        { error: 'type은 "stock" 또는 "crypto"여야 합니다.' },
        { status: 400 }
      );
    }

    const analysis = await investmentAPI.analyzeInvestment(symbol, type);

    if (!analysis) {
      return NextResponse.json(
        { error: '분석을 수행할 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('[Investment Analyze API] 오류:', error);
    return NextResponse.json(
      {
        error: '투자 분석 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

