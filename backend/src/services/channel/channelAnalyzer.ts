/**
 * 성공 채널 분석 및 설정 복제 시스템
 * 유튜브, 인스타그램 등에서 성공적인 채널의 설정을 분석하고 자동으로 적용
 */

import axios from 'axios'
import { logger } from '../../utils/logger'
import { getPrismaClient } from '../../utils/database'
import puppeteer from 'puppeteer'
import { getCache, setCache, createCacheKey } from '../../utils/cache'

export interface ChannelSettings {
  profileImage?: string
  bannerImage?: string
  description: string
  keywords: string[]
  uploadSchedule: {
    days: string[]
    times: string[]
  }
  contentStyle: {
    thumbnailStyle: string
    titleFormat: string
    descriptionFormat: string
    hashtagStrategy: string
  }
  engagementStrategy: {
    callToAction: string
    interactionFrequency: string
    communityTab: boolean
  }
}

export interface ChannelAnalysis {
  channelId: string
  platform: 'youtube' | 'instagram' | 'tiktok'
  channelName: string
  subscriberCount?: number
  averageViews?: number
  averageLikes?: number
  uploadFrequency?: number
  bestPerformingContent?: {
    title: string
    views: number
    likes: number
  }[]
  settings: ChannelSettings
  successFactors: string[]
  recommendations: string[]
}

/**
 * 채널 분석기
 */
export class ChannelAnalyzer {
  /**
   * 채널 URL로부터 설정 분석
   */
  async analyzeChannel(
    channelUrl: string,
    platform: 'youtube' | 'instagram' | 'tiktok'
  ): Promise<ChannelAnalysis> {
    logger.info('채널 분석 시작:', { channelUrl, platform })

    // 캐시 확인
    const cacheKey = createCacheKey('channel_analysis', channelUrl, platform)
    const cached = await getCache<ChannelAnalysis>(cacheKey)
    if (cached) {
      logger.info('채널 분석 캐시에서 조회')
      return cached
    }

    try {
      let analysis: ChannelAnalysis

      switch (platform) {
        case 'youtube':
          analysis = await this.analyzeYouTubeChannel(channelUrl)
          break
        case 'instagram':
          analysis = await this.analyzeInstagramChannel(channelUrl)
          break
        case 'tiktok':
          analysis = await this.analyzeTikTokChannel(channelUrl)
          break
        default:
          throw new Error(`지원하지 않는 플랫폼: ${platform}`)
      }

      // 캐시 저장 (24시간)
      await setCache(cacheKey, analysis, 86400)

      return analysis
    } catch (error: any) {
      logger.error('채널 분석 실패:', error)
      throw new Error(`채널 분석 실패: ${error.message}`)
    }
  }

