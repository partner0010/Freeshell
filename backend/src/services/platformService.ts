import { google } from 'googleapis'
import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'
import { decrypt } from '../utils/encryption'

/**
 * 플랫폼 인증 확인
 */
export async function verifyPlatformAuth(platform: string): Promise<boolean> {
  try {
    switch (platform) {
      case 'youtube':
        return await verifyYouTubeAuth()
      case 'tiktok':
        return await verifyTikTokAuth()
      case 'instagram':
        return await verifyInstagramAuth()
      default:
        return false
    }
  } catch (error) {
    logger.error(`플랫폼 인증 확인 실패 (${platform}):`, error)
    return false
  }
}

/**
 * YouTube 인증 확인
 */
async function verifyYouTubeAuth(): Promise<boolean> {
  try {
    const prisma = getPrismaClient()
    const config = await prisma.platformConfig.findFirst({
      where: {
        platform: 'youtube',
        isActive: true
      }
    })

    if (!config || !config.accessToken) {
      return false
    }

    // 토큰 유효성 확인
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        process.env.YOUTUBE_REDIRECT_URI
      )

      const decryptedToken = decrypt(config.accessToken)
      oauth2Client.setCredentials({
        access_token: decryptedToken,
        refresh_token: config.refreshToken ? decrypt(config.refreshToken) : undefined,
        expiry_date: config.tokenExpiry?.getTime()
      })

      // 간단한 API 호출로 토큰 유효성 확인
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
      await youtube.channels.list({
        part: ['id'],
        mine: true,
        maxResults: 1
      })

      return true
    } catch (error) {
      logger.warn('YouTube 토큰 유효성 확인 실패:', error)
      return false
    }
  } catch (error) {
    logger.error('YouTube 인증 확인 실패:', error)
    return false
  }
}

/**
 * TikTok 인증 확인
 */
async function verifyTikTokAuth(): Promise<boolean> {
  try {
    const prisma = getPrismaClient()
    const config = await prisma.platformConfig.findFirst({
      where: {
        platform: 'tiktok',
        isActive: true
      }
    })

    // TikTok은 API 키 기반 인증
    return !!(config?.apiKey || process.env.TIKTOK_CLIENT_KEY)
  } catch (error) {
    logger.error('TikTok 인증 확인 실패:', error)
    return false
  }
}

/**
 * Instagram 인증 확인
 */
async function verifyInstagramAuth(): Promise<boolean> {
  try {
    const prisma = getPrismaClient()
    const config = await prisma.platformConfig.findFirst({
      where: {
        platform: 'instagram',
        isActive: true
      }
    })

    // Instagram은 OAuth 또는 API 키 기반
    return !!(config?.accessToken || config?.apiKey || process.env.INSTAGRAM_APP_ID)
  } catch (error) {
    logger.error('Instagram 인증 확인 실패:', error)
    return false
  }
}

