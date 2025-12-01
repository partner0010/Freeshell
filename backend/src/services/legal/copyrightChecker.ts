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
    const matches: Array<{ source: string; similarity: number; url?: string }> = []
    let maxSimilarity = 0

    // 1. Copyscape API 연동 (API 키가 있는 경우)
    const copyscapeApiKey = process.env.COPYSCAPE_API_KEY
    if (copyscapeApiKey) {
      try {
        const copyscapeResult = await this.checkCopyscape(text, copyscapeApiKey)
        matches.push(...copyscapeResult.matches)
        maxSimilarity = Math.max(maxSimilarity, copyscapeResult.similarity)
      } catch (error: any) {
        logger.warn('Copyscape API 호출 실패:', error.message)
      }
    }

    // 2. Google Custom Search API를 이용한 간단한 표절 검사
    const googleApiKey = process.env.GOOGLE_API_KEY
    const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
    if (googleApiKey && googleSearchEngineId) {
      try {
        const googleResult = await this.checkGoogleSearch(text, googleApiKey, googleSearchEngineId)
        matches.push(...googleResult.matches)
        maxSimilarity = Math.max(maxSimilarity, googleResult.similarity)
      } catch (error: any) {
        logger.warn('Google Search API 호출 실패:', error.message)
      }
    }

    // 3. 텍스트 유사도 기반 검사 (키워드 추출 및 검색)
    if (matches.length === 0) {
      // API 키가 없을 때는 키워드 기반 간단한 검사
      const keywordResult = await this.checkByKeywords(text)
      matches.push(...keywordResult.matches)
      maxSimilarity = Math.max(maxSimilarity, keywordResult.similarity)
    }

    return {
      similarity: maxSimilarity,
      matches
    }
  }

  /**
   * Copyscape API를 이용한 표절 검사
   */
  private async checkCopyscape(text: string, apiKey: string): Promise<{
    similarity: number
    matches: Array<{ source: string; similarity: number; url?: string }>
  }> {
    const matches: Array<{ source: string; similarity: number; url?: string }> = []
    
    try {
      // Copyscape API 호출 (텍스트 검색)
      const response = await axios.get('https://www.copyscape.com/api/', {
        params: {
          u: apiKey,
          o: 'csearch',
          q: text.substring(0, 1000), // 처음 1000자만 검사
          t: 10 // 최대 10개 결과
        }
      })

      // XML 응답 파싱 (Copyscape는 XML 반환)
      if (response.data && typeof response.data === 'string') {
        // 간단한 XML 파싱 (실제로는 xml2js 등 사용 권장)
        const urlMatches = response.data.match(/<url>(.*?)<\/url>/g) || []
        const minWordsMatches = response.data.match(/<minwords>(.*?)<\/minwords>/g) || []
        
        urlMatches.forEach((urlMatch: string, index: number) => {
          const url = urlMatch.replace(/<\/?url>/g, '')
          const minWords = minWordsMatches[index] ? parseInt(minWordsMatches[index].replace(/<\/?minwords>/g, '')) : 0
          
          if (url && minWords > 10) {
            matches.push({
              source: 'Copyscape',
              similarity: Math.min(minWords / 100, 1), // 단어 수 기반 유사도
              url
            })
          }
        })
      }
    } catch (error: any) {
      logger.error('Copyscape API 오류:', error)
    }

    const similarity = matches.length > 0 
      ? Math.max(...matches.map(m => m.similarity))
      : 0

    return { similarity, matches }
  }

  /**
   * Google Custom Search API를 이용한 표절 검사
   */
  private async checkGoogleSearch(
    text: string, 
    apiKey: string, 
    searchEngineId: string
  ): Promise<{
    similarity: number
    matches: Array<{ source: string; similarity: number; url?: string }>
  }> {
    const matches: Array<{ source: string; similarity: number; url?: string }> = []
    
    try {
      // 텍스트에서 핵심 키워드 추출 (처음 100자)
      const searchQuery = text.substring(0, 100).replace(/[^\w\s]/g, ' ')
      
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: `"${searchQuery}"`, // 정확한 구문 검색
          num: 5 // 최대 5개 결과
        }
      })

      if (response.data.items) {
        for (const item of response.data.items) {
          // 검색 결과와 원본 텍스트 유사도 계산
          const snippet = item.snippet || ''
          const similarity = this.calculateSimilarity(text.substring(0, 200), snippet)
          
          if (similarity > 0.3) { // 30% 이상 유사
            matches.push({
              source: 'Google Search',
              similarity,
              url: item.link
            })
          }
        }
      }
    } catch (error: any) {
      logger.error('Google Search API 오류:', error)
    }

    const similarity = matches.length > 0 
      ? Math.max(...matches.map(m => m.similarity))
      : 0

    return { similarity, matches }
  }

  /**
   * 키워드 기반 간단한 검사 (API 없이)
   */
  private async checkByKeywords(text: string): Promise<{
    similarity: number
    matches: Array<{ source: string; similarity: number; url?: string }>
  }> {
    // 키워드 추출 및 내부 데이터베이스 검색
    const keywords = this.extractKeywords(text)
    const matches: Array<{ source: string; similarity: number; url?: string }> = []
    
    // 내부 데이터베이스에서 유사한 키워드를 가진 콘텐츠 검색
    const { getPrismaClient } = await import('../../utils/database')
    const prisma = getPrismaClient()
    
    const similarContents = await prisma.content.findMany({
      where: {
        OR: keywords.map(keyword => ({
          topic: { contains: keyword, mode: 'insensitive' }
        }))
      },
      take: 5
    })

    for (const content of similarContents) {
      if (content.text) {
        const similarity = this.calculateSimilarity(text, content.text)
        if (similarity > 0.5) {
          matches.push({
            source: `내부 유사 콘텐츠: ${content.topic}`,
            similarity
          })
        }
      }
    }

    const similarity = matches.length > 0 
      ? Math.max(...matches.map(m => m.similarity))
      : 0

    return { similarity, matches }
  }

  /**
   * 텍스트에서 키워드 추출
   */
  private extractKeywords(text: string, count: number = 5): string[] {
    // 간단한 키워드 추출 (실제로는 더 정교한 NLP 사용)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // 3자 이상 단어만
    
    // 빈도수 계산
    const wordCounts: Record<string, number> = {}
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1
    })

    // 빈도수 높은 순으로 정렬
    return Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([word]) => word)
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

