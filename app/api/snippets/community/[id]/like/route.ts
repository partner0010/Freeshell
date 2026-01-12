/**
 * 스니펫 좋아요 API
 */
import { NextRequest, NextResponse } from 'next/server';

// 실제로는 데이터베이스 사용
let snippetLikes: Map<string, Set<string>> = new Map();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const snippetId = params.id;
    const body = await request.json();
    const userId = body.userId || 'anonymous';

    if (!snippetLikes.has(snippetId)) {
      snippetLikes.set(snippetId, new Set());
    }

    const likes = snippetLikes.get(snippetId)!;
    if (likes.has(userId)) {
      likes.delete(userId);
    } else {
      likes.add(userId);
    }

    return NextResponse.json({
      success: true,
      likes: likes.size,
    });
  } catch (error: any) {
    console.error('[Snippet Like API] 오류:', error);
    return NextResponse.json(
      { error: '좋아요 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
