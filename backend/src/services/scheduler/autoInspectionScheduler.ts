/**
 * 자동 점검 스케줄러
 * 관리자가 예약한 시간에 매일 자동 실행
 */

import cron from 'node-cron'
import { logger } from '../../utils/logger'
import { getPrismaClient } from '../../utils/database'
import { autoInspector } from '../ai/autoInspector'
import { autoFixer } from '../ai/autoFixer'

export interface InspectionSchedule {
  id: string
  userId: string
  time: string // HH:mm 형식 (예: "02:00")
  enabled: boolean
  autoFix: boolean
  createdAt: Date
  updatedAt: Date
}

export class AutoInspectionScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map()

  /**
   * 스케줄러 시작
   */
  async start() {
    logger.info('📅 자동 점검 스케줄러 시작...')

    // 기존 스케줄 로드
    await this.loadSchedules()

    // 매일 자정에 스케줄 새로고침
    cron.schedule('0 0 * * *', async () => {
      await this.loadSchedules()
    })

    logger.info('✅ 자동 점검 스케줄러 시작 완료')
  }

  /**
   * 스케줄 로드
   */
  private async loadSchedules() {
    try {
      const prisma = getPrismaClient()

      // 기존 작업 중지
      this.tasks.forEach((task) => task.stop())
      this.tasks.clear()

      // 활성화된 스케줄 조회 (테이블이 없을 수 있음)
      let schedules: any[] = []
      
      try {
        schedules = await prisma.inspectionSchedule.findMany({
          where: { enabled: true },
        })
      } catch (error: any) {
        if (error.code === 'P2021') {
          logger.warn('⚠️ InspectionSchedule 테이블 없음 - 자동 점검 스케줄러 비활성화')
          return
        }
        throw error
      }

      // 각 스케줄에 대해 cron 작업 생성
      for (const schedule of schedules) {
        await this.scheduleInspection(schedule)
      }

      logger.info(`✅ ${schedules.length}개의 자동 점검 스케줄 로드 완료`)
    } catch (error) {
      logger.error('스케줄 로드 실패:', error)
    }
  }

  /**
   * 점검 스케줄 등록
   */
  async scheduleInspection(schedule: any) {
    try {
      const [hours, minutes] = schedule.time.split(':').map(Number)
      const cronExpression = `${minutes} ${hours} * * *` // 매일 지정 시간

      const task = cron.schedule(cronExpression, async () => {
        logger.info(`🔍 자동 점검 시작 (스케줄 ID: ${schedule.id})`)

        try {
          // 점검 실행
          const report = await autoInspector.runFullInspection()

          // 결과 저장
          const prisma = getPrismaClient()
          await prisma.inspectionReport.create({
            data: {
              scheduleId: schedule.id,
              score: report.overallScore,
              issuesCount: report.issues.length,
              securityIssuesCount: report.securityIssues.length,
              performanceIssuesCount: report.performanceIssues.length,
              stabilityIssuesCount: report.stabilityIssues.length,
              legalIssuesCount: report.legalIssues.length,
              report: JSON.stringify(report),
            },
          })

          // 자동 조치 실행
          if (schedule.autoFix) {
            logger.info('🔧 자동 조치 시작...')
            const fixResults = await autoFixer.autoFix(report.issues)
            const fixedCount = fixResults.filter((r) => r.fixed).length

            await prisma.inspectionReport.update({
              where: { id: report.timestamp.toString() },
              data: {
                fixedCount,
                fixResults: JSON.stringify(fixResults),
              },
            })

            logger.info(`✅ 자동 조치 완료: ${fixedCount}개 수정`)
          }

          // 최적화 실행
          if (schedule.optimize) {
            logger.info('⚡ 플랫폼 최적화 시작...')
            const optimizeResults = await autoFixer.optimizePlatform()
            logger.info(`✅ 최적화 완료: ${optimizeResults.filter((r) => r.fixed).length}개`)
          }

          logger.info(`✅ 자동 점검 완료 (점수: ${report.overallScore}/100)`)
        } catch (error) {
          logger.error('자동 점검 실행 실패:', error)
        }
      })

      this.tasks.set(schedule.id, task)
      logger.info(`✅ 스케줄 등록 완료: ${schedule.time} (ID: ${schedule.id})`)
    } catch (error) {
      logger.error('스케줄 등록 실패:', error)
    }
  }

  /**
   * 스케줄 생성
   */
  async createSchedule(
    userId: string,
    time: string,
    autoFix: boolean = true,
    optimize: boolean = true
  ) {
    try {
      const prisma = getPrismaClient()

      const schedule = await prisma.inspectionSchedule.create({
        data: {
          userId,
          time,
          enabled: true,
          autoFix,
          optimize,
        },
      })

      await this.scheduleInspection(schedule)
      return schedule
    } catch (error) {
      logger.error('스케줄 생성 실패:', error)
      throw error
    }
  }

  /**
   * 스케줄 업데이트
   */
  async updateSchedule(
    scheduleId: string,
    time?: string,
    enabled?: boolean,
    autoFix?: boolean,
    optimize?: boolean
  ) {
    try {
      const prisma = getPrismaClient()

      const updateData: any = {}
      if (time !== undefined) updateData.time = time
      if (enabled !== undefined) updateData.enabled = enabled
      if (autoFix !== undefined) updateData.autoFix = autoFix
      if (optimize !== undefined) updateData.optimize = optimize

      const schedule = await prisma.inspectionSchedule.update({
        where: { id: scheduleId },
        data: updateData,
      })

      // 기존 작업 중지
      const task = this.tasks.get(scheduleId)
      if (task) {
        task.stop()
        this.tasks.delete(scheduleId)
      }

      // 새로 등록
      if (schedule.enabled) {
        await this.scheduleInspection(schedule)
      }

      return schedule
    } catch (error) {
      logger.error('스케줄 업데이트 실패:', error)
      throw error
    }
  }

  /**
   * 스케줄 삭제
   */
  async deleteSchedule(scheduleId: string) {
    try {
      const prisma = getPrismaClient()

      // 작업 중지
      const task = this.tasks.get(scheduleId)
      if (task) {
        task.stop()
        this.tasks.delete(scheduleId)
      }

      // DB에서 삭제
      await prisma.inspectionSchedule.delete({
        where: { id: scheduleId },
      })

      logger.info(`✅ 스케줄 삭제 완료: ${scheduleId}`)
    } catch (error) {
      logger.error('스케줄 삭제 실패:', error)
      throw error
    }
  }

  /**
   * 모든 스케줄 조회
   */
  async getSchedules(userId?: string) {
    const prisma = getPrismaClient()

    return await prisma.inspectionSchedule.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const autoInspectionScheduler = new AutoInspectionScheduler()

