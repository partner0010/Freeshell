import { NextRequest, NextResponse } from 'next/server';
import { searchPexelsImages, searchUnsplashImages, searchPixabayImages } from '@/lib/free-apis';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

/**
 * 무료 이미지 검색 API 통합
 * Pexels와 Unsplash를 통합하여 이미지 검색 결과 제공
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 30, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { query, perPage = 20 } = body;

    // 입력 검증
    const validation = validateInput(query, {
      maxLength: 200,
      minLength: 1,
      required: true,
      allowHtml: false,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    const sanitizedQuery = validation.sanitized || query || '';

    // Pexels, Unsplash, Pixabay 검색을 병렬로 실행
    const [pexelsResults, unsplashResults, pixabayResults] = await Promise.all([
      searchPexelsImages(sanitizedQuery, Math.min(perPage, 20)),
      searchUnsplashImages(sanitizedQuery, Math.min(perPage, 20)),
      searchPixabayImages(sanitizedQuery, Math.min(perPage, 20)),
    ]);

    const response = {
      query: sanitizedQuery,
      results: {
        pexels: pexelsResults,
        unsplash: unsplashResults,
        pixabay: pixabayResults,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: '이미지 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