  /**
   * YouTube 채널 분석
   */
  private async analyzeYouTubeChannel(channelUrl: string): Promise<ChannelAnalysis> {
    logger.info('YouTube 채널 분석 시작:', channelUrl)

    // Puppeteer로 채널 페이지 스크래핑
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      await page.goto(channelUrl, { waitUntil: 'networkidle2', timeout: 30000 })

      // 채널 정보 추출
      const channelInfo = await page.evaluate(() => {
        const name = document.querySelector('#channel-name')?.textContent || 
                     document.querySelector('yt-formatted-string#text')?.textContent || 
                     'Unknown'
        
        const subscriberText = document.querySelector('#subscriber-count')?.textContent || 
                              document.querySelector('yt-formatted-string[id="subscriber-count"]')?.textContent || 
                              '0'
        const subscribers = parseInt(subscriberText.replace(/[^0-9]/g, '')) || 0

        const description = document.querySelector('#description')?.textContent || 
                           document.querySelector('yt-formatted-string[id="description"]')?.textContent || 
                           ''

        // 프로필 이미지
        const profileImg = document.querySelector('#avatar img')?.getAttribute('src') || 
                          document.querySelector('#channel-header-container img')?.getAttribute('src') || 
                          ''

        // 배너 이미지
        const bannerImg = document.querySelector('#banner img')?.getAttribute('src') || 
                         document.querySelector('#channel-header-container img')?.getAttribute('src') || 
                         ''

        return {
          name,
          subscribers,
          description,
          profileImg,
          bannerImg
        }
      })

      // 최근 비디오 분석
      const videos = await this.analyzeRecentVideos(page)

      // 업로드 스케줄 분석
      const uploadSchedule = await this.analyzeUploadSchedule(videos)

      // 콘텐츠 스타일 분석
      const contentStyle = await this.analyzeContentStyle(videos)

      // 성공 요인 분석
      const successFactors = this.analyzeSuccessFactors(videos, channelInfo)

      // 추천 사항 생성
      const recommendations = this.generateRecommendations(channelInfo, videos, contentStyle)

      await browser.close()

      return {
        channelId: this.extractChannelId(channelUrl),
        platform: 'youtube',
        channelName: channelInfo.name,
        subscriberCount: channelInfo.subscribers,
        averageViews: videos.length > 0 
          ? videos.reduce((sum, v) => sum + (v.views || 0), 0) / videos.length 
          : 0,
        averageLikes: videos.length > 0
          ? videos.reduce((sum, v) => sum + (v.likes || 0), 0) / videos.length
          : 0,
        uploadFrequency: uploadSchedule.days.length,
        bestPerformingContent: videos
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map(v => ({
            title: v.title || '',
            views: v.views || 0,
            likes: v.likes || 0
          })),
        settings: {
          profileImage: channelInfo.profileImg,
          bannerImage: channelInfo.bannerImg,
          description: channelInfo.description,
          keywords: this.extractKeywords(channelInfo.description, videos),
          uploadSchedule,
          contentStyle,
          engagementStrategy: {
            callToAction: this.analyzeCallToAction(videos),
            interactionFrequency: this.analyzeInteractionFrequency(videos),
            communityTab: true
          }
        },
        successFactors,
        recommendations
      }
    } catch (error) {
      await browser.close()
      throw error
    }
  }

  /**
   * 최근 비디오 분석
   */
  private async analyzeRecentVideos(page: any): Promise<any[]> {
    try {
      const videos = await page.evaluate(() => {
        const videoElements = Array.from(document.querySelectorAll('ytd-grid-video-renderer, ytd-video-renderer'))
        
        return videoElements.slice(0, 20).map((el: any) => {
          const titleEl = el.querySelector('#video-title')
          const title = titleEl?.textContent?.trim() || ''
          const viewsText = el.querySelector('#metadata-line span')?.textContent || '0'
          const views = parseInt(viewsText.replace(/[^0-9]/g, '')) || 0
          const likesText = el.querySelector('#top-level-buttons ytd-toggle-button-renderer')?.getAttribute('aria-label') || '0'
          const likes = parseInt(likesText.replace(/[^0-9]/g, '')) || 0
          const thumbnail = el.querySelector('img')?.getAttribute('src') || ''
          const publishedText = el.querySelector('#metadata-line span:last-child')?.textContent || ''
          
          return {
            title,
            views,
            likes,
            thumbnail,
            published: publishedText
          }
        }).filter((v: any) => v.title)
      })

      return videos
    } catch (error) {
      logger.warn('비디오 분석 실패:', error)
      return []
    }
  }

  /**
   * 업로드 스케줄 분석
   */
  private async analyzeUploadSchedule(videos: any[]): Promise<{
    days: string[]
    times: string[]
  }> {
    // 비디오 게시 시간 패턴 분석
    const dayCounts: Record<string, number> = {}
    const timeCounts: Record<string, number> = {}

    videos.forEach(video => {
      // 간단한 패턴 분석 (실제로는 더 정교한 분석 필요)
      const day = this.extractDayFromText(video.published)
      if (day) {
        dayCounts[day] = (dayCounts[day] || 0) + 1
      }
    })

    // 가장 빈번한 요일
    const topDays = Object.entries(dayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day)

    // 기본 시간대 추천
    const recommendedTimes = ['09:00', '12:00', '18:00', '21:00']

    return {
      days: topDays.length > 0 ? topDays : ['월', '수', '금'],
      times: recommendedTimes
    }
  }

  /**
   * 콘텐츠 스타일 분석
   */
  private analyzeContentStyle(videos: any[]): {
    thumbnailStyle: string
    titleFormat: string
    descriptionFormat: string
    hashtagStrategy: string
  } {
    if (videos.length === 0) {
      return {
        thumbnailStyle: 'bold',
        titleFormat: 'question',
        descriptionFormat: 'standard',
        hashtagStrategy: 'trending'
      }
    }

    // 제목 패턴 분석
    const titlePatterns = this.analyzeTitlePatterns(videos.map(v => v.title))
    
    // 썸네일 스타일 추론 (실제로는 이미지 분석 필요)
    const thumbnailStyle = this.inferThumbnailStyle(videos)

    return {
      thumbnailStyle,
      titleFormat: titlePatterns.mostCommon,
      descriptionFormat: 'standard',
      hashtagStrategy: 'trending'
    }
  }

  /**
   * 제목 패턴 분석
   */
  private analyzeTitlePatterns(titles: string[]): {
    mostCommon: string
    patterns: Record<string, number>
  } {
    const patterns: Record<string, number> = {
      question: 0,
      number: 0,
      howto: 0,
      secret: 0,
      review: 0
    }

    titles.forEach(title => {
      if (title.includes('?') || title.includes('왜') || title.includes('어떻게')) {
        patterns.question++
      }
      if (/\d+/.test(title)) {
        patterns.number++
      }
      if (title.toLowerCase().includes('how to') || title.includes('하는 법')) {
        patterns.howto++
      }
      if (title.includes('비밀') || title.includes('secret')) {
        patterns.secret++
      }
      if (title.includes('리뷰') || title.includes('review')) {
        patterns.review++
      }
    })

    const mostCommon = Object.entries(patterns)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'question'

    return { mostCommon, patterns }
  }

  /**
   * 썸네일 스타일 추론
   */
  private inferThumbnailStyle(videos: any[]): string {
    // 실제로는 이미지 분석이 필요하지만, 여기서는 기본값 반환
    // 향후 이미지 분석 API 연동 가능
    return 'bold'
  }

  /**
   * 성공 요인 분석
   */
  private analyzeSuccessFactors(videos: any[], channelInfo: any): string[] {
    const factors: string[] = []

    if (channelInfo.subscribers > 100000) {
      factors.push('대규모 구독자 기반')
    }

    if (videos.length > 0) {
      const avgViews = videos.reduce((sum, v) => sum + (v.views || 0), 0) / videos.length
      if (avgViews > 100000) {
        factors.push('높은 평균 조회수')
      }

      const engagementRate = videos.reduce((sum, v) => sum + (v.likes || 0), 0) / 
                            videos.reduce((sum, v) => sum + (v.views || 0), 1)
      if (engagementRate > 0.05) {
        factors.push('높은 참여율')
      }
    }

    if (videos.length >= 10) {
      factors.push('일정한 업로드 빈도')
    }

    return factors
  }

  /**
   * 추천 사항 생성
   */
  private generateRecommendations(
    channelInfo: any,
    videos: any[],
    contentStyle: any
  ): string[] {
    const recommendations: string[] = []

    recommendations.push(`썸네일 스타일: ${contentStyle.thumbnailStyle} 스타일 사용`)
    recommendations.push(`제목 형식: ${contentStyle.titleFormat} 패턴 활용`)
    
    if (videos.length > 0) {
      const bestVideo = videos.sort((a, b) => (b.views || 0) - (a.views || 0))[0]
      if (bestVideo) {
        recommendations.push(`최고 성과 비디오: "${bestVideo.title}" 스타일 참고`)
      }
    }

    return recommendations
  }

  /**
   * Instagram 채널 분석
   */
  private async analyzeInstagramChannel(channelUrl: string): Promise<ChannelAnalysis> {
    // Instagram 분석 구현 (비슷한 패턴)
    logger.info('Instagram 채널 분석:', channelUrl)
    
    // 기본 구조 반환 (실제 구현 필요)
    return {
      channelId: this.extractChannelId(channelUrl),
      platform: 'instagram',
      channelName: 'Instagram Channel',
      settings: {
        description: '',
        keywords: [],
        uploadSchedule: { days: [], times: [] },
        contentStyle: {
          thumbnailStyle: 'minimal',
          titleFormat: 'standard',
          descriptionFormat: 'standard',
          hashtagStrategy: 'trending'
        },
        engagementStrategy: {
          callToAction: 'standard',
          interactionFrequency: 'daily',
          communityTab: false
        }
      },
      successFactors: [],
      recommendations: []
    }
  }

  /**
   * TikTok 채널 분석
   */
  private async analyzeTikTokChannel(channelUrl: string): Promise<ChannelAnalysis> {
    // TikTok 분석 구현 (비슷한 패턴)
    logger.info('TikTok 채널 분석:', channelUrl)
    
    return {
      channelId: this.extractChannelId(channelUrl),
      platform: 'tiktok',
      channelName: 'TikTok Channel',
      settings: {
        description: '',
        keywords: [],
        uploadSchedule: { days: [], times: [] },
        contentStyle: {
          thumbnailStyle: 'bright',
          titleFormat: 'trending',
          descriptionFormat: 'short',
          hashtagStrategy: 'fyp'
        },
        engagementStrategy: {
          callToAction: 'trending',
          interactionFrequency: 'multiple',
          communityTab: false
        }
      },
      successFactors: [],
      recommendations: []
    }
  }

  /**
   * 채널 설정을 사용자 채널에 적용
   */
  async applyChannelSettings(
    userId: string,
    analysis: ChannelAnalysis,
    platform: 'youtube' | 'instagram' | 'tiktok'
  ): Promise<void> {
    logger.info('채널 설정 적용 시작:', { userId, platform })

    const prisma = getPrismaClient()

    // 플랫폼 설정 업데이트
    await prisma.platformConfig.upsert({
      where: {
        userId_platform: {
          userId,
          platform
        }
      },
      create: {
        userId,
        platform,
        email: null,
        username: null,
        channelId: analysis.channelId,
        isActive: true
      },
      update: {
        channelId: analysis.channelId
      }
    })

    // 템플릿으로 저장
    await prisma.contentTemplate.create({
      data: {
        userId,
        name: `${analysis.channelName} 스타일`,
        description: `성공 채널 "${analysis.channelName}"의 설정을 기반으로 한 템플릿`,
        category: 'channel-style',
        contentType: 'daily-talk',
        settings: JSON.stringify(analysis.settings),
        isPublic: false,
        isFavorite: true
      }
    })

    logger.info('채널 설정 적용 완료')
  }

  /**
   * 유틸리티 함수들
   */
  private extractChannelId(url: string): string {
    const patterns = [
      /youtube\.com\/channel\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/c\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/user\/([a-zA-Z0-9_-]+)/,
      /instagram\.com\/([a-zA-Z0-9_.]+)/,
      /tiktok\.com\/@([a-zA-Z0-9_.]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return url.split('/').pop() || 'unknown'
  }

  private extractKeywords(description: string, videos: any[]): string[] {
    const keywords = new Set<string>()
    
    // 설명에서 키워드 추출
    const words = description.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    words.forEach(word => keywords.add(word))

    // 비디오 제목에서 키워드 추출
    videos.forEach(video => {
      if (video.title) {
        const titleWords = video.title.toLowerCase().split(/\s+/).filter(w => w.length > 2)
        titleWords.forEach(word => keywords.add(word))
      }
    })

    return Array.from(keywords).slice(0, 20)
  }

  private extractDayFromText(text: string): string | null {
    const days = ['월', '화', '수', '목', '금', '토', '일']
    for (const day of days) {
      if (text.includes(day)) return day
    }
    return null
  }

  private analyzeCallToAction(videos: any[]): string {
    // 비디오 설명에서 CTA 패턴 분석
    return 'standard'
  }

  private analyzeInteractionFrequency(videos: any[]): string {
    // 업로드 빈도 기반
    if (videos.length >= 20) return 'daily'
    if (videos.length >= 10) return 'weekly'
    return 'monthly'
  }
}

export const channelAnalyzer = new ChannelAnalyzer()

