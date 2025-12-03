import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'

export interface JobData {
  type: string
  priority?: number
  payload: any
  maxRetries?: number
}

/**
 * 작업 큐 관리자
 */
export class JobQueue {
  private processing = false

  /**
   * 작업 추가
   */
  async addJob(jobData: JobData): Promise<string> {
    const prisma = getPrismaClient()

    const job = await prisma.jobQueue.create({
      data: {
        type: jobData.type,
        priority: jobData.priority || 0,
        payload: JSON.stringify(jobData.payload),
        maxRetries: jobData.maxRetries || 3,
        scheduledAt: new Date()
      }
    })

    logger.info(`작업 추가됨: ${job.type} (${job.id})`)

    // 작업 처리 시작 (비동기)
    this.processQueue().catch(err => logger.error('큐 처리 오류:', err))

    return job.id
  }

  /**
   * 큐 처리
   */
  async processQueue(): Promise<void> {
    if (this.processing) {
      return
    }

    this.processing = true
    const prisma = getPrismaClient()

    try {
      // 우선순위 높은 작업부터 처리
      const jobs = await prisma.jobQueue.findMany({
        where: { status: 'pending' },
        orderBy: [
          { priority: 'desc' },
          { scheduledAt: 'asc' }
        ],
        take: 10 // 한 번에 최대 10개 처리
      })

      for (const job of jobs) {
        await this.processJob(job.id)
      }
    } finally {
      this.processing = false
    }
  }

  /**
   * 작업 처리
   */
  private async processJob(jobId: string): Promise<void> {
    const prisma = getPrismaClient()

    try {
      const job = await prisma.jobQueue.findUnique({
        where: { id: jobId }
      })

      if (!job || job.status !== 'pending') {
        return
      }

      // 작업 상태를 processing으로 변경
      await prisma.jobQueue.update({
        where: { id: jobId },
        data: {
          status: 'processing',
          startedAt: new Date()
        }
      })

      const payload = JSON.parse(job.payload)

      // 작업 타입별 처리
      let result: any
      switch (job.type) {
        case 'content-generation':
          result = await this.handleContentGeneration(payload)
          break
        case 'video-processing':
          result = await this.handleVideoProcessing(payload)
          break
        case 'upload':
          result = await this.handleUpload(payload)
          break
        default:
          throw new Error(`알 수 없는 작업 타입: ${job.type}`)
      }

      // 성공 처리
      await prisma.jobQueue.update({
        where: { id: jobId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          result: JSON.stringify(result)
        }
      })

      logger.info(`작업 완료: ${job.type} (${jobId})`)

    } catch (error: any) {
      logger.error(`작업 실패: ${jobId}`, error)

      const job = await prisma.jobQueue.findUnique({
        where: { id: jobId }
      })

      if (!job) return

      const retryCount = job.retryCount + 1

      if (retryCount < job.maxRetries) {
        // 재시도
        await prisma.jobQueue.update({
          where: { id: jobId },
          data: {
            status: 'pending',
            retryCount,
            error: error.message
          }
        })
      } else {
        // 최대 재시도 횟수 초과
        await prisma.jobQueue.update({
          where: { id: jobId },
          data: {
            status: 'failed',
            completedAt: new Date(),
            error: error.message
          }
        })
      }
    }
  }

  /**
   * 콘텐츠 생성 작업 처리
   */
  private async handleContentGeneration(payload: any): Promise<any> {
    try {
      const { generateContent } = await import('../contentGenerator')
      const contents = await generateContent(payload)
      
      // 데이터베이스에 저장
      const prisma = getPrismaClient()
      const savedContent = await prisma.content.create({
        data: {
          topic: payload.topic,
          contentType: payload.contentType,
          contentTime: payload.contentTime || 60,
          text: payload.text || '',
          status: 'generated',
          versions: {
            create: contents.map((content, index) => ({
              version: index + 1,
              title: content.title,
              description: content.description,
              thumbnail: content.thumbnail,
              videoUrl: content.videoUrl,
              reasoning: content.reasoning || '',
              duration: content.duration || 60
            }))
          }
        }
      })

      logger.info(`콘텐츠 생성 완료: ${savedContent.id}`)
      return { success: true, contentId: savedContent.id, contents }
    } catch (error: any) {
      logger.error('콘텐츠 생성 작업 실패:', error)
      throw error
    }
  }

