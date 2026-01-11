/**
 * AI 해시태그 생성기
 * 트렌딩 해시태그를 기반으로 최적의 해시태그를 생성
 */
import { generateLocalAI } from '@/lib/local-ai';

export interface HashtagResult {
  trending: string[]; // 트렌딩 해시태그 (10개)
  niche: string[]; // 니치 해시태그 (10개)
  branded: string[]; // 브랜드 해시태그 (5개)
  suggestions: string[]; // 추가 제안 (10개)
  explanation: string; // 해시태그 선택 이유
}

export class HashtagGenerator {
  /**
   * 콘텐츠 기반 해시태그 생성
   */
  async generateHashtags(
    content: string,
    platform: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'linkedin',
    topic?: string,
    targetAudience?: string
  ): Promise<HashtagResult> {
    const prompt = `You are a social media hashtag expert. Generate optimal hashtags for the following content.

Content: ${content}
Platform: ${platform}
Topic: ${topic || 'general'}
Target Audience: ${targetAudience || 'general public'}

Generate hashtags in the following format:
1. Trending hashtags (10): Popular, currently trending hashtags
2. Niche hashtags (10): Specific to the topic, lower competition
3. Branded hashtags (5): Custom, brandable hashtags
4. Suggestions (10): Additional relevant hashtags

For ${platform}:
${this.getPlatformGuidelines(platform)}

Return JSON format:
{
  "trending": ["#hashtag1", "#hashtag2", ...],
  "niche": ["#hashtag1", "#hashtag2", ...],
  "branded": ["#hashtag1", "#hashtag2", ...],
  "suggestions": ["#hashtag1", "#hashtag2", ...],
  "explanation": "Brief explanation of why these hashtags are optimal"
}`;

    try {
      const response = await generateLocalAI(prompt);
      const responseText = typeof response === 'string' ? response : response.text || '';
      
      // JSON 파싱 시도
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          trending: parsed.trending || [],
          niche: parsed.niche || [],
          branded: parsed.branded || [],
          suggestions: parsed.suggestions || [],
          explanation: parsed.explanation || 'AI가 선택한 최적의 해시태그입니다.',
        };
      }

      // JSON 파싱 실패 시 기본값 반환
      return this.generateFallbackHashtags(content, platform);
    } catch (error) {
      console.error('[HashtagGenerator] 오류:', error);
      return this.generateFallbackHashtags(content, platform);
    }
  }

  /**
   * 플랫폼별 가이드라인
   */
  private getPlatformGuidelines(platform: string): string {
    switch (platform) {
      case 'instagram':
        return '- Use 5-10 hashtags (mix of popular and niche)\n- Include location-based hashtags\n- Use branded hashtags for consistency';
      case 'twitter':
        return '- Use 1-3 hashtags (keep it minimal)\n- Focus on trending topics\n- Use event or topic-specific hashtags';
      case 'tiktok':
        return '- Use 3-5 hashtags\n- Focus on trending and niche hashtags\n- Include challenge or viral hashtags';
      case 'youtube':
        return '- Use 3-5 hashtags in description\n- Mix of broad and specific\n- Include topic and keyword hashtags';
      case 'linkedin':
        return '- Use 3-5 professional hashtags\n- Focus on industry-specific\n- Include job title and industry tags';
      default:
        return '- Use 5-10 hashtags\n- Mix of trending and niche';
    }
  }

  /**
   * 폴백 해시태그 생성
   */
  private generateFallbackHashtags(content: string, platform: string): HashtagResult {
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 10);

    return {
      trending: this.generateTrendingHashtags(platform),
      niche: uniqueKeywords.map(k => `#${k}`),
      branded: [`#mycontent`, `#original`, `#creative`],
      suggestions: [`#viral`, `#trending`, `#popular`],
      explanation: '기본 해시태그가 생성되었습니다.',
    };
  }

  /**
   * 트렌딩 해시태그 생성
   */
  private generateTrendingHashtags(platform: string): string[] {
    const trending: Record<string, string[]> = {
      instagram: ['#trending', '#viral', '#explore', '#instagram', '#photography', '#instagood', '#love', '#beautiful', '#fashion', '#style'],
      twitter: ['#trending', '#viral', '#breaking', '#news', '#tech', '#ai', '#innovation', '#startup', '#business', '#motivation'],
      tiktok: ['#fyp', '#foryou', '#viral', '#trending', '#tiktok', '#comedy', '#dance', '#funny', '#love', '#trend'],
      youtube: ['#youtube', '#viral', '#trending', '#subscribe', '#like', '#share', '#video', '#content', '#creator', '#watch'],
      linkedin: ['#linkedin', '#business', '#career', '#networking', '#professional', '#leadership', '#innovation', '#technology', '#marketing', '#entrepreneurship'],
    };

    return trending[platform] || trending.instagram;
  }

  /**
   * 트렌딩 주제 추천
   */
  async getTrendingTopics(category?: string): Promise<string[]> {
    // 실제로는 트렌딩 API를 사용하거나 웹 스크래핑
    // 여기서는 기본 트렌딩 주제 반환
    const topics: Record<string, string[]> = {
      tech: ['AI 발전', '메타버스', 'Web3', '블록체인', '클라우드', '사이버보안', 'IoT', '5G'],
      lifestyle: ['건강한 삶', '미니멀리즘', '지속가능성', '웰니스', '마인드풀니스', '셀프케어', '여행', '음식'],
      business: ['원격 근무', '스타트업', '마케팅', '리더십', '혁신', '창업', '비즈니스 전략', '고객 경험'],
      entertainment: ['드라마', '영화', '음악', '게임', '유튜브', '넷플릭스', 'K-POP', '콘서트'],
    };

    return category && topics[category] ? topics[category] : Object.values(topics).flat();
  }
}

export const hashtagGenerator = new HashtagGenerator();

