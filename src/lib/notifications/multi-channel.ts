/**
 * 다채널 알림 시스템
 * Multi-Channel Notification System
 */

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'security';
  title: string;
  message: string;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: number;
  readAt?: number;
  actionUrl?: string;
}

export interface NotificationChannel {
  type: 'push' | 'email' | 'sms' | 'webhook' | 'in-app';
  enabled: boolean;
  sent: boolean;
  sentAt?: number;
  error?: string;
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    webhook: boolean;
    inApp: boolean;
  };
  types: {
    info: string[];
    warning: string[];
    error: string[];
    success: string[];
    security: string[];
  };
  quietHours?: { start: number; end: number }; // 0-23
}

// 다채널 알림 시스템
export class MultiChannelNotificationSystem {
  private notifications: Map<string, Notification> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();

  // 알림 전송
  async send(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    // 사용자 설정 확인
    const prefs = this.preferences.get(notification.userId) || this.getDefaultPreferences(notification.userId);

    // 각 채널로 전송
    for (const channel of fullNotification.channels) {
      if (this.isChannelEnabled(channel.type, notification.type, prefs)) {
        try {
          await this.sendToChannel(channel.type, fullNotification);
          channel.sent = true;
          channel.sentAt = Date.now();
        } catch (error) {
          channel.error = String(error);
        }
      }
    }

    this.notifications.set(fullNotification.id, fullNotification);
    return fullNotification;
  }

  // 채널별 전송
  private async sendToChannel(channel: NotificationChannel['type'], notification: Notification): Promise<void> {
    switch (channel) {
      case 'push':
        await this.sendPush(notification);
        break;
      case 'email':
        await this.sendEmail(notification);
        break;
      case 'sms':
        await this.sendSMS(notification);
        break;
      case 'webhook':
        await this.sendWebhook(notification);
        break;
      case 'in-app':
        // 인앱 알림은 클라이언트에서 처리
        break;
    }
  }

  private async sendPush(notification: Notification): Promise<void> {
    // 실제로는 Push API 사용
    // 여기서는 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async sendEmail(notification: Notification): Promise<void> {
    // 실제로는 이메일 서비스 사용
    // 여기서는 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  private async sendSMS(notification: Notification): Promise<void> {
    // 실제로는 SMS 서비스 사용
    // 여기서는 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  private async sendWebhook(notification: Notification): Promise<void> {
    // 실제로는 Webhook 호출
    // 여기서는 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // 채널 활성화 확인
  private isChannelEnabled(
    channel: NotificationChannel['type'],
    type: Notification['type'],
    prefs: NotificationPreferences
  ): boolean {
    // 조용한 시간 체크
    if (prefs.quietHours) {
      const hour = new Date().getHours();
      if (hour >= prefs.quietHours.start && hour < prefs.quietHours.end) {
        // 긴급 알림만 전송
        return type === 'security' || type === 'error';
      }
    }

    // 채널 활성화 확인 (in-app 키는 inApp으로 매핑)
    const channelKey = channel === 'in-app' ? 'inApp' : channel;
    if (!prefs.channels[channelKey]) return false;

    // 타입별 채널 확인
    return prefs.types[type].includes(channel);
  }

  // 기본 설정
  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        push: true,
        email: true,
        sms: false,
        webhook: false,
        inApp: true,
      },
      types: {
        info: ['in-app'],
        warning: ['in-app', 'push'],
        error: ['in-app', 'push', 'email'],
        success: ['in-app'],
        security: ['in-app', 'push', 'email', 'sms'],
      },
    };
  }

  // 알림 읽음 처리
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.readAt = Date.now();
    }
  }

  // 사용자 알림 목록
  getUserNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    let notifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId);

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.readAt);
    }

    return notifications.sort((a, b) => b.createdAt - a.createdAt);
  }

  // 설정 업데이트
  updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): void {
    const existing = this.preferences.get(userId) || this.getDefaultPreferences(userId);
    this.preferences.set(userId, { ...existing, ...preferences });
  }
}

export const multiChannelNotificationSystem = new MultiChannelNotificationSystem();

