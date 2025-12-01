import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../../utils/logger'
import { ContentType } from '../../../types'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

const anthropic = process.env.CLAUDE_API_KEY ? new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
}) : null

export interface EbookData {
  title: string
  author: string
  description: string
  chapters: Chapter[]
  coverImage?: string
  keywords: string[]
  language: string
}

export interface Chapter {
  title: string
  content: string
  order: number
}

/**
 * E-book 콘텐츠 생성
 */
export async function generateEbook(
  topic: string,
  contentType: ContentType,
  language: string = 'ko',
  chapterCount: number = 10
): Promise<EbookData> {
  logger.info('E-book 생성 시작:', { topic, language, chapterCount })

  const prompt = createEbookPrompt(topic, contentType, chapterCount, language)

  let aiResponse: any
  try {
    if (openai) {
      aiResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 베스트셀러 작가입니다. 매력적이고 읽기 쉬운 E-book을 작성합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    } else if (anthropic) {
      aiResponse = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    } else {
      throw new Error('AI API를 사용할 수 없습니다')
    }
  } catch (error) {
    logger.error('E-book 생성 실패:', error)
    throw error
  }

  // AI 응답 파싱
  const ebookData = parseEbookResponse(aiResponse, topic, language)
  
  return ebookData
}

/**
 * E-book 프롬프트 생성
 */
function createEbookPrompt(
  topic: string,
  contentType: ContentType,
  chapterCount: number,
  language: string
): string {
  return `다음 주제로 ${chapterCount}개의 챕터가 있는 E-book을 작성해주세요.

주제: ${topic}
콘텐츠 유형: ${contentType}
언어: ${language}
챕터 수: ${chapterCount}

각 챕터는 500-1000단어로 작성하고, 실용적이고 가치 있는 정보를 제공해야 합니다.

다음 JSON 형식으로 응답해주세요:
{
  "title": "E-book 제목",
  "author": "작가명",
  "description": "E-book 설명 (200자 이내)",
  "keywords": ["키워드1", "키워드2", "키워드3"],
  "chapters": [
    {
      "title": "챕터 1 제목",
      "content": "챕터 1 내용",
      "order": 1
    },
    ...
  ]
}`
}

/**
 * AI 응답 파싱
 */
function parseEbookResponse(aiResponse: any, topic: string, language: string): EbookData {
  let ebookData: any

  try {
    // OpenAI 응답
    if (aiResponse.choices?.[0]?.message?.content) {
      const responseText = aiResponse.choices[0].message.content
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        ebookData = JSON.parse(jsonMatch[0])
      } else {
        ebookData = JSON.parse(responseText)
      }
    }
    // Claude 응답
    else if (aiResponse.content?.[0]?.text) {
      const responseText = aiResponse.content[0].text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        ebookData = JSON.parse(jsonMatch[0])
      } else {
        ebookData = JSON.parse(responseText)
      }
    }
    else {
      throw new Error('Invalid AI response format')
    }
  } catch (error) {
    logger.warn('E-book 응답 파싱 실패, 기본값 사용:', error)
    ebookData = {
      title: `${topic} - 완전 가이드`,
      author: 'AI Author',
      description: `${topic}에 대한 종합 가이드입니다.`,
      keywords: [topic],
      chapters: Array.from({ length: 10 }, (_, i) => ({
        title: `챕터 ${i + 1}`,
        content: `${topic}에 대한 내용입니다.`,
        order: i + 1
      }))
    }
  }

  return {
    ...ebookData,
    language
  }
}