  /**
   * 비디오 처리 작업 처리
   */
  private async handleVideoProcessing(payload: any): Promise<any> {
    try {
      const { generateVideo } = await import('../videoGenerator')
      const { getPrismaClient } = await import('../../utils/database')
      
      const prisma = getPrismaClient()
      const content = await prisma.content.findUnique({
        where: { id: payload.contentId },
        include: { versions: true }
      })

      if (!content || content.versions.length === 0) {
        throw new Error('콘텐츠 또는 버전을 찾을 수 없습니다')
      }

      const version = content.versions[0]
      const videoPath = await generateVideo({
        id: content.id,
        version: version.version,
        title: version.title,
        description: version.description,
        script: content.text,
        thumbnail: version.thumbnail,
        videoUrl: version.videoUrl || undefined,
        reasoning: version.reasoning,
        duration: version.duration,
        createdAt: version.createdAt.toISOString(),
        topic: content.topic,
        contentType: content.contentType as any,
        status: 'generated'
      } as any, payload.images, payload.videos, payload.editOptions)

      // 비디오 경로 업데이트
      await prisma.contentVersion.update({
        where: { id: version.id },
        data: { videoUrl: videoPath }
      })

      logger.info(`비디오 처리 완료: ${videoPath}`)
      return { success: true, videoPath, contentId: payload.contentId }
    } catch (error: any) {
      logger.error('비디오 처리 작업 실패:', error)
      throw error
    }
  }

  /**
   * 업로드 작업 처리
   */
  private async handleUpload(payload: any): Promise<any> {
    try {
      const { uploadToPlatform } = await import('../uploadService')
      // uploadToPlatform은 이미 export되어 있음
      const { getPrismaClient } = await import('../../utils/database')
      
      const prisma = getPrismaClient()
      const content = await prisma.content.findUnique({
        where: { id: payload.contentId }
      })

      if (!content) {
        throw new Error('콘텐츠를 찾을 수 없습니다')
      }

      // 플랫폼 설정 조회
      const platformConfig = await prisma.platformConfig.findFirst({
        where: {
          platform: payload.platform,
          isActive: true
        }
      })

      if (!platformConfig) {
        throw new Error(`${payload.platform} 플랫폼 설정을 찾을 수 없습니다`)
      }

      const result = await uploadToPlatform(payload.contentId, {
        platform: platformConfig.platform as 'youtube' | 'tiktok' | 'instagram',
        credentials: {
          email: platformConfig.email || undefined,
          username: platformConfig.username || undefined,
          apiKey: platformConfig.apiKey || undefined
        },
        autoUpload: true
      } as any)

      logger.info(`업로드 완료: ${result.videoId || result.url}`)
      return { success: true, uploadId: result.videoId, url: result.url, platform: payload.platform }
    } catch (error: any) {
      logger.error('업로드 작업 실패:', error)
      throw error
    }
  }

  /**
   * 작업 상태 조회
   */
  async getJobStatus(jobId: string) {
    const prisma = getPrismaClient()
    return await prisma.jobQueue.findUnique({
      where: { id: jobId }
    })
  }

  /**
   * 대기 중인 작업 수 조회
   */
  async getPendingJobCount(): Promise<number> {
    const prisma = getPrismaClient()
    return await prisma.jobQueue.count({
      where: { status: 'pending' }
    })
  }
}

export const jobQueue = new JobQueue()

// 주기적으로 큐 처리 (매 10초마다)
setInterval(() => {
  jobQueue.processQueue().catch(err => logger.error('큐 처리 오류:', err))
}, 10000)

