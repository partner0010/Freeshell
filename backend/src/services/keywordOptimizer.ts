import OpenAI from 'openai'
import { logger } from '../utils/logger'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

export interface KeywordAnalysis {
  primaryKeywords: string[]
  secondaryKeywords: string[]
  longTailKeywords: string[]
  searchVolume?: number
  competition?: 'low' | 'medium' | 'high'
  trend?: 'rising' | 'stable' | 'declining'
}

export interface SEOOptimization {
  optimizedTitle: string
  optimizedDescription: string
  tags: string[]
  hashtags: string[]
  keywordAnalysis: KeywordAnalysis
  suggestions: string[]
}

/**
 * 키워드 자동 추출 및 분석
 */
export async function extractKeywords(
  topic: string,
  content: string
): Promise<KeywordAnalysis> {
  logger.info('키워드 추출 시작:', topic)

  if (!openai) {
    // 기본 키워드 추출 (간단한 버전)
    return extractBasicKeywords(topic, content)
  }

  try {
    const prompt = `다음 주제와 콘텐츠를 분석하여 YouTube SEO에 최적화된 키워드를 추출해주세요.

주제: ${topic}
콘텐츠: ${content.substring(0, 1000)}

다음 JSON 형식으로 응답해주세요:
{
  "primaryKeywords": ["주요 키워드 1", "주요 키워드 2", "주요 키워드 3"],
  "secondaryKeywords": ["보조 키워드 1", "보조 키워드 2"],
  "longTailKeywords": ["긴 꼬리 키워드 1", "긴 꼬리 키워드 2"],
  "competition": "low|medium|high",
  "trend": "rising|stable|declining"
}

각 키워드는 검색량이 높고 경쟁이 적은 것을 우선으로 선택해주세요.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '당신은 YouTube SEO 전문가입니다. 검색량이 높고 경쟁이 적은 키워드를 정확하게 추출합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const responseText = response.choices[0].message.content || '{}'
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const keywordData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return {
      primaryKeywords: keywordData.primaryKeywords || extractBasicKeywords(topic, content).primaryKeywords,
      secondaryKeywords: keywordData.secondaryKeywords || [],
      longTailKeywords: keywordData.longTailKeywords || [],
      competition: keywordData.competition || 'medium',
      trend: keywordData.trend || 'stable'
    }

  } catch (error) {
    logger.error('키워드 추출 실패, 기본값 사용:', error)
    return extractBasicKeywords(topic, content)
  }
}

/**
 * 기본 키워드 추출 (AI 없이)
 */
function extractBasicKeywords(topic: string, content: string): KeywordAnalysis {
  const words = (topic + ' ' + content).toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)

  // 단어 빈도 계산
  const wordFreq: Record<string, number> = {}
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })

  // 빈도순 정렬
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)

  return {
    primaryKeywords: sortedWords.slice(0, 3),
    secondaryKeywords: sortedWords.slice(3, 6),
    longTailKeywords: [topic],
    competition: 'medium',
    trend: 'stable'
  }
}

/**
 * SEO 최적화 (제목, 설명, 태그, 해시태그)
 */
export async function optimizeSEO(
  title: string,
  description: string,
  topic: string,
  content: string
): Promise<SEOOptimization> {
  logger.info('SEO 최적화 시작:', title)

  const keywordAnalysis = await extractKeywords(topic, content)

  if (!openai) {
    return createBasicSEO(title, description, keywordAnalysis)
  }

  try {
    const prompt = `다음 정보를 바탕으로 YouTube SEO에 최적화된 제목, 설명, 태그, 해시태그를 생성해주세요.

원본 제목: ${title}
원본 설명: ${description}
주제: ${topic}
주요 키워드: ${keywordAnalysis.primaryKeywords.join(', ')}

다음 JSON 형식으로 응답해주세요:
{
  "optimizedTitle": "SEO 최적화된 제목 (60자 이내)",
  "optimizedDescription": "SEO 최적화된 설명 (500자 이내, 첫 125자가 중요)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "hashtags": ["#해시태그1", "#해시태그2", "#해시태그3"],
  "suggestions": ["개선 제안 1", "개선 제안 2"]
}

요구사항:
- 제목: 주요 키워드를 앞부분에 배치, 클릭을 유도하는 문구 포함
- 설명: 첫 125자에 주요 키워드 포함, 나머지에 상세 설명
- 태그: 관련성 높은 태그 5개
- 해시태그: 트렌딩 해시태그 포함`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: '당신은 YouTube SEO 최적화 전문가입니다. 검색 노출과 클릭률을 극대화하는 콘텐츠를 생성합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 800
    })

    const responseText = response.choices[0].message.content || '{}'
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const seoData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return {
      optimizedTitle: seoData.optimizedTitle || title,
      optimizedDescription: seoData.optimizedDescription || description,
      tags: seoData.tags || keywordAnalysis.primaryKeywords,
      hashtags: seoData.hashtags || keywordAnalysis.primaryKeywords.map(k => `#${k}`),
      keywordAnalysis,
      suggestions: seoData.suggestions || []
    }

  } catch (error) {
    logger.error('SEO 최적화 실패, 기본값 사용:', error)
    return createBasicSEO(title, description, keywordAnalysis)
  }
}

