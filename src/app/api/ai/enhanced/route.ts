/**
 * 강화된 AI 솔루션 API
 * 모든 기능을 통합한 최고 수준의 AI 엔드포인트
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedReasoning } from '@/lib/ai/advanced-reasoning';
import { onlineServices } from '@/lib/ai/online-services';
import { codeExecutor } from '@/lib/ai/code-executor';
import { knowledgeGraph } from '@/lib/ai/knowledge-graph';
import { internetMonitor } from '@/lib/ai/internet-monitor';
import { eventStreamManager } from '@/lib/realtime/event-stream';

export const runtime = 'nodejs';

/**
 * 통합 AI 요청 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, mode, options } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'query가 필요합니다.' },
        { status: 400 }
      );
    }

    const modeType = mode || 'reasoning';

    switch (modeType) {
      case 'reasoning':
        // 고급 추론
        const reasoning = await advancedReasoning.chainOfThought(query, options?.context);
        return NextResponse.json({ success: true, data: reasoning });

      case 'code':
        // 코드 생성 및 실행
        const codeResult = await codeExecutor.generateAndExecute(
          query,
          options?.language || 'python'
        );
        return NextResponse.json({ success: true, data: codeResult });

      case 'knowledge':
        // 지식 검색
        const knowledge = await knowledgeGraph.searchSimilar(query, options?.limit || 10);
        return NextResponse.json({ success: true, data: knowledge });

      case 'services':
        // 온라인 서비스 조회
        const services = await onlineServices.gatherContextualInfo(query);
        return NextResponse.json({ success: true, data: services });

      case 'monitor':
        // 인터넷 모니터링 시작
        const monitorId = `monitor-${Date.now()}`;
        internetMonitor.startMonitoring(monitorId, {
          keywords: options?.keywords || [query],
          sources: options?.sources || [],
          frequency: options?.frequency || 'hourly',
          callback: (data) => {
            eventStreamManager.notificationEvent(
              `새로운 정보가 수집되었습니다: ${data.length}개 항목`,
              'info'
            );
          },
        });
        return NextResponse.json({ success: true, data: { monitorId } });

      case 'comprehensive':
        // 종합 모드 (모든 기능 활용)
        return await handleComprehensive(query, options);

      default:
        return NextResponse.json(
          { error: `지원하지 않는 모드: ${modeType}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

/**
 * 종합 모드 처리
 */
async function handleComprehensive(query: string, options: any) {
  const results: Record<string, any> = {};

  // 1. 지식 그래프 검색
  try {
    const knowledge = await knowledgeGraph.searchSimilar(query, 5);
    results.knowledge = knowledge;
  } catch (error) {
    console.warn('지식 검색 실패:', error);
  }

  // 2. 온라인 서비스 조회
  try {
    const services = await onlineServices.gatherContextualInfo(query);
    results.services = services;
  } catch (error) {
    console.warn('서비스 조회 실패:', error);
  }

  // 3. 고급 추론
  try {
    const reasoning = await advancedReasoning.chainOfThought(query, results);
    results.reasoning = reasoning;
  } catch (error) {
    console.warn('추론 실패:', error);
  }

  // 4. 트렌드 분석 (뉴스 관련인 경우)
  if (query.match(/트렌드|뉴스|최신/)) {
    try {
      const keywords = query.match(/\b\w{2,}\b/g) || [];
      const trends = await internetMonitor.analyzeTrends(keywords.slice(0, 5), 7);
      results.trends = trends;
    } catch (error) {
      console.warn('트렌드 분석 실패:', error);
    }
  }

  return NextResponse.json({ success: true, data: results });
}

/**
 * GET: 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'knowledge':
        const knowledgeNodes = knowledgeGraph.getAllNodes();
        return NextResponse.json({ success: true, data: knowledgeNodes });

      case 'monitors':
        // 모니터링 상태 (실제로는 저장된 모니터 목록 반환)
        return NextResponse.json({ success: true, data: [] });

      default:
        return NextResponse.json({
          success: true,
          message: '강화된 AI 솔루션 API',
          features: [
            '고급 추론 엔진',
            '지식 그래프',
            '온라인 서비스 통합',
            '코드 생성 및 실행',
            '인터넷 모니터링',
            '종합 분석',
          ],
        });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

