/**
 * 헬스체크 API
 * 네트워크 연결 확인용
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
  });
}