/**
 * 기본 SEO 생성 (AI 없이)
 */
function createBasicSEO(
  title: string,
  description: string,
  keywordAnalysis: KeywordAnalysis
): SEOOptimization {
  return {
    optimizedTitle: title,
    optimizedDescription: description,
    tags: keywordAnalysis.primaryKeywords,
    hashtags: keywordAnalysis.primaryKeywords.map(k => `#${k}`),
    keywordAnalysis,
    suggestions: []
  }
}

/**
 * 해시태그 자동 생성 (강화 버전)
 */
export async function generateHashtags(
  topic: string,
  content: string,
  count: number = 10,
  platform?: 'youtube' | 'tiktok' | 'instagram'
): Promise<string[]> {
  logger.info('해시태그 생성 시작:', topic)

  const keywordAnalysis = await extractKeywords(topic, content)
  
  // 트렌딩 해시태그 수집 (강화)
  const trendingHashtags = await getTrendingHashtags(platform)
  
  // 플랫폼별 최적 해시태그
  const platformHashtags = getPlatformOptimizedHashtags(platform, topic)
  
  // 경쟁 분석 기반 해시태그 선택
  const optimizedHashtags = await optimizeHashtagSelection(
    keywordAnalysis,
    trendingHashtags,
    platformHashtags,
    count
  )

  return optimizedHashtags
}

/**
 * 트렌딩 해시태그 수집 (강화)
 */
async function getTrendingHashtags(platform?: 'youtube' | 'tiktok' | 'instagram'): Promise<string[]> {
  try {
    // 트렌드 수집기 사용
    const { TrendCollector } = await import('./trends/collector')
    const collector = new TrendCollector()
    const trends = await collector.collectAllTrends('ko')
    
    // 트렌드에서 해시태그 추출
    const hashtags = new Set<string>()
    trends.forEach(trend => {
      trend.keywords.forEach(keyword => {
        if (keyword.length > 2 && keyword.length < 20) {
          hashtags.add(`#${keyword}`)
        }
      })
    })
    
    // 플랫폼별 기본 해시태그 추가
    const platformDefaults: Record<string, string[]> = {
      youtube: ['#shorts', '#유튜브쇼츠', '#shorts영상', '#viral', '#trending'],
      tiktok: ['#fyp', '#foryou', '#viral', '#trending', '#tiktok'],
      instagram: ['#reels', '#viral', '#trending', '#explore', '#instagram']
    }
    
    if (platform && platformDefaults[platform]) {
      platformDefaults[platform].forEach(tag => hashtags.add(tag))
    }
    
    return Array.from(hashtags).slice(0, 20)
  } catch (error) {
    logger.warn('트렌딩 해시태그 수집 실패:', error)
    return ['#shorts', '#viral', '#trending']
  }
}

/**
 * 플랫폼별 최적화된 해시태그
 */
function getPlatformOptimizedHashtags(
  platform: 'youtube' | 'tiktok' | 'instagram' | undefined,
  topic: string
): string[] {
  const platformStrategies: Record<string, (topic: string) => string[]> = {
    youtube: (topic) => {
      const words = topic.split(/\s+/).filter(w => w.length > 1)
      return [
        `#${words[0] || 'shorts'}`,
        `#${words.join('') || 'viral'}`,
        '#유튜브쇼츠',
        '#shorts영상'
      ]
    },
    tiktok: (topic) => {
      const words = topic.split(/\s+/).filter(w => w.length > 1)
      return [
        '#fyp',
        '#foryou',
        `#${words[0] || 'viral'}`,
        '#tiktok',
        '#trending'
      ]
    },
    instagram: (topic) => {
      const words = topic.split(/\s+/).filter(w => w.length > 1)
      return [
        '#reels',
        `#${words[0] || 'viral'}`,
        '#explore',
        '#instagram',
        '#trending'
      ]
    }
  }
  
  if (platform && platformStrategies[platform]) {
    return platformStrategies[platform](topic)
  }
  
  // 기본 전략
  const words = topic.split(/\s+/).filter(w => w.length > 1)
  return [
    `#${words[0] || 'viral'}`,
    '#shorts',
    '#trending'
  ]
}

