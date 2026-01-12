/**
 * 관리자 분석 API
 * 사용자 접속 현황, 메뉴별 사용 통계 등
 */
import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsData {
  timestamp: string;
  dateRange: {
    start: string;
    end: string;
  };
  users: {
    total: number;
    active: number;
    new: number;
    returning: number;
  };
  traffic: {
    total: number;
    unique: number;
    pageViews: number;
    sessions: number;
    averageSessionDuration: number;
  };
  menuUsage: {
    [menu: string]: {
      views: number;
      uniqueUsers: number;
      averageTime: number;
    };
  };
  realTime: {
    activeUsers: number;
    currentPage: string;
    lastActivity: string;
  };
}

// 실제로는 데이터베이스에서 조회
let analyticsData: AnalyticsData[] = [];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const realTime = searchParams.get('realtime') === 'true';

    if (realTime) {
      // 실시간 데이터
      return NextResponse.json({
        success: true,
        data: {
          activeUsers: Math.floor(Math.random() * 100) + 10,
          currentPage: '/',
          lastActivity: new Date().toISOString(),
        },
      });
    }

    // 날짜 범위 데이터
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // 시뮬레이션 데이터 (실제로는 데이터베이스에서 조회)
    const data: AnalyticsData = {
      timestamp: new Date().toISOString(),
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      users: {
        total: 1250,
        active: 342,
        new: 89,
        returning: 253,
      },
      traffic: {
        total: 5432,
        unique: 1250,
        pageViews: 8765,
        sessions: 3421,
        averageSessionDuration: 245, // seconds
      },
      menuUsage: {
        '/': { views: 1234, uniqueUsers: 456, averageTime: 120 },
        '/build': { views: 567, uniqueUsers: 234, averageTime: 300 },
        '/editor': { views: 345, uniqueUsers: 123, averageTime: 600 },
        '/templates/website': { views: 234, uniqueUsers: 89, averageTime: 180 },
        '/admin': { views: 12, uniqueUsers: 3, averageTime: 900 },
      },
      realTime: {
        activeUsers: 23,
        currentPage: '/',
        lastActivity: new Date().toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('[Analytics API] 오류:', error);
    return NextResponse.json(
      { error: '분석 데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 사용자 활동 로깅 (실제로는 데이터베이스에 저장)
    const body = await request.json();
    const { page, userId, action } = body;

    // 여기서는 시뮬레이션만 수행
    return NextResponse.json({
      success: true,
      message: '활동이 기록되었습니다.',
    });
  } catch (error: any) {
    console.error('[Analytics API] POST 오류:', error);
    return NextResponse.json(
      { error: '활동 기록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
