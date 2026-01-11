/**
 * 콘텐츠 템플릿 모델
 */
export type TemplateCategory = 'blog' | 'youtube' | 'sns' | 'instagram' | 'twitter' | 'linkedin';
export type ContentTemplateType = 'blog-post' | 'youtube-script' | 'sns-post' | 'instagram-caption' | 'twitter-thread' | 'linkedin-post';

export interface ContentTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  contentType: ContentTemplateType;
  platform: string;
  description: string;
  example: string; // 예시 콘텐츠 (실제 사용 가능)
  structure: {
    sections: string[]; // 섹션 구조 설명
    tips: string[]; // 작성 팁
    length?: {
      min: number;
      max: number;
      recommended: number;
    };
  };
  tags: string[];
  isPremium: boolean; // 프리미엄 템플릿 여부
  usageCount?: number; // 사용 횟수 (인기 템플릿 추적)
  createdAt: Date;
}

export interface TemplateSearchFilters {
  category?: TemplateCategory;
  contentType?: ContentTemplateType;
  platform?: string;
  tags?: string[];
  isPremium?: boolean;
  searchQuery?: string;
}

