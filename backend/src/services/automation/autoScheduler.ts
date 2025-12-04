/**
 * ⏰ 자동 예약 스케줄러
 * 매일/매주 자동 콘텐츠 생성 및 배포
 */

import cron from 'node-cron'
import { logger } from '../../utils/logger'
import { trendAnalyzer } from '../trends/trendAnalyzer'
import { advancedVideoGenerator } from '../video/advancedVideoGenerator'
import { socialMediaUploader, UploadCredentials } from '../social/socialMediaUploader'
import { getPrismaClient } from '../../utils/database'

export interface ScheduleConfig {
  userId: string
  frequency: 'daily' | 'weekly' | 'custom'
  count: number           // 생성할 콘텐츠 수
  time: string            // "08:30" 형식
  platforms: ('youtube' | 'tiktok' | 'instagram')[]
  autoSelect: boolean     // AI가 자동 선택할지
  credentials: UploadCredentials
}

class AutoScheduler {
  private schedules: Map<string, cron.ScheduledTask> = new Map()

  /**
   * 📅 스케줄 등록
   */
  registerSchedule(config: ScheduleConfig) {
    const scheduleId = `${config.userId}-${Date.now()}`

    // Cron 표현식 생성
    const cronExpression = this.getCronExpression(config.frequency, config.time)

    logger.info(`📅 스케줄 등록: ${config.frequency} ${config.time}, ${config.count}개`)

    // Cron 작업 생성
    const task = cron.schedule(cronExpression, async () => {
      await this.executeSchedule(config)
    })

    this.schedules.set(scheduleId, task)

    return {
      success: true,
      scheduleId,
      nextRun: this.getNextRunTime(cronExpression)
    }
  }

  /**
   * ⚙️ 스케줄 실행
   */
  private async executeSchedule(config: ScheduleConfig) {
    try {
      logger.info('🚀 자동 스케줄 실행 시작')

      // 1. 오늘의 추천 받기
      const recommendations = await trendAnalyzer.getDailyRecommendations()
      
      // 2. 상위 N개 주제 선택
      const selectedTopics = recommendations.recommendations.slice(0, config.count)

      logger.info(`📝 선택된 주제: ${selectedTopics.map(t => t.topic).join(', ')}`)

      // 3. 각 주제로 콘텐츠 생성
      const results = await Promise.all(
        selectedTopics.map(async (topic) => {
          try {
            // 비디오 생성
            const video = await advancedVideoGenerator.generateVideo({
              prompt: topic.topic,
              duration: 30,
              style: 'cinematic',
              quality: 'high'
            })

            if (!video.success) {
              return { success: false, topic: topic.topic, error: video.error }
            }

            // 소셜 미디어 업로드
            const uploadResults = await socialMediaUploader.uploadToAll(
              video.videoPath!,
              config.credentials,
              {
                title: topic.topic,
                description: `${topic.reason}\n\n#${topic.keywords.join(' #')}`,
                tags: topic.keywords,
                hashtags: topic.keywords,
                privacy: 'public'
              },
              config.platforms
            )

            return {
              success: true,
              topic: topic.topic,
              uploads: uploadResults
            }
          } catch (error: any) {
            return {
              success: false,
              topic: topic.topic,
              error: error.message
            }
          }
        })
      )

      // 4. 결과 저장
      const prisma = getPrismaClient()
      
      for (const result of results) {
        if (result.success) {
          logger.info(`✅ 자동 생성 완료: ${result.topic}`)
        } else {
          logger.error(`❌ 자동 생성 실패: ${result.topic} - ${result.error}`)
        }
      }

      logger.info(`🎉 자동 스케줄 완료: ${results.filter(r => r.success).length}/${config.count}`)
    } catch (error: any) {
      logger.error('자동 스케줄 실행 실패:', error)
    }
  }

  /**
   * 🕐 Cron 표현식 생성
   */
  private getCronExpression(frequency: string, time: string): string {
    const [hour, minute] = time.split(':').map(Number)

    switch (frequency) {
      case 'daily':
        return `${minute} ${hour} * * *` // 매일 지정 시간
      case 'weekly':
        return `${minute} ${hour} * * 1` // 매주 월요일
      default:
        return `${minute} ${hour} * * *`
    }
  }

  /**
   * ⏰ 다음 실행 시간
   */
  private getNextRunTime(cronExpression: string): Date {
    // 간단한 계산 (실제로는 cron-parser 사용)
    const now = new Date()
    const [minute, hour] = cronExpression.split(' ').map(Number)
    
    const next = new Date(now)
    next.setHours(hour, minute, 0, 0)
    
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }
    
    return next
  }

  /**
   * 🗑️ 스케줄 취소
   */
  cancelSchedule(scheduleId: string) {
    const task = this.schedules.get(scheduleId)
    
    if (task) {
      task.stop()
      this.schedules.delete(scheduleId)
      logger.info(`🗑️ 스케줄 취소: ${scheduleId}`)
      return { success: true }
    }

    return { success: false, error: '스케줄을 찾을 수 없습니다' }
  }

  /**
   * 📋 모든 스케줄 조회
   */
  getAllSchedules() {
    return Array.from(this.schedules.keys())
  }
}

// 싱글톤
export const autoScheduler = new AutoScheduler()
export default autoScheduler

