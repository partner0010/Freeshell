/**
 * 템플릿 마켓플레이스 API
 * 사용자 간 템플릿 공유
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

interface MarketplaceTemplate {
  id: string;
  userId: string;
  userName: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  files: Array<{ name: string; type: string; content: string }>;
  preview?: string;
  rating: number;
  reviews: Array<{
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    timestamp: string;
  }>;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

// 실제로는 데이터베이스 사용
let marketplaceTemplates: MarketplaceTemplate[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let filtered = [...marketplaceTemplates];

    // 카테고리 필터
    if (category && category !== 'all') {
      filtered = filtered.filter(t => t.category === category);
    }

    // 검색 필터
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sort) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    // 페이지네이션
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      templates: paginated.map(t => ({
        id: t.id,
        userId: t.userId,
        userName: t.userName,
        name: t.name,
        description: t.description,
        category: t.category,
        tags: t.tags,
        preview: t.preview,
        rating: t.rating,
        reviewsCount: t.reviews.length,
        downloads: t.downloads,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total: filtered.length,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('[Marketplace API] GET 오류:', error);
    return NextResponse.json(
      { error: '템플릿을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await rateLimitCheck(request, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { userId, userName, name, description, category, tags, files, preview } = body;

    // 입력 검증
    const nameValidation = validateInput(name, { maxLength: 100, required: true });
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const newTemplate: MarketplaceTemplate = {
      id: `mkt_${Date.now()}`,
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous',
      name: nameValidation.sanitized || name,
      description: description || '',
      category: category || 'other',
      tags: tags || [],
      files: files || [],
      preview,
      rating: 0,
      reviews: [],
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    marketplaceTemplates.unshift(newTemplate);
    if (marketplaceTemplates.length > 1000) {
      marketplaceTemplates = marketplaceTemplates.slice(0, 1000);
    }

    return NextResponse.json({
      success: true,
      template: {
        id: newTemplate.id,
        name: newTemplate.name,
        description: newTemplate.description,
      },
    });
  } catch (error: any) {
    console.error('[Marketplace API] POST 오류:', error);
    return NextResponse.json(
      { error: '템플릿 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, rating, review } = body;

    const template = marketplaceTemplates.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { error: '템플릿을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (rating !== undefined) {
      // 평점 추가
      const existingReview = template.reviews.find(r => r.userId === body.userId);
      if (existingReview) {
        existingReview.rating = rating;
        if (review) existingReview.comment = review;
      } else {
        template.reviews.push({
          userId: body.userId || 'anonymous',
          userName: body.userName || 'Anonymous',
          rating,
          comment: review || '',
          timestamp: new Date().toISOString(),
        });
      }

      // 평균 평점 계산
      const totalRating = template.reviews.reduce((sum, r) => sum + r.rating, 0);
      template.rating = totalRating / template.reviews.length;
    }

    if (body.download) {
      template.downloads++;
    }

    template.updatedAt = new Date().toISOString();

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        rating: template.rating,
        reviewsCount: template.reviews.length,
        downloads: template.downloads,
      },
    });
  } catch (error: any) {
    console.error('[Marketplace API] PUT 오류:', error);
    return NextResponse.json(
      { error: '템플릿 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
