import { NextRequest, NextResponse } from 'next/server';
import { searchDuckDuckGo, searchWikipedia } from '@/lib/free-apis';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

/**
 * 무료 웹 검색 API 통합
 * DuckDuckGo와 Wikipedia를 통합하여 검색 결과 제공
 */
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 50, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { query } = body;

    // 입력 검증
    const validation = validateInput(query, {
      maxLength: 500,
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

    // DuckDuckGo와 Wikipedia 검색을 병렬로 실행
    const [duckDuckGoResults, wikipediaResults] = await Promise.all([
      searchDuckDuckGo(sanitizedQuery),
      searchWikipedia(sanitizedQuery),
    ]);

    const response = {
      query: sanitizedQuery,
      results: {
        web: duckDuckGoResults,
        wikipedia: wikipediaResults,
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Web search error:', error);
    return NextResponse.json(
      { error: '웹 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

