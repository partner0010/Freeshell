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

export interface BlogPost {
  title: string
  content: string
  excerpt: string
  tags: string[]
  category: string
  seoKeywords: string[]
  language: string
  featuredImage?: string
}

/**
 * 블로그 포스트 생성
 */
export async function generateBlogPost(
  topic: string,
  contentType: ContentType,
  language: string = 'ko',
  wordCount: number = 1000
): Promise<BlogPost> {
  logger.info('블로그 포스트 생성 시작:', { topic, language, wordCount })

  const prompt = createBlogPrompt(topic, contentType, wordCount, language)

  let aiResponse: any
  try {
    if (openai) {
      aiResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 SEO 전문 블로거입니다. 검색 엔진에 최적화되고 독자에게 가치 있는 블로그 포스트를 작성합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
      throw new Error('AI API를 사용할 수 없습니다')
    }
  } catch (error) {
    logger.error('블로그 포스트 생성 실패:', error)
    throw error
  }

  const blogPost = parseBlogResponse(aiResponse, topic, language)
  return blogPost
}

/**
 * 블로그 프롬프트 생성
 */
function createBlogPrompt(
  topic: string,
  contentType: ContentType,
  wordCount: number,
  language: string
): string {
  return `다음 주제로 SEO 최적화된 블로그 포스트를 작성해주세요.

주제: ${topic}
콘텐츠 유형: ${contentType}
언어: ${language}
단어 수: 약 ${wordCount}단어

요구사항:
- SEO 최적화 (키워드 포함)
- 독자에게 가치 있는 정보
- 읽기 쉬운 구조
- 매력적인 제목
- 메타 설명 포함

다음 JSON 형식으로 응답해주세요:
{
  "title": "블로그 포스트 제목 (SEO 최적화)",
  "content": "블로그 포스트 본문 (HTML 형식 가능)",
  "excerpt": "요약 (150자 이내)",
  "tags": ["태그1", "태그2", "태그3"],
  "category": "카테고리",
  "seoKeywords": ["키워드1", "키워드2", "키워드3"]
}`
}

/**
 * AI 응답 파싱
 */
function parseBlogResponse(aiResponse: any, topic: string, language: string): BlogPost {
  let blogPost: any

  try {
    if (aiResponse.choices?.[0]?.message?.content) {
      const responseText = aiResponse.choices[0].message.content
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      blogPost = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText)
    } else if (aiResponse.content?.[0]?.text) {
      const responseText = aiResponse.content[0].text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      blogPost = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText)
    } else {
      throw new Error('Invalid AI response format')
    }
  } catch (error) {
    logger.warn('블로그 응답 파싱 실패, 기본값 사용:', error)
    blogPost = {
      title: `${topic} - 완전 가이드`,
      content: `${topic}에 대한 종합 가이드입니다.`,
      excerpt: `${topic}에 대한 유용한 정보를 제공합니다.`,
      tags: [topic],
      category: '일반',
      seoKeywords: [topic]
    }
  }

  return {
    ...blogPost,
    language
  }
}

