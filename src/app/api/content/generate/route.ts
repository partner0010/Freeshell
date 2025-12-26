import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ShortFormCreator } from '@/lib/content/shortform-creator';
import { BlogWriter } from '@/lib/content/blog-writer';
import { EbookGenerator } from '@/lib/content/ebook-generator';
import { MusicGenerator } from '@/lib/content/music-generator';
import { ContentSecurityManager } from '@/lib/security/content-security';
import { ContentOptimizer } from '@/lib/performance/content-optimizer';
import { cacheManager, createCacheKey } from '@/lib/performance/cache-manager';
import { validateCSRFRequest } from '@/lib/security/csrf-protection';

export async function POST(request: NextRequest) {
  try {
    // CSRF 토큰 검증
    const csrfCheck = validateCSRFRequest(request);
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { error: 'CSRF 토큰 검증 실패', message: csrfCheck.error },
        { status: 403 }
      );
    }

    // 회원가입 없이 사용 가능하도록 인증 제거 (선택사항)
    // const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    // const userId = token?.id || 'anonymous';
    
    // 임시로 익명 사용자 허용
    const userId = 'anonymous';

    const { contentType, topic, options } = await request.json();

    if (!contentType || !topic) {
      return NextResponse.json(
        { error: '콘텐츠 유형과 주제를 입력하세요.' },
        { status: 400 }
      );
    }

    // 캐시 키 생성
    const cacheKey = createCacheKey('content', contentType, topic, JSON.stringify(options));
    
    // 캐시에서 확인 (5분 TTL)
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const securityManager = new ContentSecurityManager();
    const optimizer = new ContentOptimizer();
    let result: any;

    switch (contentType) {
      case 'short-video':
      case 'shortform': {
        const creator = new ShortFormCreator();
        const content = await creator.createShortForm(topic, {
          duration: options?.duration || 30,
          aspectRatio: '9:16',
          platform: options?.platform || 'all',
          hashtags: creator.getTrendingHashtags(topic),
        });
        result = {
          type: 'shortform',
          content,
          script: content.description,
          hashtags: content.config.hashtags,
          optimalPostingTimes: creator.getOptimalPostingTimes('tiktok'),
        };
        break;
      }

      case 'blog': {
        const writer = new BlogWriter();
        const keywords = writer.getTrendingKeywords(topic);
        const post = await writer.generateBlogPost({
          topic,
          targetKeywords: keywords,
          tone: options?.tone || 'professional',
          length: options?.length || 'medium',
          includeImages: options?.includeImages !== false,
          seoOptimized: true,
          targetAudience: options?.targetAudience || '일반 사용자',
        });
        result = {
          type: 'blog',
          post,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          keywords: post.keywords,
          seoMeta: post.seoMeta,
          readingTime: post.structure.readingTime,
        };
        break;
      }

      case 'ebook': {
        const generator = new EbookGenerator();
        const chapters = generator.generateStructure(topic, 10);
        const ebook = await generator.generateEbook({
          title: `${topic} 가이드`,
          author: 'Freeshell 사용자',
          chapters,
          coverDesign: {
            style: 'modern',
            colors: ['#8B5CF6', '#EC4899'],
          },
          format: options?.format || 'all',
          includeTOC: true,
          includeIndex: true,
          metadata: {
            category: '가이드',
            tags: [topic, 'AI', '자동화'],
            description: `${topic}에 대한 완벽한 가이드`,
          },
        });
        result = {
          type: 'ebook',
          ebook,
          title: ebook.title,
          content: ebook.content,
          coverUrl: ebook.coverUrl,
        };
        break;
      }

      case 'audio': {
        // 음성 나레이션 생성
        result = {
          type: 'audio',
          message: '음성 생성은 별도 API를 사용하세요.',
          prompt: topic,
        };
        break;
      }

      case 'music': {
        const musicGen = new MusicGenerator();
        const track = await musicGen.generateMusic({
          topic,
          genre: options?.genre || 'electronic',
          mood: options?.mood || 'energetic',
          duration: options?.duration || 60,
          tempo: options?.tempo || 'medium',
          instruments: options?.instruments || ['synthesizer', 'drums'],
          vocals: options?.vocals || false,
          style: options?.style || 'modern',
          service: 'remusic', // Remusic, AnyMusic, MSong.ai 중 선택
        });
        result = {
          type: 'music',
          track,
          title: track.title,
          genre: track.genre,
          mood: track.mood,
          metadata: track.metadata,
          url: track.url,
        };
        break;
      }

      case 'song': {
        const musicGen = new MusicGenerator();
        const song = await musicGen.generateSong({
          topic,
          lyrics: options?.lyrics || topic,
          genre: options?.genre || 'pop',
          mood: options?.mood || 'happy',
          duration: options?.duration || 180,
          tempo: options?.tempo || 'medium',
          style: options?.style || 'modern',
          service: 'aisongmaker', // AI Song Maker, MusicHero.ai 중 선택
        });
        result = {
          type: 'song',
          song,
          title: song.title,
          lyrics: song.lyrics,
          genre: song.genre,
          mood: song.mood,
          metadata: song.metadata,
          url: song.url,
        };
        break;
      }

      case 'image': {
        // 기존 이미지 생성 API 사용
        result = {
          type: 'image',
          message: '이미지 생성은 별도 API를 사용하세요.',
          prompt: topic,
        };
        break;
      }

      case 'video': {
        // 기존 비디오 생성 API 사용
        result = {
          type: 'video',
          message: '비디오 생성은 별도 API를 사용하세요.',
          prompt: topic,
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: '지원하지 않는 콘텐츠 유형입니다.' },
          { status: 400 }
        );
    }

    // 보안 적용
    const contentId = `content-${Date.now()}`;
    const security = securityManager.secureContent(contentId, userId, {
      encryption: true,
      watermark: true,
      drm: false,
      accessControl: true,
      auditLog: true,
    });

    securityManager.logSecurityEvent('content_created', contentId, userId, {
      contentType,
      topic,
    });

    // 성능 최적화 적용
    if (result.coverUrl) {
      result.coverUrl = await optimizer.optimizeImage(result.coverUrl, {
        width: 800,
        height: 1200,
        quality: 85,
        format: 'webp',
      });
    }

    const responseData = {
      success: true,
      data: {
        ...result,
        security,
        optimized: true,
      },
    };

    // 도메인별 학습 시스템에 상호작용 기록
    try {
      const { domainLearningSystem } = await import('@/lib/ai/domain-specific-learning');
      domainLearningSystem.recordInteraction('content', {
        action: 'generate-content',
        input: `${contentType}: ${topic}`,
        output: JSON.stringify(responseData),
        feedback: undefined,
      });
    } catch (error) {
      console.error('학습 기록 실패:', error);
    }

    // 결과를 캐시에 저장 (5분 TTL)
    if (responseData) {
      cacheManager.set(cacheKey, responseData, 5 * 60 * 1000);
    }

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error: any) {
    console.error('콘텐츠 생성 오류:', error);
    return NextResponse.json(
      { error: `콘텐츠 생성 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
