/**
 * 비디오 생성 및 업로드 작업 큐
 * Bull을 사용하여 긴 작업을 백그라운드에서 처리
 */

import Bull from 'bull'
import { logger } from '../../utils/logger'
import { generateVideo } from '../videoGenerator'
import { uploadToPlatforms } from '../uploadService'
import { GeneratedContent } from '../../types'

// Redis URL 설정
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

/**
 * 비디오 생성 큐
 */
export const videoGenerationQueue = new Bull('video-generation', redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // 완료된 작업 100개만 보관
    removeOnFail: 500 // 실패한 작업 500개만 보관
  }
})

/**
 * 비디오 업로드 큐
 */
export const videoUploadQueue = new Bull('video-upload', redisUrl, {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 500
  }
})

/**
 * 비디오 생성 작업 처리
 */
videoGenerationQueue.process(async (job) => {
  const { content, images, videos, editOptions, includeAudio } = job.data
  
  logger.info('비디오 생성 작업 시작:', { contentId: content.id, jobId: job.id })
  
  try {
    const videoUrl = await generateVideo(
      content,
      images,
      videos,
      editOptions,
      includeAudio
    )
    
    logger.info('비디오 생성 완료:', { contentId: content.id, videoUrl })
    
    return { success: true, videoUrl }
  } catch (error: any) {
    logger.error('비디오 생성 실패:', error)
    throw error
  }
})

/**
 * 비디오 업로드 작업 처리
 */
videoUploadQueue.process(async (job) => {
  const { contentId, platforms } = job.data
  
  logger.info('비디오 업로드 작업 시작:', { contentId, platforms, jobId: job.id })
  
  try {
    const results = await uploadToPlatforms(contentId, platforms)
    
    logger.info('비디오 업로드 완료:', { contentId, results })
    
    return { success: true, results }
  } catch (error: any) {
    logger.error('비디오 업로드 실패:', error)
    throw error
  }
})

/**
 * 비디오 생성 작업 추가
 */
export async function addVideoGenerationJob(
  content: GeneratedContent,
  images?: string[],
  videos?: string[],
  editOptions?: any,
  includeAudio: boolean = true
): Promise<Bull.Job> {
  return await videoGenerationQueue.add({
    content,
    images,
    videos,
    editOptions,
    includeAudio
  }, {
    priority: 1,
    timeout: 600000 // 10분 타임아웃
  })
}

/**
 * 비디오 업로드 작업 추가
 */
export async function addVideoUploadJob(
  contentId: string,
  platforms: any[]
): Promise<Bull.Job> {
  return await videoUploadQueue.add({
    contentId,
    platforms
  }, {
    priority: 2,
    timeout: 300000 // 5분 타임아웃
  })
}

/**
 * 큐 이벤트 리스너
 */
videoGenerationQueue.on('completed', (job, result) => {
  logger.info('비디오 생성 작업 완료:', { jobId: job.id, result })
})

videoGenerationQueue.on('failed', (job, error) => {
  logger.error('비디오 생성 작업 실패:', { jobId: job.id, error: error.message })
})

videoUploadQueue.on('completed', (job, result) => {
  logger.info('비디오 업로드 작업 완료:', { jobId: job.id, result })
})

videoUploadQueue.on('failed', (job, error) => {
  logger.error('비디오 업로드 작업 실패:', { jobId: job.id, error: error.message })
})

/**
 * 큐 상태 조회
 */
export async function getQueueStatus() {
  const [videoGenWaiting, videoGenActive, videoGenCompleted, videoGenFailed] = await Promise.all([
    videoGenerationQueue.getWaitingCount(),
    videoGenerationQueue.getActiveCount(),
    videoGenerationQueue.getCompletedCount(),
    videoGenerationQueue.getFailedCount()
  ])

  const [uploadWaiting, uploadActive, uploadCompleted, uploadFailed] = await Promise.all([
    videoUploadQueue.getWaitingCount(),
    videoUploadQueue.getActiveCount(),
    videoUploadQueue.getCompletedCount(),
    videoUploadQueue.getFailedCount()
  ])

  return {
    videoGeneration: {
      waiting: videoGenWaiting,
      active: videoGenActive,
      completed: videoGenCompleted,
      failed: videoGenFailed
    },
    videoUpload: {
      waiting: uploadWaiting,
      active: uploadActive,
      completed: uploadCompleted,
      failed: uploadFailed
    }
  }
}

