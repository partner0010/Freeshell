import { ContentType } from '../types'
import { logger } from '../utils/logger'
import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import { getPrismaClient } from '../utils/database'
import { getCache, setCache, createCacheKey } from '../utils/cache'

export interface ThumbnailOptions {
  style?: 'minimal' | 'bold' | 'gradient' | 'dark' | 'bright'
  includeText?: boolean
  textColor?: string
  backgroundColor?: string
  aspectRatio?: '16:9' | '9:16' | '1:1'
}

export interface ThumbnailVariant {
  id: string
  url: string
  style: string
  score?: number
  testResults?: {
    clicks?: number
    views?: number
    ctr?: number
  }
}

/**
 * AI 썸네일 생성 및 최적화 시스템
 */
export class ThumbnailGenerator {
  private openaiApiKey?: string
  private dalleApiKey?: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    this.dalleApiKey = process.env.DALLE_API_KEY || this.openaiApiKey
  }

  /**
   * AI 기반 썸네일 생성 (강화 버전)
   */
  async generateThumbnail(
    title: string,
    contentType: ContentType,
    options: ThumbnailOptions = {}
  ): Promise<string> {
    try {
      // 캐시 확인
      const cacheKey = createCacheKey('thumbnail', title, contentType)
      const cached = await getCache<string>(cacheKey)
      if (cached) {
        logger.info('썸네일 캐시에서 조회')
        return cached
      }

      // AI 이미지 생성 시도
      if (this.dalleApiKey) {
        try {
          const aiThumbnail = await this.generateWithDALLE(title, contentType, options)
          if (aiThumbnail) {
            await setCache(cacheKey, aiThumbnail, 86400) // 24시간 캐시
            return aiThumbnail
          }
        } catch (error) {
          logger.warn('DALL-E 썸네일 생성 실패, 대체 방법 사용:', error)
        }
      }

      // 대체 방법: 템플릿 기반 썸네일 생성
      return await this.generateWithTemplate(title, contentType, options)

    } catch (error) {
      logger.error('썸네일 생성 실패:', error)
      return this.getPlaceholderThumbnail(title)
    }
  }

  /**
   * DALL-E를 사용한 AI 썸네일 생성
   */
  private async generateWithDALLE(
    title: string,
    contentType: ContentType,
    options: ThumbnailOptions
  ): Promise<string | null> {
    if (!this.openaiApiKey) return null

    try {
      const prompt = this.buildThumbnailPrompt(title, contentType, options)
      
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: options.aspectRatio === '9:16' ? '1024x1792' : 
                options.aspectRatio === '1:1' ? '1024x1024' : '1792x1024',
          quality: 'standard',
          style: 'vivid'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      )

      const imageUrl = response.data.data[0]?.url
      if (imageUrl) {
        // 이미지 다운로드 및 저장
        return await this.downloadAndSaveThumbnail(imageUrl, title)
      }

      return null
    } catch (error: any) {
      logger.error('DALL-E 썸네일 생성 오류:', error.message)
      return null
    }
  }

  /**
   * 썸네일 프롬프트 생성
   */
  private buildThumbnailPrompt(
    title: string,
    contentType: ContentType,
    options: ThumbnailOptions
  ): string {
    const stylePrompts: Record<string, string> = {
      minimal: 'minimalist design, clean, simple, modern',
      bold: 'bold colors, high contrast, eye-catching',
      gradient: 'gradient background, vibrant colors',
      dark: 'dark theme, dramatic lighting',
      bright: 'bright, cheerful, colorful'
    }

    const contentTypePrompts: Record<string, string> = {
      'daily-talk': 'casual, friendly, relatable',
      'education': 'professional, informative, clear',
      'tips': 'helpful, practical, easy to understand',
      'how-to': 'step-by-step, instructional, clear',
      'entertainment': 'fun, engaging, exciting',
      'tutorial': 'educational, detailed, professional',
      'storytelling': 'narrative, engaging, emotional'
    }

    const style = stylePrompts[options.style || 'bold'] || stylePrompts.bold
    const contentTypePrompt = contentTypePrompts[contentType] || 'engaging'
    
    let prompt = `Create a YouTube thumbnail for "${title}". `
    prompt += `Style: ${style}, ${contentTypePrompt}. `
    prompt += `High quality, professional, eye-catching thumbnail. `
    
    if (options.includeText !== false) {
      prompt += `Include the title text prominently. `
    }
    
    prompt += `No text overlay (text will be added separately). `
    prompt += `Optimized for click-through rate.`

    return prompt
  }

  /**
   * 템플릿 기반 썸네일 생성 (대체 방법)
   */
  private async generateWithTemplate(
    title: string,
    contentType: ContentType,
    options: ThumbnailOptions
  ): Promise<string> {
    // Canvas나 이미지 라이브러리를 사용한 템플릿 기반 생성
    // 여기서는 향상된 placeholder 반환
    
    const thumbnailDir = './uploads/thumbnails'
    await fs.mkdir(thumbnailDir, { recursive: true })
    
    // 향상된 placeholder URL (더 나은 디자인)
    const encodedTitle = encodeURIComponent(title.substring(0, 30))
    const style = options.style || 'bold'
    const bgColor = options.backgroundColor || this.getDefaultBackgroundColor(contentType, style)
    const textColor = options.textColor || '#ffffff'
    
    const placeholderUrl = `https://via.placeholder.com/400x600/${bgColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodedTitle}`
    
    logger.info('템플릿 썸네일 생성:', placeholderUrl)
    return placeholderUrl
  }

  /**
   * 기본 배경색 가져오기
   */
  private getDefaultBackgroundColor(contentType: ContentType, style: string): string {
    const colorMap: Record<string, Record<string, string>> = {
      'daily-talk': {
        bold: '#FF6B6B',
        minimal: '#4ECDC4',
        gradient: '#FF6B6B'
      },
      'education': {
        bold: '#4A90E2',
        minimal: '#7B68EE',
        gradient: '#4A90E2'
      },
      'tips': {
        bold: '#FFD93D',
        minimal: '#FFA07A',
        gradient: '#FFD93D'
      },
      'how-to': {
        bold: '#6BCF7F',
        minimal: '#95E1D3',
        gradient: '#6BCF7F'
      },
      'entertainment': {
        bold: '#FF6B9D',
        minimal: '#C44569',
        gradient: '#FF6B9D'
      }
    }

    return colorMap[contentType]?.[style] || colorMap['daily-talk']?.[style] || '#0ea5e9'
  }

  /**
   * 이미지 다운로드 및 저장
   */
  private async downloadAndSaveThumbnail(imageUrl: string, title: string): Promise<string> {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      })

      const thumbnailDir = './uploads/thumbnails'
      await fs.mkdir(thumbnailDir, { recursive: true })

      const filename = `thumbnail_${Date.now()}_${title.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}.png`
      const filepath = path.join(thumbnailDir, filename)

      await fs.writeFile(filepath, Buffer.from(response.data))
      logger.info('썸네일 저장 완료:', filepath)

      // 상대 경로 반환 (또는 URL)
      return `/uploads/thumbnails/${filename}`
    } catch (error) {
      logger.error('썸네일 다운로드 실패:', error)
      throw error
    }
  }

  /**
   * Placeholder 썸네일
   */
  private getPlaceholderThumbnail(title: string): string {
    const encodedTitle = encodeURIComponent(title.substring(0, 20))
    return `https://via.placeholder.com/400x600/0ea5e9/ffffff?text=${encodedTitle}`
  }

  /**
   * 여러 버전의 썸네일 생성 (A/B 테스트용)
   */
  async generateThumbnailVariants(
    title: string,
    contentType: ContentType,
    count: number = 3
  ): Promise<ThumbnailVariant[]> {
    const variants: ThumbnailVariant[] = []
    const styles: Array<ThumbnailOptions['style']> = ['bold', 'minimal', 'gradient', 'dark', 'bright']

    for (let i = 0; i < Math.min(count, styles.length); i++) {
      const style = styles[i]
      const thumbnail = await this.generateThumbnail(title, contentType, { style })
      
      variants.push({
        id: `variant_${i + 1}`,
        url: thumbnail,
        style: style || 'bold'
      })
    }

    return variants
  }

  /**
   * 썸네일 성과 분석 및 최적화
   */
  async analyzeThumbnailPerformance(contentId: string): Promise<{
    bestThumbnail: string
    recommendations: string[]
  }> {
    const prisma = getPrismaClient()

    // 콘텐츠의 썸네일과 성과 조회
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        versions: true,
        uploads: true
      }
    })

    if (!content || content.versions.length === 0) {
      return {
        bestThumbnail: '',
        recommendations: ['콘텐츠 데이터가 없습니다']
      }
    }

    // 버전별 성과 분석
    const versionPerformance = content.versions.map(version => ({
      versionId: version.id,
      thumbnail: version.thumbnail,
      views: content.uploads.reduce((sum, u) => sum + (u.views || 0), 0),
      likes: content.uploads.reduce((sum, u) => sum + (u.likes || 0), 0)
    }))

    // 최고 성과 썸네일 찾기
    const bestVersion = versionPerformance.reduce((best, current) => {
      const currentScore = current.views + current.likes * 10
      const bestScore = best.views + best.likes * 10
      return currentScore > bestScore ? current : best
    })

    // 추천 사항 생성
    const recommendations: string[] = []
    
    if (bestVersion.thumbnail) {
      recommendations.push(`현재 최고 성과 썸네일: ${bestVersion.thumbnail}`)
    }

    // 성과가 낮으면 개선 제안
    const averageViews = versionPerformance.reduce((sum, v) => sum + v.views, 0) / versionPerformance.length
    if (bestVersion.views < averageViews * 1.2) {
      recommendations.push('더 눈에 띄는 색상과 대비를 사용해보세요')
      recommendations.push('제목 텍스트를 더 크고 명확하게 표시하세요')
      recommendations.push('감정을 자극하는 이미지나 아이콘을 추가하세요')
    }

    return {
      bestThumbnail: bestVersion.thumbnail,
      recommendations
    }
  }

  /**
   * 플랫폼별 최적화된 썸네일 생성
   */
  async generatePlatformOptimizedThumbnail(
    title: string,
    contentType: ContentType,
    platform: 'youtube' | 'tiktok' | 'instagram'
  ): Promise<string> {
    const platformOptions: Record<string, ThumbnailOptions> = {
      youtube: {
        style: 'bold',
        aspectRatio: '16:9',
        includeText: true
      },
      tiktok: {
        style: 'bright',
        aspectRatio: '9:16',
        includeText: false
      },
      instagram: {
        style: 'minimal',
        aspectRatio: '1:1',
        includeText: true
      }
    }

    const options = platformOptions[platform] || platformOptions.youtube
    return await this.generateThumbnail(title, contentType, options)
  }
}

// 기존 함수 호환성 유지
export async function generateThumbnail(
  title: string,
  contentType: ContentType
): Promise<string> {
  const generator = new ThumbnailGenerator()
  return await generator.generateThumbnail(title, contentType)
}

export const thumbnailGenerator = new ThumbnailGenerator()
