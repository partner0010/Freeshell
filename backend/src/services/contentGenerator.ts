/**
 * AI 콘텐츠 생성 서비스
 * 주제를 입력받아 완성된 콘텐츠를 생성합니다
 */

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../utils/logger'
import { GeneratedContent, ContentType } from '../types'
import { TrendCollector } from './trends/collector'
import { CreativityEnhancer } from './creativity/enhancer'
import { nanobanaAI } from './ai/nanobanaAI'
import { klingAI } from './ai/klingAI'
import { generateVideo as generateFFmpegVideo } from './videoGenerator'
import { getCache, setCache, getAIResponseCacheKey } from '../utils/cache'
import { randomUUID } from 'crypto'

// AI 클라이언트 초기화
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const anthropic = process.env.CLAUDE_API_KEY ? new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
}) : null

// 트렌드 수집기 및 창의성 향상기
const trendCollector = new TrendCollector()
const creativityEnhancer = new CreativityEnhancer()

/**
 * 콘텐츠 생성 폼 인터페이스
 */
export interface ContentForm {
  topic: string
  contentType: ContentType
  contentTime: number // 초 단위
  contentFormat: string[]
  text: string
  images?: string[]
  videos?: string[]
}

/**
 * AI 콘텐츠 생성 (메인 함수)
 * 5가지 버전을 자동으로 생성합니다
 */
export async function generateContent(
  formData: ContentForm
): Promise<GeneratedContent[]> {
  const { topic, contentType, contentTime, contentFormat, text, images, videos } = formData

  logger.info('콘텐츠 생성 시작:', { topic, contentType, contentTime })

  // 캐시 확인
  const cacheKey = getAIResponseCacheKey(topic, contentType)
  const cached = await getCache<GeneratedContent[]>(cacheKey)
  if (cached) {
    logger.info('콘텐츠 캐시에서 조회:', cacheKey)
    return cached
  }

  try {
    // 1. 트렌드 수집
    const trends = await trendCollector.collectAllTrends('ko')
    logger.info(`트렌드 ${trends.length}개 수집 완료`)

    // 2. 5가지 버전 생성 (병렬 처리로 속도 향상 - 최대 5배 빠름)
    const { performanceOptimizer } = await import('./performance/performanceOptimizer')
    
    const versionTasks = Array.from({ length: 5 }, (_, i) => 
      () => generateContentVersion(formData, i + 1, trends)
    )
    
    const contents = await performanceOptimizer.parallelExecute(versionTasks, 5)

    if (contents.length === 0) {
      throw new Error('모든 버전 생성 실패')
    }

    // 캐시 저장 (1시간)
    await setCache(cacheKey, contents, 3600)

    logger.info(`✅ ${contents.length}개 버전 생성 완료`)
    return contents

  } catch (error: any) {
    logger.error('콘텐츠 생성 실패:', error)
    throw error
  }
}

/**
 * 단일 버전 콘텐츠 생성
 */
async function generateContentVersion(
  formData: ContentForm,
  version: number,
  trends: any[]
): Promise<GeneratedContent> {
  const { topic, contentType, contentTime, contentFormat, text, images, videos } = formData

  // 프롬프트 생성
  const prompt = createPrompt(topic, contentType, contentTime, version, trends, text)

  // AI 호출
  let aiResponse: any
  try {
    if (openai) {
      aiResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 우주에서 가장 뛰어난 콘텐츠 크리에이터입니다. 매력적이고 독창적인 콘텐츠를 생성합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7 + (version - 1) * 0.1, // 버전별로 다른 창의성
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    } else if (anthropic) {
      aiResponse = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    } else {
      throw new Error('AI API를 사용할 수 없습니다. OPENAI_API_KEY 또는 CLAUDE_API_KEY를 설정해주세요.')
    }
  } catch (error: any) {
    logger.error('AI 호출 실패:', error)
    throw new Error(`AI 호출 실패: ${error.message}`)
  }

  // AI 응답 파싱
  const content = parseAIResponse(aiResponse, version, formData)

  // 이미지 생성 (NanoBana AI 우선)
  let generatedImages: string[] = []
  if (content.script && contentFormat.some(f => f.includes('image'))) {
    const imagePrompts = extractImagePrompts(content.script, content.duration)
    for (const prompt of imagePrompts) {
      try {
        const imageUrl = await nanobanaAI.generateCharacter(prompt, 'anime')
        generatedImages.push(imageUrl)
      } catch (error) {
        logger.warn('NanoBana AI 이미지 생성 실패:', error)
      }
    }
  }

  // 비디오 생성
  if (contentFormat.some(f => f.includes('video'))) {
    try {
      let videoUrl: string
      if (content.duration > 60 && content.script) {
        // 긴 영상은 Kling AI로 클립 분할 생성
        const videoClips = splitScriptIntoClips(content.script, content.duration)
        videoUrl = await klingAI.generateVideoFromText(videoClips[0], { duration: content.duration })
      } else {
        // 짧은 영상은 FFmpeg 기반
        videoUrl = await generateFFmpegVideo(content, generatedImages.length > 0 ? generatedImages : images, videos, undefined, true)
      }
      content.videoUrl = videoUrl
    } catch (error) {
      logger.warn('비디오 생성 실패:', error)
    }
  }

  // 썸네일 생성 (기본)
  if (!content.thumbnail) {
    content.thumbnail = `./uploads/thumbnails/${content.id}.jpg`
  }

  return content
}

