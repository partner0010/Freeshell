/**
 * 알림 API
 * 사용자 알림 조회 및 관리
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export const runtime = 'nodejs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  url?: string;
}

// 알림 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // 실제로는 데이터베이스에서 사용자별 알림을 가져옴
    // 여기서는 동적 알림 생성 (워크플로우, 스케줄 상태 등)
    const notifications: Notification[] = [];
    
    // 워크플로우 완료 알림 (실제로는 워크플로우 실행 기록에서 가져옴)
    try {
      const { workflowManager } = await import('@/lib/automation/workflow-manager');
      if (workflowManager) {
        const workflows = workflowManager.getAllWorkflows();
        const recentWorkflows = workflows
          .filter(w => w.lastRun && new Date(w.lastRun).getTime() > Date.now() - 86400000) // 최근 24시간
          .slice(0, 3);
        
        recentWorkflows.forEach(workflow => {
          notifications.push({
            id: `workflow-${workflow.id}`,
            type: 'success',
            title: '워크플로우 실행 완료',
            message: `${workflow.name}이(가) 성공적으로 실행되었습니다.`,
            timestamp: workflow.lastRun || new Date(),
            read: false,
            url: '/agents?tab=workflows',
          });
        });
      }
    } catch (error) {
      console.warn('워크플로우 알림 수집 실패:', error);
    }
    
    // 스케줄 알림
    try {
      const { contentScheduler } = await import('@/lib/scheduling/scheduler');
      const schedules = contentScheduler.getAllSchedules();
      const dueSchedules = schedules.filter(s => 
        s.status === 'active' && 
        s.nextRun && 
        new Date(s.nextRun).getTime() <= Date.now() + 3600000 // 1시간 이내
      );
      
      dueSchedules.slice(0, 2).forEach(schedule => {
        notifications.push({
          id: `schedule-${schedule.id}`,
          type: 'info',
          title: '스케줄 실행 예정',
          message: `${schedule.config.topic} 스케줄이 곧 실행됩니다.`,
          timestamp: new Date(),
          read: false,
          url: '/agents?tab=scheduled',
        });
      });
    } catch (error) {
      console.warn('스케줄 알림 수집 실패:', error);
    }
    
    // 기본 알림 (알림이 없을 때)
    if (notifications.length === 0) {
      notifications.push({
        id: '1',
        type: 'info',
        title: '새로운 기능이 추가되었습니다!',
        message: 'AI 채팅에 음성 입력 기능이 추가되었습니다.',
        timestamp: new Date(),
        read: false,
        url: '/',
      });
    }

    // 읽지 않은 알림만 필터링 (선택적)
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const filteredNotifications = unreadOnly
      ? notifications.filter(n => !n.read)
      : notifications;

    return NextResponse.json({
      success: true,
      notifications: filteredNotifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '알림 조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 알림 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { type, title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'title과 message가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에 알림 저장
    // 여기서는 성공 응답만 반환
    const notification: Notification = {
      id: `notification-${Date.now()}`,
      type: type || 'info',
      title,
      message,
      timestamp: new Date(),
      read: false,
      url: url || undefined,
    };

    return NextResponse.json({
      success: true,
      message: '알림이 생성되었습니다.',
      data: notification,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '알림 생성 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

// 알림 읽음 처리
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, read } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제로는 데이터베이스에서 알림 상태 업데이트
    // 여기서는 성공 응답만 반환
    return NextResponse.json({
      success: true,
      message: '알림 상태가 업데이트되었습니다.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: '알림 업데이트 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

