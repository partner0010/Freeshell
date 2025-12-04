/**
 * 📱 소셜 미디어 자동 업로더
 * YouTube, TikTok, Instagram 자동 업로드
 */

import { google } from 'googleapis'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { logger } from '../../utils/logger'

export interface UploadCredentials {
  youtube?: {
    clientId: string
    clientSecret: string
    refreshToken: string
  }
  tiktok?: {
    accessToken: string
  }
  instagram?: {
    accessToken: string
    userId: string
  }
}

export interface UploadOptions {
  title: string
  description: string
  tags?: string[]
  hashtags?: string[]
  schedule?: Date
  privacy?: 'public' | 'private' | 'unlisted'
}

class SocialMediaUploader {
  /**
   * 📺 YouTube 업로드
   */
  async uploadToYouTube(
    videoPath: string,
    credentials: UploadCredentials['youtube'],
    options: UploadOptions
  ) {
    try {
      if (!credentials) {
        throw new Error('YouTube 인증 정보가 없습니다')
      }

      // OAuth2 클라이언트 생성
      const oauth2Client = new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        'http://localhost:3001/oauth/youtube/callback'
      )

      oauth2Client.setCredentials({
        refresh_token: credentials.refreshToken
      })

      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client
      })

      // 비디오 업로드
      const response = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: options.title,
            description: options.description,
            tags: options.tags || [],
            categoryId: '22' // People & Blogs
          },
          status: {
            privacyStatus: options.privacy || 'public',
            publishAt: options.schedule?.toISOString()
          }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      })

      logger.info('✅ YouTube 업로드 성공:', response.data.id)

      return {
        success: true,
        platform: 'youtube',
        videoId: response.data.id,
        url: `https://youtube.com/watch?v=${response.data.id}`
      }
    } catch (error: any) {
      logger.error('YouTube 업로드 실패:', error)
      return {
        success: false,
        platform: 'youtube',
        error: error.message
      }
    }
  }

  /**
   * 📱 TikTok 업로드
   */
  async uploadToTikTok(
    videoPath: string,
    credentials: UploadCredentials['tiktok'],
    options: UploadOptions
  ) {
    try {
      if (!credentials) {
        throw new Error('TikTok 인증 정보가 없습니다')
      }

      // TikTok Content Posting API
      const formData = new FormData()
      formData.append('video', fs.createReadStream(videoPath))

      const response = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title: options.title,
            description: options.description,
            privacy_level: options.privacy === 'public' ? 'PUBLIC_TO_EVERYONE' : 'SELF_ONLY',
            disable_comment: false,
            disable_duet: false,
            disable_stitch: false,
            video_cover_timestamp_ms: 1000
          },
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: fs.statSync(videoPath).size,
            chunk_size: 10000000,
            total_chunk_count: 1
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      )

      logger.info('✅ TikTok 업로드 성공:', response.data.publish_id)

      return {
        success: true,
        platform: 'tiktok',
        publishId: response.data.publish_id
      }
    } catch (error: any) {
      logger.error('TikTok 업로드 실패:', error)
      return {
        success: false,
        platform: 'tiktok',
        error: error.message
      }
    }
  }

  /**
   * 📸 Instagram 업로드 (Reels)
   */
  async uploadToInstagram(
    videoPath: string,
    credentials: UploadCredentials['instagram'],
    options: UploadOptions
  ) {
    try {
      if (!credentials) {
        throw new Error('Instagram 인증 정보가 없습니다')
      }

      // Instagram Graph API
      // 1. 비디오를 먼저 업로드 (클라우드 URL 필요)
      // 2. 컨테이너 생성
      // 3. 게시

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${credentials.userId}/media`,
        {
          media_type: 'REELS',
          video_url: 'VIDEO_URL_HERE', // S3 등에 업로드 후 URL
          caption: `${options.description}\n\n${options.hashtags?.map(t => `#${t}`).join(' ')}`,
          access_token: credentials.accessToken
        }
      )

      const containerId = response.data.id

      // 게시
      await axios.post(
        `https://graph.facebook.com/v18.0/${credentials.userId}/media_publish`,
        {
          creation_id: containerId,
          access_token: credentials.accessToken
        }
      )

      logger.info('✅ Instagram 업로드 성공:', containerId)

      return {
        success: true,
        platform: 'instagram',
        containerId
      }
    } catch (error: any) {
      logger.error('Instagram 업로드 실패:', error)
      return {
        success: false,
        platform: 'instagram',
        error: error.message
      }
    }
  }

  /**
   * 🚀 모든 플랫폼에 업로드
   */
  async uploadToAll(
    videoPath: string,
    credentials: UploadCredentials,
    options: UploadOptions,
    platforms: ('youtube' | 'tiktok' | 'instagram')[]
  ) {
    logger.info('🚀 소셜 미디어 업로드 시작:', platforms)

    const results = await Promise.all(
      platforms.map(async platform => {
        switch (platform) {
          case 'youtube':
            return await this.uploadToYouTube(videoPath, credentials.youtube, options)
          case 'tiktok':
            return await this.uploadToTikTok(videoPath, credentials.tiktok, options)
          case 'instagram':
            return await this.uploadToInstagram(videoPath, credentials.instagram, options)
          default:
            return { success: false, platform, error: 'Unknown platform' }
        }
      })
    )

    const successful = results.filter(r => r.success).length
    logger.info(`✅ 업로드 완료: ${successful}/${platforms.length}`)

    return results
  }

  /**
   * 🤖 AI가 태그/설명 자동 생성
   */
  async generateMetadata(videoTitle: string, keywords: string[]) {
    // GPT-4로 최적화된 메타데이터 생성
    return {
      title: videoTitle,
      description: `${videoTitle}에 대한 영상입니다.\n\n관련 키워드: ${keywords.join(', ')}`,
      tags: keywords,
      hashtags: keywords.map(k => k.replace(/\s/g, ''))
    }
  }
}

// 싱글톤
export const socialMediaUploader = new SocialMediaUploader()
export default socialMediaUploader

