import { logger } from '../../utils/logger'
import { generateContent } from '../contentGenerator'
import { generateEbook } from '../ebook/generator'
import { generatePDF, generateEPUB } from '../ebook/formatter'
import { createGumroadProduct } from '../sales/gumroad'
import { generateBlogPost } from '../blog/generator'
import { translateBlogPost } from '../blog/translator'
import { publishToWordPress, publishToMedium, publishToBlogger } from '../blog/publisher'
import { uploadToPlatforms } from '../uploadService'
import { trackRevenue } from '../revenue/tracker'
import { notificationService } from '../notifications/notificationService'
import { analytics } from '../analytics/realTimeAnalytics'
import { smartScheduler } from './smartScheduler'
import { ContentType } from '../../../types'

export interface AutomationConfig {
  // 기본 설정
  topic: string
  contentType: ContentType
  text?: string
  
  // YouTube Shorts 설정
  enableYouTube?: boolean
  youtubePlatforms?: string[]
  
  // E-book 설정
  enableEbook?: boolean
  ebookPrice?: number
  ebookLanguage?: string
  ebookChapterCount?: number
  ebookPlatforms?: string[] // gumroad, etsy, amazon
  
  // 블로그 설정
  enableBlog?: boolean
  blogLanguages?: string[] // 다국어 자동 번역
  blogPlatforms?: string[] // wordpress, medium, blogger
  blogWordCount?: number
  
  // 플랫폼 인증 정보
  credentials?: {
    youtube?: any
    gumroad?: { accessToken: string }
    etsy?: { accessToken: string }
    wordpress?: { siteUrl: string; username: string; password: string }
    medium?: { accessToken: string; userId: string }
    blogger?: { blogId: string; accessToken: string }
  }
}

export interface AutomationResult {
  success: boolean
  steps: AutomationStep[]
  totalTime: number
  revenue?: {
    estimated: number
    platforms: Record<string, number>
  }
}

export interface AutomationStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  message?: string
  data?: any
  error?: string
}

/**
 * 원클릭 자동화 오케스트레이터
 * 주제만 입력하면 모든 플랫폼에 자동으로 콘텐츠 생성 및 배포
 */
