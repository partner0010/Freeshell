/**
 * 커뮤니티 게시판 API
 * 게시글 목록 조회, 게시글 생성
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

// GET: 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
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
    const posts = [
      {
        id: '1',
        title: '새로운 AI 기능 업데이트 안내',
        content: '최신 AI 기능이 추가되었습니다.',
        author: '관리자',
        category: 'notice',
        likes: 45,
        comments: 12,
        views: 256,
        isPinned: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      posts,
      total: posts.length,
    });
  } catch (error: any) {
    console.error('Forum GET error:', error);
    return NextResponse.json(
      { error: '게시글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 게시글 생성
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
    const { title, content, category } = body;

    // 입력 검증
    const titleValidation = validateInput(title, {
      maxLength: 200,
      minLength: 5,
      required: true,
      allowHtml: false,
    });

    const contentValidation = validateInput(content, {
      maxLength: 10000,
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

    // 카테고리 검증
    const validCategories = ['notice', 'idea', 'bug', 'guide', 'project', 'free'];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        { error: '올바르지 않은 카테고리입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에 저장
    const newPost = {
      id: `post-${Date.now()}`,
      title: titleValidation.sanitized,
      content: contentValidation.sanitized,
      category: category || 'free',
      author: '사용자', // 실제로는 세션에서 가져옴
      likes: 0,
      comments: 0,
      views: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      post: newPost,
    });
  } catch (error: any) {
    console.error('Forum POST error:', error);
    return NextResponse.json(
      { error: '게시글 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