/**
 * 프롬프트 생성
 */
function createPrompt(
  topic: string,
  contentType: ContentType,
  duration: number,
  version: number,
  trends: any[],
  userText: string
): string {
  const masterPrompt = creativityEnhancer.generateMasterPrompt(
    topic,
    contentType,
    trends,
    'universal',
    version === 1 ? 'engaging' : version === 2 ? 'dramatic' : 'creative'
  )

  return `${masterPrompt}

요청사항:
- 주제: ${topic}
- 콘텐츠 유형: ${contentType}
- 영상 길이: ${duration}초
- 버전: ${version}번째 버전 (${version === 1 ? '기본' : version === 2 ? '드라마틱' : version === 3 ? '창의적' : version === 4 ? '교육적' : '엔터테인먼트'} 스타일)
${userText ? `- 사용자 추가 요청: ${userText}` : ''}

다음 JSON 형식으로 응답해주세요:
{
  "title": "영상 제목",
  "description": "영상 설명",
  "script": "대본 (${duration}초 분량, 자연스러운 말투)",
  "reasoning": "이 콘텐츠를 만든 이유",
  "keywords": ["키워드1", "키워드2", "키워드3"]
}`
}

/**
 * AI 응답 파싱
 */
function parseAIResponse(
  aiResponse: any,
  version: number,
  formData: ContentForm
): GeneratedContent {
  let parsed: any

  try {
    // OpenAI 응답
    if (aiResponse.choices?.[0]?.message?.content) {
      const responseText = aiResponse.choices[0].message.content
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText)
    }
    // Claude 응답
    else if (aiResponse.content?.[0]?.text) {
      const responseText = aiResponse.content[0].text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText)
    }
    else {
      throw new Error('Invalid AI response format')
    }
  } catch (error) {
    logger.warn('AI 응답 파싱 실패, 기본값 사용:', error)
    parsed = {
      title: `${formData.topic} - 버전 ${version}`,
      description: `${formData.topic}에 대한 콘텐츠입니다.`,
      script: `${formData.topic}에 대해 이야기하겠습니다.`,
      reasoning: 'AI 응답 파싱 실패로 기본값 사용',
      keywords: [formData.topic]
    }
  }

  const contentId = randomUUID()
  const now = new Date().toISOString()

  return {
    id: contentId,
    version,
    title: parsed.title || `${formData.topic} - 버전 ${version}`,
    description: parsed.description || `${formData.topic}에 대한 콘텐츠입니다.`,
    script: parsed.script || `${formData.topic}에 대해 이야기하겠습니다.`,
    thumbnail: `./uploads/thumbnails/${contentId}.jpg`,
    reasoning: parsed.reasoning || 'AI가 생성한 콘텐츠입니다.',
    duration: formData.contentTime,
    createdAt: now,
    topic: formData.topic,
    contentType: formData.contentType,
    status: 'generated'
  }
}

/**
 * 대본에서 이미지 프롬프트 추출
 */
function extractImagePrompts(script: string, duration: number): string[] {
  // 대본을 문장 단위로 분할
  const sentences = script.split(/[.!?]\s+/).filter(s => s.trim().length > 0)
  
  // 영상 길이에 맞게 이미지 개수 계산 (3-5초당 1개 이미지)
  const imagesPerSecond = 0.2 // 초당 0.2개 이미지
  const targetImageCount = Math.max(1, Math.min(Math.floor(duration * imagesPerSecond), 20))
  
  // 문장을 그룹화하여 프롬프트 생성
  const prompts: string[] = []
  const sentencesPerImage = Math.ceil(sentences.length / targetImageCount)
  
  for (let i = 0; i < sentences.length; i += sentencesPerImage) {
    const group = sentences.slice(i, i + sentencesPerImage).join('. ')
    if (group.trim()) {
      prompts.push(`Create an image for: ${group}`)
    }
  }
  
  return prompts.length > 0 ? prompts : ['Create an image for the video content']
}

/**
 * 대본을 여러 클립으로 분할 (Kling AI용)
 */
function splitScriptIntoClips(script: string, duration: number): string[] {
  // 대본을 문장 단위로 분할
  const sentences = script.split(/[.!?]\s+/).filter(s => s.trim().length > 0)
  
  // 클립 길이 계산 (각 클립 5-10초)
  const clipDuration = 8 // 초
  const clipCount = Math.ceil(duration / clipDuration)
  
  // 문장을 클립별로 그룹화
  const clips: string[] = []
  const sentencesPerClip = Math.ceil(sentences.length / clipCount)
  
  for (let i = 0; i < sentences.length; i += sentencesPerClip) {
    const group = sentences.slice(i, i + sentencesPerClip).join('. ')
    if (group.trim()) {
      clips.push(group)
    }
  }
  
  return clips.length > 0 ? clips : [script]
}