/**
 * 해시태그 선택 최적화 (경쟁 분석 기반)
 */
async function optimizeHashtagSelection(
  keywordAnalysis: KeywordAnalysis,
  trendingHashtags: string[],
  platformHashtags: string[],
  count: number
): Promise<string[]> {
  // 점수 기반 해시태그 선택
  const hashtagScores = new Map<string, number>()
  
  // 주요 키워드 해시태그 (높은 점수)
  keywordAnalysis.primaryKeywords.forEach(keyword => {
    const hashtag = `#${keyword}`
    hashtagScores.set(hashtag, 100)
  })
  
  // 보조 키워드 해시태그 (중간 점수)
  keywordAnalysis.secondaryKeywords.forEach(keyword => {
    const hashtag = `#${keyword}`
    if (!hashtagScores.has(hashtag)) {
      hashtagScores.set(hashtag, 70)
    }
  })
  
  // 트렌딩 해시태그 (높은 점수, 하지만 중복 방지)
  trendingHashtags.forEach(hashtag => {
    if (!hashtagScores.has(hashtag)) {
      hashtagScores.set(hashtag, 80)
    }
  })
  
  // 플랫폼 해시태그 (추가 점수)
  platformHashtags.forEach(hashtag => {
    const currentScore = hashtagScores.get(hashtag) || 0
    hashtagScores.set(hashtag, currentScore + 20)
  })
  
  // 경쟁이 낮은 키워드에 추가 점수
  if (keywordAnalysis.competition === 'low') {
    keywordAnalysis.primaryKeywords.forEach(keyword => {
      const hashtag = `#${keyword}`
      const currentScore = hashtagScores.get(hashtag) || 0
      hashtagScores.set(hashtag, currentScore + 30)
    })
  }
  
  // 트렌드가 상승 중인 키워드에 추가 점수
  if (keywordAnalysis.trend === 'rising') {
    keywordAnalysis.primaryKeywords.forEach(keyword => {
      const hashtag = `#${keyword}`
      const currentScore = hashtagScores.get(hashtag) || 0
      hashtagScores.set(hashtag, currentScore + 25)
    })
  }
  
  // 점수순 정렬 및 상위 N개 반환
  return Array.from(hashtagScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([hashtag]) => hashtag)
}

/**
 * 플랫폼별 최적화된 키워드 생성 (새로 추가)
 */
export async function generatePlatformKeywords(
  topic: string,
  content: string,
  platform: 'youtube' | 'tiktok' | 'instagram'
): Promise<{
  keywords: string[]
  hashtags: string[]
  title: string
  description: string
}> {
  const keywordAnalysis = await extractKeywords(topic, content)
  const hashtags = await generateHashtags(topic, content, 10, platform)
  
  // 플랫폼별 최적화 전략
  const platformStrategies = {
    youtube: {
      titleLength: 60,
      descriptionLength: 5000,
      keywordCount: 15
    },
    tiktok: {
      titleLength: 150,
      descriptionLength: 2200,
      keywordCount: 5
    },
    instagram: {
      titleLength: 125,
      descriptionLength: 2200,
      keywordCount: 30
    }
  }
  
  const strategy = platformStrategies[platform]
  
  // 키워드 선택 (플랫폼별 최적 개수)
  const keywords = [
    ...keywordAnalysis.primaryKeywords,
    ...keywordAnalysis.secondaryKeywords,
    ...keywordAnalysis.longTailKeywords
  ].slice(0, strategy.keywordCount)
  
  // SEO 최적화
  const seoOptimization = await optimizeSEO(
    topic,
    content.substring(0, 500),
    topic,
    content
  )
  
  return {
    keywords,
    hashtags,
    title: seoOptimization.optimizedTitle.substring(0, strategy.titleLength),
    description: seoOptimization.optimizedDescription.substring(0, strategy.descriptionLength)
  }
}

