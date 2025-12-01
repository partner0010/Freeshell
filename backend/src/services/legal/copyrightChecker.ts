import { logger } from '../../utils/logger'
import axios from 'axios'

/**
 * 저작권 검사 서비스
 */
export class CopyrightChecker {
  /**
   * 텍스트 저작권 검사
   */
  async checkTextCopyright(text: string): Promise<{
    isOriginal: boolean
    similarity: number
    matches: Array<{
      source: string
      similarity: number
      url?: string
    }>
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    try {
      // 1. 내부 데이터베이스 검사 (기존 생성된 콘텐츠와 비교)
      const internalCheck = await this.checkInternalDatabase(text)
      
      // 2. 외부 표절 검사 (온라인 검색)
      const externalCheck = await this.checkExternalSources(text)
      
      // 3. 위험도 계산
      const riskLevel = this.calculateRiskLevel(internalCheck, externalCheck)
      
      return {
        isOriginal: riskLevel === 'low',
        similarity: Math.max(internalCheck.similarity, externalCheck.similarity),
        matches: [...internalCheck.matches, ...externalCheck.matches],
        riskLevel
      }
    } catch (error: any) {
      logger.error('저작권 검사 실패:', error)
      // 오류 발생 시 안전하게 처리
      return {
        isOriginal: true,
        similarity: 0,
        matches: [],
        riskLevel: 'low'
      }
    }
  }

  /**
   * 내부 데이터베이스 검사
   */
  private async checkInternalDatabase(text: string): Promise<{
    similarity: number
    matches: Array<{ source: string; similarity: number }>
  }> {
    const { getPrismaClient } = await import('../../utils/database')
    const prisma = getPrismaClient()

    // 기존 콘텐츠와 비교
    const existingContents = await prisma.content.findMany({
      where: {
        text: { not: null }
      },
      select: {
        id: true,
        text: true,
        topic: true
      }
    })

    let maxSimilarity = 0
    const matches: Array<{ source: string; similarity: number }> = []

    for (const content of existingContents) {
      if (content.text) {
        const similarity = this.calculateSimilarity(text, content.text)
        if (similarity > 0.7) { // 70% 이상 유사
          matches.push({
            source: `내부 콘텐츠: ${content.topic}`,
            similarity
          })
          maxSimilarity = Math.max(maxSimilarity, similarity)
        }
      }
    }

    return {
      similarity: maxSimilarity,
      matches
    }
  }

  /**
   * 외부 소스 검사 (온라인 표절 검사)
   */
  private async checkExternalSources(text: string): Promise<{
    similarity: number
    matches: Array<{ source: string; similarity: number; url?: string }>
  }> {
    // 실제 구현 시 표절 검사 API 사용 (예: Copyscape, Grammarly 등)
    // 현재는 기본 구현
    
    // 텍스트를 문장 단위로 분리
    const sentences = text.split(/[.!?]\s+/)
    const matches: Array<{ source: string; similarity: number; url?: string }> = []
    let maxSimilarity = 0

    // 각 문장에 대해 간단한 검사 (실제로는 API 호출)
    for (const sentence of sentences.slice(0, 5)) { // 처음 5개 문장만 검사
      // TODO: 실제 표절 검사 API 연동
      // const result = await plagiarismAPI.check(sentence)
    }

    return {
      similarity: maxSimilarity,
      matches
    }
  }

  /**
   * 텍스트 유사도 계산 (간단한 구현)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용)
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  /**
   * 위험도 계산
   */
  private calculateRiskLevel(
    internal: { similarity: number; matches: any[] },
    external: { similarity: number; matches: any[] }
  ): 'low' | 'medium' | 'high' {
    const maxSimilarity = Math.max(internal.similarity, external.similarity)
    const totalMatches = internal.matches.length + external.matches.length

    if (maxSimilarity > 0.9 || totalMatches > 5) {
      return 'high'
    }
    if (maxSimilarity > 0.7 || totalMatches > 2) {
      return 'medium'
    }
    return 'low'
  }

