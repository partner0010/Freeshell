/**
 * 커뮤니티 질문과 답변 API
 * 질문 목록 조회, 질문 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

// GET: 질문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const sortBy = searchParams.get('sortBy') || 'recent';
    const search = searchParams.get('search');

    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 60, 60000); // 1분에 60회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    // 실제로는 데이터베이스에서 조회
    // 현재는 예시 응답
    const questions = [
      {
        id: '1',
        title: 'AI 검색 API 키 설정 방법이 궁금합니다',
        content: 'AI 검색 기능을 사용하려면 API 키가 필요한가요?',
        author: '사용자1',
        tags: ['AI', '검색', 'API'],
        votes: 15,
        answers: 3,
        views: 124,
        hasAcceptedAnswer: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error: any) {
    console.error('QnA GET error:', error);
    return NextResponse.json(
      { error: '질문 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 질문 생성
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000); // 1분에 10회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { title, content, tags } = body;

    // 입력 검증
    const titleValidation = validateInput(title, {
      maxLength: 200,
      minLength: 5,
      required: true,
      allowHtml: false,
    });

    const contentValidation = validateInput(content, {
      maxLength: 5000,
      minLength: 10,
      required: true,
      allowHtml: false,
    });

    if (!titleValidation.valid || !contentValidation.valid) {
      return NextResponse.json(
        { error: titleValidation.error || contentValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // 태그 검증
    if (tags && Array.isArray(tags) && tags.length > 5) {
      return NextResponse.json(
        { error: '태그는 최대 5개까지 가능합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에 저장
    const newQuestion = {
      id: `qna-${Date.now()}`,
      title: titleValidation.sanitized,
      content: contentValidation.sanitized,
      tags: tags || [],
      author: '사용자', // 실제로는 세션에서 가져옴
      votes: 0,
      answers: 0,
      views: 0,
      hasAcceptedAnswer: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      question: newQuestion,
    });
  } catch (error: any) {
    console.error('QnA POST error:', error);
    return NextResponse.json(
      { error: '질문 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

