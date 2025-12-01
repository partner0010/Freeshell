import axios from 'axios'
import { BlogPost } from './generator'
import { logger } from '../../utils/logger'

/**
 * WordPress에 블로그 포스트 게시
 */
export async function publishToWordPress(
  blogPost: BlogPost,
  siteUrl: string,
  username: string,
  password: string
): Promise<{ success: boolean; postId?: number; url?: string }> {
  try {
    // WordPress REST API 사용
    const auth = Buffer.from(`${username}:${password}`).toString('base64')

    const response = await axios.post(
      `${siteUrl}/wp-json/wp/v2/posts`,
      {
        title: blogPost.title,
        content: blogPost.content,
        excerpt: blogPost.excerpt,
        status: 'publish',
        categories: [blogPost.category],
        tags: blogPost.tags
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    )

    logger.info('WordPress 게시 성공:', response.data.id)
    return {
      success: true,
      postId: response.data.id,
      url: response.data.link
    }

  } catch (error: any) {
    logger.error('WordPress 게시 실패:', error)
    throw error
  }
}

/**
 * Medium에 블로그 포스트 게시
 */
export async function publishToMedium(
  blogPost: BlogPost,
  accessToken: string,
  userId: string
): Promise<{ success: boolean; postId?: string; url?: string }> {
  try {
    const response = await axios.post(
      `https://api.medium.com/v1/users/${userId}/posts`,
      {
        title: blogPost.title,
        contentFormat: 'html',
        content: blogPost.content,
        tags: blogPost.tags,
        publishStatus: 'public'
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    logger.info('Medium 게시 성공:', response.data.data.id)
    return {
      success: true,
      postId: response.data.data.id,
      url: response.data.data.url
    }

  } catch (error: any) {
    logger.error('Medium 게시 실패:', error)
    throw error
  }
}

/**
 * Blogger에 블로그 포스트 게시
 */
export async function publishToBlogger(
  blogPost: BlogPost,
  blogId: string,
  accessToken: string
): Promise<{ success: boolean; postId?: string; url?: string }> {
  try {
    const response = await axios.post(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`,
      {
        title: blogPost.title,
        content: blogPost.content,
        labels: blogPost.tags
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    logger.info('Blogger 게시 성공:', response.data.id)
    return {
      success: true,
      postId: response.data.id,
      url: response.data.url
    }

  } catch (error: any) {
    logger.error('Blogger 게시 실패:', error)
    throw error
  }
}

