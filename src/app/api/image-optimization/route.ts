/**
 * 이미지 최적화 API
 * Next.js Image Optimization API 프록시
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  const width = searchParams.get('w');
  const height = searchParams.get('h');
  const quality = searchParams.get('q') || '75';
  const format = searchParams.get('f') || 'webp';

  if (!imageUrl) {
    return NextResponse.json(
      { error: '이미지 URL이 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    // Next.js Image Optimization API 사용
    // 실제로는 Next.js가 자동으로 처리하므로, 여기서는 리다이렉트만 수행
    const optimizedUrl = new URL(imageUrl, request.url);
    
    if (width) optimizedUrl.searchParams.set('w', width);
    if (height) optimizedUrl.searchParams.set('h', height);
    optimizedUrl.searchParams.set('q', quality);
    optimizedUrl.searchParams.set('f', format);

    // Next.js Image Optimization으로 리다이렉트
    return NextResponse.redirect(optimizedUrl);
  } catch (error) {
    console.error('이미지 최적화 오류:', error);
    return NextResponse.json(
      { error: '이미지 최적화에 실패했습니다.' },
      { status: 500 }
    );
  }
}

