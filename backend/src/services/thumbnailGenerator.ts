import { ContentType } from '../types'
import { logger } from '../utils/logger'
import fs from 'fs/promises'
import path from 'path'

/**
 * 썸네일 생성 (간단한 버전)
 * 실제로는 Canvas나 이미지 라이브러리를 사용해야 함
 */
export async function generateThumbnail(
  title: string,
  contentType: ContentType
): Promise<string> {
  try {
    // 실제 구현은 Canvas나 이미지 생성 라이브러리 필요
    // 여기서는 placeholder URL 반환하거나 파일 경로 반환
    
    const thumbnailDir = './uploads/thumbnails'
    await fs.mkdir(thumbnailDir, { recursive: true })
    
    const thumbnailPath = path.join(thumbnailDir, `${Date.now()}.jpg`)
    
    // 실제로는 여기서 이미지를 생성해야 하지만
    // 지금은 placeholder URL 반환
    const encodedTitle = encodeURIComponent(title.substring(0, 20))
    const placeholderUrl = `https://via.placeholder.com/400x600/0ea5e9/ffffff?text=${encodedTitle}`
    
    logger.info('썸네일 생성 (placeholder):', placeholderUrl)
    return placeholderUrl
    
  } catch (error) {
    logger.error('썸네일 생성 실패:', error)
    // 실패 시 기본 placeholder
    const encodedTitle = encodeURIComponent(title.substring(0, 20))
    return `https://via.placeholder.com/400x600/0ea5e9/ffffff?text=${encodedTitle}`
  }
}
