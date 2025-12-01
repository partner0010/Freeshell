import { Router, Request, Response } from 'express'
import { verifyPlatformAuth } from '../services/platformService'
import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'
import { encrypt, decrypt } from '../utils/encryption'
import { google } from 'googleapis'

const router = Router()

/**
 * GET /api/platform/:platform/verify
 * 플랫폼 인증 확인
 */
router.get('/:platform/verify', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params
    const verified = await verifyPlatformAuth(platform)

    res.json({
      success: true,
      verified
    })
  } catch (error: any) {
    logger.error('플랫폼 인증 확인 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/platform/youtube/auth
 * YouTube OAuth 인증 URL 생성
 */
router.get('/youtube/auth', async (req: Request, res: Response) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/platform/youtube/callback'
    )

    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly'
    ]

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // 항상 새 토큰 받기
    })

    res.json({
      success: true,
      authUrl
    })
  } catch (error: any) {
    logger.error('YouTube 인증 URL 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/platform/youtube/callback
 * YouTube OAuth 콜백 처리
 */
router.get('/youtube/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query

    if (!code) {
      return res.status(400).json({
        success: false,
        error: '인증 코드가 없습니다'
      })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3001/api/platform/youtube/callback'
    )

    // 토큰 교환
    const { tokens } = await oauth2Client.getToken(code as string)
    
    if (!tokens.access_token) {
      throw new Error('액세스 토큰을 받지 못했습니다')
    }

    // 사용자 정보 가져오기
    oauth2Client.setCredentials(tokens)
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })
    const channelResponse = await youtube.channels.list({
      part: ['snippet'],
      mine: true
    })

    const channel = channelResponse.data.items?.[0]
    const channelId = channel?.id
    const email = channel?.snippet?.title

    // 데이터베이스에 저장
    const prisma = getPrismaClient()
    await prisma.platformConfig.upsert({
      where: {
        userId_platform: {
          userId: null, // 나중에 사용자 인증 추가 시 수정
          platform: 'youtube'
        }
      },
      update: {
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        channelId: channelId || undefined,
        email: email || undefined,
        isActive: true
      },
      create: {
        platform: 'youtube',
        accessToken: encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        channelId: channelId || undefined,
        email: email || undefined,
        isActive: true
      }
    })

    logger.info('YouTube 인증 완료:', { channelId, email })

    // 프론트엔드로 리다이렉트
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/settings?youtube=success`)
  } catch (error: any) {
    logger.error('YouTube 인증 콜백 실패:', error)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/settings?youtube=error&message=${encodeURIComponent(error.message)}`)
  }
})

/**
 * POST /api/platform/:platform/auth
 * 플랫폼 인증 시작 (일반)
 */
router.post('/:platform/auth', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params
    const { credentials } = req.body

    if (platform === 'youtube') {
      // YouTube는 OAuth 플로우 사용
      return res.json({
        success: true,
        message: 'OAuth 인증 URL을 사용하세요',
        authUrl: `/api/platform/youtube/auth`
      })
    }

    logger.info('플랫폼 인증 시작:', platform)

    res.json({
      success: true,
      message: '인증 프로세스 시작됨'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

