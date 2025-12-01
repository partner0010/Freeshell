// 프론트엔드와 공유하는 타입들
export type ContentType = 
  // 뉴스/트렌드
  | 'today-issue'
  | 'trending-news'
  | 'viral-trend'
  // 엔터테인먼트
  | 'movie'
  | 'drama'
  | 'entertainment'
  | 'celebrity'
  | 'music'
  | 'dance'
  // 교육/정보
  | 'education'
  | 'tutorial'
  | 'how-to'
  | 'tips'
  | 'life-hacks'
  // 리뷰/평가
  | 'product-review'
  | 'restaurant-review'
  | 'movie-review'
  | 'game-review'
  | 'comparison'
  // 라이프스타일
  | 'daily-talk'
  | 'lifestyle'
  | 'fashion'
  | 'beauty'
  | 'cooking'
  | 'recipe'
  | 'travel'
  | 'fitness'
  | 'health'
  // 코미디/재미
  | 'funny'
  | 'comedy'
  | 'prank'
  | 'challenge'
  // 감정 표현
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'contempt'
  // 게임/IT
  | 'gaming'
  | 'tech'
  | 'it-news'
  | 'app-review'
  // 동물/펫
  | 'pets'
  | 'animals'
  // DIY/만들기
  | 'diy'
  | 'craft'
  | 'art'
  // 자동차
  | 'car'
  | 'automotive'
  // 투자/금융
  | 'investment'
  | 'stock'
  | 'crypto'
  | 'finance'
  // 부동산
  | 'real-estate'
  // 동기부여/자기계발
  | 'motivation'
  | 'self-improvement'
  | 'success-story'
  // 역사/문화
  | 'history'
  | 'culture'
  // 과학/기술
  | 'science'
  | 'technology'
  // 기타
  | 'other-media'
  | 'asmr'
  | 'reaction'
  | 'storytelling'

export interface GeneratedContent {
  id: string
  version: number
  title: string
  description: string
  script: string // 대본 (비디오 나레이션용)
  thumbnail: string
  videoUrl?: string
  reasoning: string
  duration: number
  createdAt: string
  topic: string
  contentType: ContentType
  status?: 'draft' | 'generated' | 'uploaded' | 'published'
  views?: number
  likes?: number
  platforms?: string[]
}

export interface PlatformConfig {
  platform: 'youtube' | 'tiktok' | 'instagram'
  credentials: {
    email?: string
    username?: string
    password?: string
    apiKey?: string
  }
  autoUpload: boolean
}