export async function automateEverything(
  config: AutomationConfig
): Promise<AutomationResult> {
  const startTime = Date.now()
  const steps: AutomationStep[] = []
  
  logger.info('🚀 원클릭 자동화 시작:', config.topic)

  try {
    // 1단계: YouTube Shorts 생성
    if (config.enableYouTube !== false) {
      steps.push({ name: 'YouTube Shorts 생성', status: 'running' })
      try {
        const formData = {
          topic: config.topic,
          contentType: config.contentType,
          contentTime: 60,
          contentFormat: ['video', 'text'],
          text: config.text || ''
        }
        
        const contents = await generateContent(formData)
        steps[steps.length - 1] = {
          name: 'YouTube Shorts 생성',
          status: 'completed',
          message: `${contents.length}개 버전 생성 완료`,
          data: { count: contents.length }
        }

        // YouTube 업로드
        if (config.youtubePlatforms && config.youtubePlatforms.length > 0 && contents.length > 0) {
          steps.push({ name: 'YouTube 업로드', status: 'running' })
          try {
            const { uploadToPlatforms } = await import('../uploadService')
            await uploadToPlatforms(contents[0].id, config.youtubePlatforms.map(p => ({
              platform: p,
              credentials: config.credentials?.youtube
            })))
            
            steps[steps.length - 1] = {
              name: 'YouTube 업로드',
              status: 'completed',
              message: `${config.youtubePlatforms.length}개 플랫폼에 업로드 완료`
            }
          } catch (error: any) {
            steps[steps.length - 1] = {
              name: 'YouTube 업로드',
              status: 'failed',
              error: error.message
            }
          }
        }
      } catch (error: any) {
        steps[steps.length - 1] = {
          name: 'YouTube Shorts 생성',
          status: 'failed',
          error: error.message
        }
      }
    }

    // 2단계: E-book 생성 및 판매
    if (config.enableEbook) {
      steps.push({ name: 'E-book 생성', status: 'running' })
      try {
        const ebookData = await generateEbook(
          config.topic,
          config.contentType,
          config.ebookLanguage || 'ko',
          config.ebookChapterCount || 10
        )

        // PDF/EPUB 생성
        const pdfPath = `./uploads/ebooks/${Date.now()}.pdf`
        const epubPath = `./uploads/ebooks/${Date.now()}.epub`
        
        await generatePDF(ebookData, pdfPath)
        await generateEPUB(ebookData, epubPath)

        steps[steps.length - 1] = {
          name: 'E-book 생성',
          status: 'completed',
          message: `${ebookData.chapters.length}개 챕터 생성 완료`,
          data: { title: ebookData.title, chapters: ebookData.chapters.length }
        }

        // E-book 판매 플랫폼에 게시
        if (config.ebookPlatforms && config.ebookPlatforms.length > 0) {
          for (const platform of config.ebookPlatforms) {
            steps.push({ name: `E-book ${platform} 게시`, status: 'running' })
            try {
              if (platform === 'gumroad' && config.credentials?.gumroad) {
                const result = await createGumroadProduct({
                  name: ebookData.title,
                  description: ebookData.description,
                  price: config.ebookPrice || 9.99,
                  file: pdfPath,
                  tags: ebookData.keywords
                }, config.credentials.gumroad.accessToken)

                steps[steps.length - 1] = {
                  name: `E-book ${platform} 게시`,
                  status: 'completed',
                  message: '게시 완료',
                  data: { url: result.url }
                }

                // 수익 추적
                await trackRevenue('gumroad', config.ebookPrice || 9.99, result.productId, ebookData.title)
              } else {
                steps[steps.length - 1] = {
                  name: `E-book ${platform} 게시`,
                  status: 'failed',
                  error: '인증 정보가 없습니다'
                }
              }
            } catch (error: any) {
              steps[steps.length - 1] = {
                name: `E-book ${platform} 게시`,
                status: 'failed',
                error: error.message
              }
            }
          }
        }
      } catch (error: any) {
        steps[steps.length - 1] = {
          name: 'E-book 생성',
          status: 'failed',
          error: error.message
        }
      }
    }

    // 3단계: 블로그 포스트 생성 및 게시
    if (config.enableBlog) {
      const blogLanguages = config.blogLanguages || ['ko']
      
      for (const language of blogLanguages) {
        steps.push({ name: `블로그 포스트 생성 (${language})`, status: 'running' })
        try {
          let blogPost = await generateBlogPost(
            config.topic,
            config.contentType,
            language,
            config.blogWordCount || 1000
          )

          // 번역이 필요한 경우
          if (language !== 'ko' && blogPost.language === 'ko') {
            blogPost = await translateBlogPost(blogPost, language)
          }

          steps[steps.length - 1] = {
            name: `블로그 포스트 생성 (${language})`,
            status: 'completed',
            message: '생성 완료',
            data: { title: blogPost.title }
          }

          // 블로그 플랫폼에 게시
          if (config.blogPlatforms && config.blogPlatforms.length > 0) {
            for (const platform of config.blogPlatforms) {
              steps.push({ name: `블로그 ${platform} 게시 (${language})`, status: 'running' })
              try {
                let result: any

                switch (platform) {
                  case 'wordpress':
                    if (config.credentials?.wordpress) {
                      result = await publishToWordPress(
                        blogPost,
                        config.credentials.wordpress.siteUrl,
                        config.credentials.wordpress.username,
                        config.credentials.wordpress.password
                      )
                    }
                    break

                  case 'medium':
                    if (config.credentials?.medium) {
                      result = await publishToMedium(
                        blogPost,
                        config.credentials.medium.accessToken,
                        config.credentials.medium.userId
                      )
                    }
                    break

                  case 'blogger':
                    if (config.credentials?.blogger) {
                      result = await publishToBlogger(
                        blogPost,
                        config.credentials.blogger.blogId,
                        config.credentials.blogger.accessToken
                      )
                    }
                    break
                }

                if (result) {
                  steps[steps.length - 1] = {
                    name: `블로그 ${platform} 게시 (${language})`,
                    status: 'completed',
                    message: '게시 완료',
                    data: { url: result.url }
                  }
                } else {
                  steps[steps.length - 1] = {
                    name: `블로그 ${platform} 게시 (${language})`,
                    status: 'failed',
                    error: '인증 정보가 없습니다'
                  }
                }
              } catch (error: any) {
                steps[steps.length - 1] = {
                  name: `블로그 ${platform} 게시 (${language})`,
                  status: 'failed',
                  error: error.message
                }
              }
            }
          }
        } catch (error: any) {
          steps[steps.length - 1] = {
            name: `블로그 포스트 생성 (${language})`,
            status: 'failed',
            error: error.message
          }
        }
      }
    }

    // 수익 추정
    const revenue = estimateRevenue(steps)

    const totalTime = Date.now() - startTime
    logger.info('✅ 원클릭 자동화 완료:', { totalTime, steps: steps.length })

    // 알림 전송
    if (config.credentials?.userId) {
      await notificationService.notifySuccess(
        config.credentials.userId,
        '자동화 완료',
        `모든 플랫폼에 콘텐츠가 성공적으로 배포되었습니다. 예상 수익: $${revenue.estimated.toFixed(2)}`
      )
    }

    // 통계 기록
    const completedSteps = steps.filter(s => s.status === 'completed')
    if (completedSteps.length > 0 && completedSteps[0].data?.contentId) {
      await analytics.recordAnalytics({
        contentId: completedSteps[0].data.contentId,
        platform: 'youtube',
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        revenue: revenue.estimated,
        engagement: 0,
        reach: 0,
        impressions: 0
      })
    }

    return {
      success: true,
      steps,
      totalTime,
      revenue
    }

  } catch (error: any) {
    logger.error('❌ 원클릭 자동화 실패:', error)
    
    // 실패 알림
    if (config.credentials?.userId) {
      await notificationService.notifyError(
        config.credentials.userId,
        '자동화 실패',
        `자동화 중 오류가 발생했습니다: ${error.message}`
      )
    }

    return {
      success: false,
      steps,
      totalTime: Date.now() - startTime,
      revenue: estimateRevenue(steps)
    }
  }
}

/**
 * 수익 추정
 */
function estimateRevenue(steps: AutomationStep[]): {
  estimated: number
  platforms: Record<string, number>
} {
  const platforms: Record<string, number> = {}
  let total = 0

  // E-book 판매 추정
  const ebookSales = steps.filter(s => s.name.includes('E-book') && s.status === 'completed')
  ebookSales.forEach(() => {
    platforms.gumroad = (platforms.gumroad || 0) + 9.99
    total += 9.99
  })

  // YouTube 추정 (광고 수익)
  const youtubeUploads = steps.filter(s => s.name.includes('YouTube') && s.status === 'completed')
  youtubeUploads.forEach(() => {
    platforms.youtube = (platforms.youtube || 0) + 10
    total += 10
  })

  // 블로그 추정
  const blogPosts = steps.filter(s => s.name.includes('블로그') && s.status === 'completed')
  blogPosts.forEach(() => {
    platforms.blog = (platforms.blog || 0) + 5
    total += 5
  })

  return {
    estimated: total,
    platforms
  }
}

