import { google } from 'googleapis'
import { PlatformConfig } from '../types'
import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'
import { decrypt, encrypt } from '../utils/encryption'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'

interface UploadResult {
  platform: string
  success: boolean
  videoId?: string
  url?: string
  error?: string
}

/**
 * 여러 플랫폼에 콘텐츠 업로드
 */
export async function uploadToPlatforms(
  contentId: string,
  platforms: PlatformConfig[]
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (const platform of platforms) {
    try {
      const result = await uploadToPlatform(contentId, platform)
      results.push(result)
    } catch (error: any) {
      logger.error(`업로드 실패 (${platform.platform}):`, error)
      results.push({
        platform: platform.platform,
        success: false,
        error: error.message
      })
    }
  }

  return results
}

/**
 * 단일 플랫폼에 업로드
 */
export async function uploadToPlatform(
  contentId: string,
  platform: PlatformConfig
): Promise<UploadResult> {
  switch (platform.platform) {
    case 'youtube':
      return await uploadToYouTube(contentId, platform)
    case 'tiktok':
      return await uploadToTikTok(contentId, platform)
    case 'instagram':
      return await uploadToInstagram(contentId, platform)
    default:
      throw new Error(`지원하지 않는 플랫폼: ${platform.platform}`)
  }
}

/**
 * YouTube에 업로드
 */
async function uploadToYouTube(
  contentId: string,
  config: PlatformConfig
): Promise<UploadResult> {
  try {
    const prisma = getPrismaClient()
    
    // 데이터베이스에서 플랫폼 설정 조회
    const platformConfig = await prisma.platformConfig.findFirst({
      where: {
        platform: 'youtube',
        isActive: true
      }
    })

    if (!platformConfig) {
      throw new Error('YouTube 플랫폼 설정을 찾을 수 없습니다')
    }

    // OAuth 클라이언트 생성
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/platform/youtube/callback'
    )

    // 저장된 토큰 사용
    if (platformConfig.accessToken) {
      try {
        const decryptedToken = decrypt(platformConfig.accessToken)
        const refreshToken = platformConfig.refreshToken ? decrypt(platformConfig.refreshToken) : undefined

        oauth2Client.setCredentials({
          access_token: decryptedToken,
          refresh_token: refreshToken,
          expiry_date: platformConfig.tokenExpiry?.getTime()
        })

        // 토큰 만료 시 자동 갱신
        if (platformConfig.tokenExpiry && platformConfig.tokenExpiry < new Date()) {
          if (refreshToken) {
            const { credentials } = await oauth2Client.refreshAccessToken()
            // 갱신된 토큰 저장
            await prisma.platformConfig.update({
              where: { id: platformConfig.id },
              data: {
                accessToken: credentials.access_token ? encrypt(credentials.access_token) : undefined,
                tokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : undefined
              }
            })
            oauth2Client.setCredentials(credentials)
          } else {
            throw new Error('토큰이 만료되었고 갱신 토큰이 없습니다')
          }
        }
      } catch (error: any) {
        logger.error('토큰 복호화 실패:', error)
        throw new Error('인증 토큰을 사용할 수 없습니다. 다시 인증해주세요')
      }
    } else {
      throw new Error('YouTube 인증이 필요합니다. 설정 페이지에서 인증해주세요')
    }

    // 콘텐츠 정보 조회
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    if (!content) {
      throw new Error('콘텐츠를 찾을 수 없습니다')
    }

    const latestVersion = content.versions[0]
    if (!latestVersion) {
      throw new Error('콘텐츠 버전을 찾을 수 없습니다')
    }

    // 비디오 파일 경로 확인
    const videoPath = latestVersion.videoUrl
    if (!videoPath || !await fileExists(videoPath)) {
      throw new Error('업로드할 비디오 파일을 찾을 수 없습니다')
    }

    // YouTube API 클라이언트 생성
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    // 비디오 메타데이터
    const videoMetadata = {
      snippet: {
        title: latestVersion.title,
        description: latestVersion.description,
        tags: content.topic.split(' ').slice(0, 5), // 태그는 최대 5개
        categoryId: '22', // People & Blogs
        defaultLanguage: 'ko',
        defaultAudioLanguage: 'ko'
      },
      status: {
        privacyStatus: 'public', // 또는 'unlisted', 'private'
        selfDeclaredMadeForKids: false
      }
    }

    // 비디오 업로드
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: fsSync.createReadStream(videoPath)
      }
    })

    const videoId = response.data.id
    if (!videoId) {
      throw new Error('비디오 업로드는 성공했지만 ID를 받지 못했습니다')
    }

    const videoUrl = `https://youtube.com/watch?v=${videoId}`

    // 업로드 기록 저장
    await prisma.upload.create({
      data: {
        contentId: contentId,
        platform: 'youtube',
        videoId: videoId,
        url: videoUrl,
        status: 'completed'
      }
    })

    // 콘텐츠 상태 업데이트
    await prisma.content.update({
      where: { id: contentId },
      data: { status: 'published' }
    })

    logger.info('YouTube 업로드 성공:', { contentId, videoId, url: videoUrl })

    return {
      platform: 'youtube',
      success: true,
      videoId: videoId,
      url: videoUrl
    }
  } catch (error: any) {
    logger.error('YouTube 업로드 실패:', error)
    
    // 실패 기록 저장
    try {
      const prisma = getPrismaClient()
      await prisma.upload.create({
        data: {
          contentId: contentId,
          platform: 'youtube',
          status: 'failed'
        }
      })
    } catch (dbError) {
      logger.error('업로드 실패 기록 저장 실패:', dbError)
    }

    throw new Error(`YouTube 업로드 실패: ${error.message}`)
  }
}

