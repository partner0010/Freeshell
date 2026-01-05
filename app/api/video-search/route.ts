import { NextRequest, NextResponse } from 'next/server';
import { searchPexelsVideos, searchPixabayVideos } from '@/lib/free-apis';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

/**
 * 무료 비디오 검색 API 통합
 * Pexels와 Pixabay를 통합하여 비디오 검색 결과 제공
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
    const { query, perPage = 15 } = body;

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

    // Pexels, Pixabay 비디오 검색을 병렬로 실행
    const [pexelsResults, pixabayResults] = await Promise.all([
      searchPexelsVideos(validation.sanitized, Math.min(perPage, 15)),
      searchPixabayVideos(validation.sanitized, Math.min(perPage, 15)),
    ]);

    const response = {
      query: validation.sanitized,
      results: {
        pexels: pexelsResults,
        pixabay: pixabayResults,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Video search error:', error);
    return NextResponse.json(
      { error: '비디오 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

