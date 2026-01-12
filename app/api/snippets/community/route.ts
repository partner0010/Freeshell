/**
 * 커뮤니티 스니펫 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

interface CommunitySnippet {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  code: string;
  language: string;
  category: string;
  tags: string[];
  rating: number;
  likes: number;
  downloads: number;
  createdAt: string;
}

let communitySnippets: CommunitySnippet[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';

    let filtered = [...communitySnippets];

    if (category !== 'all') {
      filtered = filtered.filter(s => s.category === category);
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 인기순 정렬
    filtered.sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads));

    return NextResponse.json({
      success: true,
      snippets: filtered.slice(0, 50),
      total: filtered.length,
    });
  } catch (error: any) {
    console.error('[Community Snippets API] 오류:', error);
    return NextResponse.json(
      { error: '스니펫을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await rateLimitCheck(request, 20, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { userId, userName, title, description, code, language, category, tags } = body;

    const titleValidation = validateInput(title, { maxLength: 100, required: true });
    if (!titleValidation.valid) {
      return NextResponse.json(
        { error: titleValidation.error },
        { status: 400 }
      );
    }

    const newSnippet: CommunitySnippet = {
      id: `snippet_${Date.now()}`,
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      title: titleValidation.sanitized || title,
      description: description || '',
      code: code || '',
      language: language || 'javascript',
      category: category || 'utility',
      tags: tags || [],
      rating: 0,
      likes: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
    };

    communitySnippets.unshift(newSnippet);
    if (communitySnippets.length > 1000) {
      communitySnippets = communitySnippets.slice(0, 1000);
    }

    return NextResponse.json({
      success: true,
      snippet: {
        id: newSnippet.id,
        title: newSnippet.title,
      },
    });
  } catch (error: any) {
    console.error('[Community Snippets API] POST 오류:', error);
    return NextResponse.json(
      { error: '스니펫 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