/**
 * 파일 존재 확인
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * TikTok에 업로드
 */
async function uploadToTikTok(
  contentId: string,
  config: PlatformConfig
): Promise<UploadResult> {
  try {
    const prisma = getPrismaClient()
    
    // 데이터베이스에서 플랫폼 설정 조회
    const platformConfig = await prisma.platformConfig.findFirst({
      where: {
        platform: 'tiktok',
        isActive: true
      }
    })

    if (!platformConfig || !platformConfig.apiKey) {
      throw new Error('TikTok API 키가 설정되지 않았습니다')
    }

    // 콘텐츠 정보 조회
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    if (!content) {
      throw new Error('콘텐츠를 찾을 수 없습니다')
    }

    const latestVersion = content.versions[0]
    if (!latestVersion) {
      throw new Error('콘텐츠 버전을 찾을 수 없습니다')
    }

    // 비디오 파일 경로 확인
    const videoPath = latestVersion.videoUrl
    if (!videoPath || !await fileExists(videoPath)) {
      throw new Error('업로드할 비디오 파일을 찾을 수 없습니다')
    }

    // TikTok API는 현재 공식 SDK가 제한적이므로
    // 실제 구현은 TikTok for Developers API 문서 참고 필요
    // 여기서는 기본 구조만 제공
    
    // TikTok API 호출 (예시)
    // const tiktokApiUrl = 'https://open-api.tiktok.com/share/video/upload/'
    // 실제 구현 시 TikTok API 문서 참고

    logger.info('TikTok 업로드 (구현 필요):', contentId)
    
    // 업로드 기록 저장
    await prisma.upload.create({
      data: {
        contentId: contentId,
        platform: 'tiktok',
        status: 'pending' // TikTok API 구현 완료 시 'completed'로 변경
      }
    })

    return {
      platform: 'tiktok',
      success: true,
      videoId: `tiktok_${contentId}`,
      error: 'TikTok API 연동이 아직 완전히 구현되지 않았습니다. TikTok for Developers API 문서를 참고하여 구현해주세요.'
    }
  } catch (error: any) {
    logger.error('TikTok 업로드 실패:', error)
    throw new Error(`TikTok 업로드 실패: ${error.message}`)
  }
}

/**
 * Instagram에 업로드
 */
async function uploadToInstagram(
  contentId: string,
  config: PlatformConfig
): Promise<UploadResult> {
  try {
    const prisma = getPrismaClient()
    
    // 데이터베이스에서 플랫폼 설정 조회
    const platformConfig = await prisma.platformConfig.findFirst({
      where: {
        platform: 'instagram',
        isActive: true
      }
    })

    if (!platformConfig || (!platformConfig.accessToken && !platformConfig.apiKey)) {
      throw new Error('Instagram 인증 정보가 설정되지 않았습니다')
    }

    // 콘텐츠 정보 조회
    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 1
        }
      }
    })

    if (!content) {
      throw new Error('콘텐츠를 찾을 수 없습니다')
    }

    const latestVersion = content.versions[0]
    if (!latestVersion) {
      throw new Error('콘텐츠 버전을 찾을 수 없습니다')
    }

    // 비디오 파일 경로 확인
    const videoPath = latestVersion.videoUrl
    if (!videoPath || !await fileExists(videoPath)) {
      throw new Error('업로드할 비디오 파일을 찾을 수 없습니다')
    }

    // Instagram Graph API 사용
    // 실제 구현은 Instagram Basic Display API 또는 Instagram Graph API 문서 참고
    // 여기서는 기본 구조만 제공

    // Instagram API 호출 (예시)
    // const accessToken = platformConfig.accessToken ? decrypt(platformConfig.accessToken) : platformConfig.apiKey
    // const instagramApiUrl = `https://graph.instagram.com/v18.0/${userId}/media`
    // 실제 구현 시 Instagram API 문서 참고

    logger.info('Instagram 업로드 (구현 필요):', contentId)
    
    // 업로드 기록 저장
    await prisma.upload.create({
      data: {
        contentId: contentId,
        platform: 'instagram',
        status: 'pending' // Instagram API 구현 완료 시 'completed'로 변경
      }
    })

    return {
      platform: 'instagram',
      success: true,
      videoId: `instagram_${contentId}`,
      error: 'Instagram API 연동이 아직 완전히 구현되지 않았습니다. Instagram Graph API 문서를 참고하여 구현해주세요.'
    }
  } catch (error: any) {
    logger.error('Instagram 업로드 실패:', error)
    throw new Error(`Instagram 업로드 실패: ${error.message}`)
  }
}

