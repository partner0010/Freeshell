/**
 * 커뮤니티 댓글 API
 * 댓글 생성, 조회
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

// GET: 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const type = searchParams.get('type'); // 'forum' or 'qna'

    if (!postId || !type) {
      return NextResponse.json(
        { error: 'postId와 type 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 60, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    // 실제로는 데이터베이스에서 조회
    const comments = [
      {
        id: '1',
        postId,
        author: '사용자1',
        content: '좋은 정보 감사합니다!',
        likes: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error: any) {
    console.error('Comments GET error:', error);
    return NextResponse.json(
      { error: '댓글 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST: 댓글 생성
export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 20, 60000); // 1분에 20회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { postId, content, type } = body;

    // 입력 검증
    const contentValidation = validateInput(content, {
      maxLength: 2000,
      minLength: 1,
      required: true,
      allowHtml: false,
    });

    if (!contentValidation.valid || !postId || !type) {
      return NextResponse.json(
        { error: contentValidation.error || 'Invalid input' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에 저장
    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      author: '사용자', // 실제로는 세션에서 가져옴
      content: contentValidation.sanitized,
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error: any) {
    console.error('Comments POST error:', error);
    return NextResponse.json(
      { error: '댓글 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

