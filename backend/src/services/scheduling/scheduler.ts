import cron from 'node-cron'
import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { automateEverything, AutomationConfig } from '../automation/orchestrator'
import { ContentType } from '../../types'

/**
 * 스케줄러 관리 클래스
 */
export class ContentScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map()
  private isRunning = false

  /**
   * 스케줄러 시작
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('스케줄러가 이미 실행 중입니다')
      return
    }

    logger.info('스케줄러 시작...')
    this.isRunning = true

    // 활성화된 모든 스케줄 로드
    await this.loadSchedules()

    // 매 분마다 실행할 스케줄 확인
    cron.schedule('* * * * *', async () => {
      await this.checkAndExecuteSchedules()
    })

    logger.info('✅ 스케줄러 시작 완료')
  }

  /**
   * 스케줄러 중지
   */
  stop(): void {
    this.tasks.forEach((task) => task.stop())
    this.tasks.clear()
    this.isRunning = false
    logger.info('스케줄러 중지됨')
  }

  /**
   * 활성화된 스케줄 로드
   */
  private async loadSchedules(): Promise<void> {
    const prisma = getPrismaClient()
    const schedules = await prisma.schedule.findMany({
      where: { isActive: true }
    })

    for (const schedule of schedules) {
      await this.scheduleTask(schedule)
    }

    logger.info(`${schedules.length}개의 스케줄 로드됨`)
  }

  /**
   * 스케줄 작업 등록
   */
  async scheduleTask(schedule: any): Promise<void> {
    const prisma = getPrismaClient()

    // 기존 작업이 있으면 제거
    if (this.tasks.has(schedule.id)) {
      this.tasks.get(schedule.id)?.stop()
      this.tasks.delete(schedule.id)
    }

    // Cron 표현식 생성
    const cronExpression = this.generateCronExpression(schedule)
    if (!cronExpression) {
      logger.warn(`스케줄 ${schedule.id}의 cron 표현식을 생성할 수 없습니다`)
      return
    }

    // Cron 작업 생성
    const task = cron.schedule(cronExpression, async () => {
      await this.executeSchedule(schedule.id)
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul'
    })

    this.tasks.set(schedule.id, task)
    logger.info(`스케줄 등록됨: ${schedule.name} (${cronExpression})`)
  }

  /**
   * Cron 표현식 생성
   */
  private generateCronExpression(schedule: any): string | null {
    if (schedule.cronExpression) {
      return schedule.cronExpression
    }

    switch (schedule.frequency) {
      case 'daily':
        // 매일 특정 시간 (기본: 오전 9시)
        const hour = schedule.settings ? JSON.parse(schedule.settings).hour || 9 : 9
        return `0 ${hour} * * *`
      
      case 'weekly':
        // 매주 특정 요일 (기본: 월요일)
        const dayOfWeek = schedule.settings ? JSON.parse(schedule.settings).dayOfWeek || 1 : 1
        return `0 9 * * ${dayOfWeek}`
      
      case 'monthly':
        // 매월 1일
        return `0 9 1 * *`
      
      default:
        return null
    }
  }

  /**
   * 실행할 스케줄 확인 및 실행
   */
  private async checkAndExecuteSchedules(): Promise<void> {
    const prisma = getPrismaClient()
    const now = new Date()

    const schedules = await prisma.schedule.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: now
        }
      }
    })

    for (const schedule of schedules) {
      await this.executeSchedule(schedule.id)
    }
  }

  /**
   * 스케줄 실행
   */
  private async executeSchedule(scheduleId: string): Promise<void> {
    const prisma = getPrismaClient()

    try {
      const schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId }
      })

      if (!schedule || !schedule.isActive) {
        return
      }

      logger.info(`스케줄 실행 시작: ${schedule.name}`)

      // 실행 기록 생성
      const execution = await prisma.scheduleExecution.create({
        data: {
          scheduleId: schedule.id,
          status: 'running'
        }
      })

      // 자동화 설정
      const platforms = schedule.platforms ? JSON.parse(schedule.platforms) : ['youtube']
      const settings = schedule.settings ? JSON.parse(schedule.settings) : {}
      const contentCount = schedule.contentCount || 1 // 생성할 콘텐츠 개수

      logger.info(`스케줄 실행: ${contentCount}개 콘텐츠 생성 예정`)

      // 여러 개의 콘텐츠 생성 (병렬 처리로 빠르게)
      const { performanceOptimizer } = await import('../performance/performanceOptimizer')
      const results: any[] = []
      const contentIds: string[] = []

      // 콘텐츠 생성 작업들
      const contentTasks = Array.from({ length: contentCount }, async (_, index) => {
        // 주제 생성 (AI 제안 또는 트렌딩)
        let topic = schedule.topic
        if (!topic || schedule.topicSource !== 'manual') {
          topic = await this.generateTopic(schedule)
        }

        // 여러 개 생성 시 주제에 번호 추가
        const finalTopic = contentCount > 1 
          ? `${topic} (${index + 1}/${contentCount})`
          : topic

        const automationConfig: AutomationConfig = {
          topic: finalTopic || '자동 생성 주제',
          contentType: schedule.contentType as ContentType,
          enableYouTube: platforms.includes('youtube'),
          youtubePlatforms: platforms.filter((p: string) => p === 'youtube'),
          enableEbook: settings.enableEbook || false,
          enableBlog: settings.enableBlog || false
        }

        // 자동화 실행
        const result = await automateEverything(automationConfig)
        
        if (result.success && result.steps[0]?.data?.contentId) {
          contentIds.push(result.steps[0].data.contentId)
        }
        
        return result
      })

      // 병렬 처리로 여러 콘텐츠 동시 생성 (최대 5개씩)
      const batchSize = Math.min(contentCount, 5)
      for (let i = 0; i < contentTasks.length; i += batchSize) {
        const batch = contentTasks.slice(i, i + batchSize)
        const batchResults = await Promise.all(batch)
        results.push(...batchResults)
      }

      // 전체 결과 집계
      const result = {
        success: results.every(r => r.success),
        steps: results.flatMap(r => r.steps || []),
        contentIds,
        totalGenerated: contentIds.length
      }

      // 다음 실행 시간 계산
      const nextRunAt = this.calculateNextRun(schedule)

      // 스케줄 업데이트
      await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt
        }
      })

      // 실행 기록 업데이트
      await prisma.scheduleExecution.update({
        where: { id: execution.id },
        data: {
          status: result.success ? 'completed' : 'failed',
          completedAt: new Date(),
          contentId: contentIds.length > 0 ? contentIds[0] : null, // 첫 번째 콘텐츠 ID
          error: result.success ? null : `자동화 실패: ${results.filter(r => !r.success).length}개 실패`
        }
      })

      logger.info(`스케줄 실행 완료: ${contentIds.length}/${contentCount}개 콘텐츠 생성 및 업로드 완료`)

      logger.info(`스케줄 실행 완료: ${schedule.name}`)

    } catch (error: any) {
      logger.error(`스케줄 실행 실패 (${scheduleId}):`, error)
      
      try {
        await prisma.scheduleExecution.updateMany({
          where: { scheduleId, status: 'running' },
          data: {
            status: 'failed',
            completedAt: new Date(),
            error: error.message
          }
        })
      } catch (updateError) {
        logger.error('실행 기록 업데이트 실패:', updateError)
      }
    }
  }

  /**
   * 주제 생성 (AI 또는 트렌딩 기반)
   */
  private async generateTopic(schedule: any): Promise<string> {
    // 트렌딩 수집기 또는 AI 제안 사용
    try {
      if (schedule.topicSource === 'trending') {
        const { TrendCollector } = await import('../trends/collector')
        const trendCollector = new TrendCollector()
        const trends = await trendCollector.collectAllTrends('ko')
        
        if (trends.length > 0) {
          const topTrend = trends.sort((a, b) => b.popularity - a.popularity)[0]
          return topTrend.title
        }
      } else if (schedule.topicSource === 'ai-suggested') {
        // AI 기반 주제 생성
        const { generateContent } = await import('../contentGenerator')
        const contents = await generateContent({
          topic: schedule.topic || '인기 주제',
          contentType: schedule.contentType || 'daily-talk',
          contentTime: 60,
          contentFormat: ['text'],
          text: ''
        })
        
        if (contents.length > 0) {
          return contents[0].topic
        }
      }
    } catch (error) {
      logger.warn('주제 생성 실패, 기본 주제 사용:', error)
    }
    
    return schedule.topic || `자동 생성 주제 - ${new Date().toLocaleDateString()}`
  }

  /**
   * 다음 실행 시간 계산
   */
  private calculateNextRun(schedule: any): Date {
    const now = new Date()
    
    switch (schedule.frequency) {
      case 'daily':
        const nextDay = new Date(now)
        nextDay.setDate(nextDay.getDate() + 1)
        return nextDay
      
      case 'weekly':
        const nextWeek = new Date(now)
        nextWeek.setDate(nextWeek.getDate() + 7)
        return nextWeek
      
      case 'monthly':
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth
      
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 기본: 24시간 후
    }
  }

  /**
   * 스케줄 추가
   */
  async addSchedule(scheduleData: {
    userId?: string
    name: string
    contentType: string
    frequency: string
    cronExpression?: string
    platforms: string[]
    settings?: any
    contentCount?: number // 생성할 콘텐츠 개수
    autoUpload?: boolean // 자동 업로드 여부
  }): Promise<string> {
    const prisma = getPrismaClient()
    const nextRunAt = this.calculateInitialNextRun(scheduleData.frequency, scheduleData.cronExpression)

    const schedule = await prisma.schedule.create({
      data: {
        userId: scheduleData.userId,
        name: scheduleData.name,
        contentType: scheduleData.contentType,
        frequency: scheduleData.frequency,
        cronExpression: scheduleData.cronExpression,
        nextRunAt,
        contentCount: scheduleData.contentCount || 1,
        autoUpload: scheduleData.autoUpload !== undefined ? scheduleData.autoUpload : true,
        platforms: JSON.stringify(scheduleData.platforms),
        settings: scheduleData.settings ? JSON.stringify(scheduleData.settings) : null
      }
    })

    await this.scheduleTask(schedule)
    return schedule.id
  }

  /**
   * 초기 다음 실행 시간 계산
   */
  private calculateInitialNextRun(frequency: string, cronExpression?: string): Date {
    if (cronExpression) {
      // Cron 표현식 파싱하여 다음 실행 시간 계산
      // 간단한 구현 (실제로는 cron-parser 라이브러리 사용 권장)
      return new Date(Date.now() + 60 * 60 * 1000) // 1시간 후
    }

    const now = new Date()
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case 'monthly':
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }
  }
}

// 싱글톤 인스턴스
export const scheduler = new ContentScheduler()

