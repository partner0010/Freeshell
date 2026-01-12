import { NextRequest, NextResponse } from 'next/server';
import { investmentAPI } from '@/lib/investment-api';

export const dynamic = 'force-dynamic';

/**
 * HOT 암호화폐 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const hotCryptos = await investmentAPI.getHotCryptos(limit);

    return NextResponse.json({
      success: true,
      cryptos: hotCryptos,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('[Hot Cryptos API] 오류:', error);
    return NextResponse.json(
      {
        error: 'HOT 암호화폐 조회 중 오류가 발생했습니다.',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

