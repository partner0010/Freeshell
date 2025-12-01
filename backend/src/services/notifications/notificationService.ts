import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'

export interface NotificationData {
  userId?: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  link?: string
}

/**
 * 알림 서비스
 */
export class NotificationService {
  /**
   * 알림 생성
   */
  async createNotification(data: NotificationData): Promise<string> {
    const prisma = getPrismaClient()

    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link
      }
    })

    logger.info(`알림 생성됨: ${notification.title} (${notification.id})`)
    return notification.id
  }

  /**
   * 사용자 알림 조회
   */
  async getUserNotifications(userId: string, unreadOnly: boolean = false) {
    const prisma = getPrismaClient()

    const where: any = { userId }
    if (unreadOnly) {
      where.isRead = false
    }

    return await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    const prisma = getPrismaClient()

    const where: any = { id: notificationId }
    if (userId) {
      where.userId = userId
    }

    await prisma.notification.updateMany({
      where,
      data: { isRead: true }
    })
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string): Promise<void> {
    const prisma = getPrismaClient()

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  }

  /**
   * 알림 삭제
   */
  async deleteNotification(notificationId: string, userId?: string): Promise<void> {
    const prisma = getPrismaClient()

    const where: any = { id: notificationId }
    if (userId) {
      where.userId = userId
    }

    await prisma.notification.deleteMany({ where })
  }

  /**
   * 성공 알림
   */
  async notifySuccess(userId: string, title: string, message: string, link?: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'success',
      title,
      message,
      link
    })
  }

  /**
   * 에러 알림
   */
  async notifyError(userId: string, title: string, message: string, link?: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'error',
      title,
      message,
      link
    })
  }

  /**
   * 경고 알림
   */
  async notifyWarning(userId: string, title: string, message: string, link?: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'warning',
      title,
      message,
      link
    })
  }

  /**
   * 정보 알림
   */
  async notifyInfo(userId: string, title: string, message: string, link?: string): Promise<string> {
    return this.createNotification({
      userId,
      type: 'info',
      title,
      message,
      link
    })
  }
}

export const notificationService = new NotificationService()

