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
 * 해시태그 자동 생성
 */
export async function generateHashtags(
  topic: string,
  content: string,
  count: number = 10
): Promise<string[]> {
  logger.info('해시태그 생성 시작:', topic)

  const keywordAnalysis = await extractKeywords(topic, content)
  
  // 트렌딩 해시태그 추가
  const trendingHashtags = [
    '#shorts',
    '#유튜브쇼츠',
    '#shorts영상',
    '#viral',
    '#trending'
  ]

  const hashtags = [
    ...keywordAnalysis.primaryKeywords.map(k => `#${k}`),
    ...keywordAnalysis.secondaryKeywords.map(k => `#${k}`),
    ...trendingHashtags
  ].slice(0, count)

  return hashtags
}

