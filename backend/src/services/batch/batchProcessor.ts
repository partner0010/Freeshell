import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { generateContent } from '../contentGenerator'
import { ContentType } from '../../types'

export interface BatchJobConfig {
  type: 'generate' | 'upload' | 'publish'
  items: Array<{
    topic: string
    contentType: string
    [key: string]: any
  }>
  settings?: {
    parallel?: boolean
    maxConcurrent?: number
    retryOnFailure?: boolean
  }
}

/**
 * 배치 처리기
 */
export class BatchProcessor {
  /**
   * 배치 작업 생성
   */
  async createBatchJob(userId: string | null, config: BatchJobConfig): Promise<string> {
    const prisma = getPrismaClient()

    const job = await prisma.batchJob.create({
      data: {
        userId,
        type: config.type,
        totalItems: config.items.length,
        settings: JSON.stringify(config.settings || {})
      }
    })

    // 비동기로 작업 시작
    this.processBatchJob(job.id, config).catch(err => {
      logger.error(`배치 작업 실패 (${job.id}):`, err)
    })

    return job.id
  }

  /**
   * 배치 작업 처리
   */
  private async processBatchJob(jobId: string, config: BatchJobConfig): Promise<void> {
    const prisma = getPrismaClient()

    try {
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'running',
          startedAt: new Date()
        }
      })

      const settings = config.settings || {}
      const maxConcurrent = settings.maxConcurrent || 3
      const parallel = settings.parallel !== false

      if (parallel) {
        // 병렬 처리
        await this.processParallel(config, maxConcurrent, jobId)
      } else {
        // 순차 처리
        await this.processSequential(config, jobId)
      }

      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      })

      logger.info(`배치 작업 완료: ${jobId}`)

    } catch (error: any) {
      logger.error(`배치 작업 실패 (${jobId}):`, error)
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: error.message
        }
      })
    }
  }

  /**
   * 병렬 처리
   */
  private async processParallel(
    config: BatchJobConfig,
    maxConcurrent: number,
    jobId: string
  ): Promise<void> {
    const prisma = getPrismaClient()
    const chunks: typeof config.items[] = []

    // 청크로 분할
    for (let i = 0; i < config.items.length; i += maxConcurrent) {
      chunks.push(config.items.slice(i, i + maxConcurrent))
    }

    let completedItems = 0
    let failedItems = 0

    for (const chunk of chunks) {
      const promises = chunk.map(async (item) => {
        try {
          await this.processItem(config.type, item)
          completedItems++
        } catch (error) {
          failedItems++
          throw error
        }
      })

      await Promise.allSettled(promises)

      // 진행 상황 업데이트
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          completedItems,
          failedItems
        }
      })
    }
  }

  /**
   * 순차 처리
   */
  private async processSequential(config: BatchJobConfig, jobId: string): Promise<void> {
    const prisma = getPrismaClient()
    let completedItems = 0
    let failedItems = 0

    for (const item of config.items) {
      try {
        await this.processItem(config.type, item)
        completedItems++
      } catch (error) {
        failedItems++
        if (!config.settings?.retryOnFailure) {
          // 재시도 안 하면 계속 진행
        }
      }

      // 진행 상황 업데이트
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          completedItems,
          failedItems
        }
      })
    }
  }

  /**
   * 개별 항목 처리
   */
  private async processItem(type: string, item: any): Promise<void> {
    switch (type) {
      case 'generate':
        const formData = {
          topic: item.topic,
          contentType: item.contentType as ContentType,
          contentTime: item.contentTime || 60,
          contentFormat: item.contentFormat || ['video', 'text'],
          text: item.text || ''
        }
        await generateContent(formData)
        break

      case 'upload':
        // 업로드 로직
        const { uploadToPlatforms } = await import('../uploadService')
        if (item.contentId) {
          await uploadToPlatforms(item.contentId, item.platforms || [])
        }
        break

      case 'publish':
        // 게시 로직
        const prisma = getPrismaClient()
        if (item.contentId) {
          await prisma.content.update({
            where: { id: item.contentId },
            data: { status: 'published' }
          })
        }
        break

      default:
        throw new Error(`알 수 없는 작업 타입: ${type}`)
    }
  }

  /**
   * 배치 작업 상태 조회
   */
  async getBatchJobStatus(jobId: string) {
    const prisma = getPrismaClient()
    return await prisma.batchJob.findUnique({
      where: { id: jobId }
    })
  }

  /**
   * 사용자의 배치 작업 목록
   */
  async getUserBatchJobs(userId: string) {
    const prisma = getPrismaClient()
    return await prisma.batchJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  }
}

export const batchProcessor = new BatchProcessor()