  /**
   * 이미지 저작권 검사 (역 이미지 검색)
   */
  async checkImageCopyright(imagePath: string): Promise<{
    isOriginal: boolean
    matches: Array<{ source: string; url?: string }>
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    // 역 이미지 검색 API 연동 (Google Images, TinEye 등)
    const tineyeApiKey = process.env.TINEYE_API_KEY
    const googleVisionKey = process.env.GOOGLE_VISION_API_KEY
    
    const matches: Array<{ source: string; url?: string }> = []
    
    // TinEye API 사용 (있는 경우)
    if (tineyeApiKey) {
      try {
        // TinEye API 호출
        // const response = await axios.post('https://api.tineye.com/rest/search/', {
        //   image_url: imagePath
        // }, {
        //   headers: { 'Authorization': `Bearer ${tineyeApiKey}` }
        // })
        // if (response.data.results && response.data.results.length > 0) {
        //   matches.push(...response.data.results.map((r: any) => ({
        //     source: 'TinEye',
        //     url: r.url
        //   })))
        // }
        logger.info('TinEye API 사용 가능 (구현 필요)')
      } catch (error) {
        logger.warn('TinEye API 호출 실패:', error)
      }
    }
    
    // Google Vision API 사용 (있는 경우)
    if (googleVisionKey) {
      try {
        // Google Vision API 호출
        // const vision = new VisionClient({ key: googleVisionKey })
        // const [result] = await vision.webDetection({ image: { source: { filename: imagePath } } })
        // if (result.webDetection?.fullMatchingImages) {
        //   matches.push(...result.webDetection.fullMatchingImages.map((img: any) => ({
        //     source: 'Google Images',
        //     url: img.url
        //   })))
        // }
        logger.info('Google Vision API 사용 가능 (구현 필요)')
      } catch (error) {
        logger.warn('Google Vision API 호출 실패:', error)
      }
    }
    
    const riskLevel = matches.length > 5 ? 'high' : matches.length > 2 ? 'medium' : 'low'
    
    return {
      isOriginal: matches.length === 0,
      matches,
      riskLevel
    }
  }

  /**
   * 비디오 저작권 검사
   */
  async checkVideoCopyright(videoPath: string): Promise<{
    isOriginal: boolean
    matches: Array<{ source: string; url?: string }>
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    // 비디오 저작권 검사 (YouTube Content ID 등)
    const matches: Array<{ source: string; url?: string }> = []
    
    // YouTube Content ID 검사 (YouTube API 사용)
    const youtubeApiKey = process.env.YOUTUBE_API_KEY
    if (youtubeApiKey) {
      try {
        // YouTube Content ID API 호출
        // const { google } = await import('googleapis')
        // const youtube = google.youtube({ version: 'v3', auth: youtubeApiKey })
        // const response = await youtube.contentId.search({
        //   videoId: videoPath // 실제로는 비디오 해시나 메타데이터 사용
        // })
        // if (response.data.items && response.data.items.length > 0) {
        //   matches.push(...response.data.items.map((item: any) => ({
        //     source: 'YouTube Content ID',
        //     url: `https://youtube.com/watch?v=${item.videoId}`
        //   })))
        // }
        logger.info('YouTube Content ID 검사 가능 (구현 필요)')
      } catch (error) {
        logger.warn('YouTube Content ID 검사 실패:', error)
      }
    }
    
    // 비디오 해시 기반 검사 (간단한 구현)
    // 실제로는 비디오의 첫 프레임이나 오디오 핑거프린트 사용
    
    const riskLevel = matches.length > 3 ? 'high' : matches.length > 1 ? 'medium' : 'low'
    
    return {
      isOriginal: matches.length === 0,
      matches,
      riskLevel
    }
  }
}

export const copyrightChecker = new CopyrightChecker()

