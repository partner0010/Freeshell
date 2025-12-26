/**
 * 자기 학습 시스템 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { selfLearningSystem } from '@/lib/ai/self-learning';
import { metaLearningSystem } from '@/lib/ai/meta-learning';
import { selfMonitoringSystem } from '@/lib/ai/self-monitoring';
import { selfImprovementSystem } from '@/lib/ai/self-improvement';

export const runtime = 'nodejs';

/**
 * 자기 평가 수행
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'assess':
        // 자기 평가 수행
        const assessment = await selfMonitoringSystem.performSelfAssessment();
        return NextResponse.json({ success: true, data: assessment });

      case 'learn':
        // 경험 학습
        await selfLearningSystem.learnFromExperience(data);
        return NextResponse.json({ success: true, message: '경험이 학습되었습니다.' });

      case 'improve':
        // 자기 개선 트리거
        await selfImprovementSystem.triggerAutomaticImprovement();
        return NextResponse.json({ success: true, message: '자기 개선이 시작되었습니다.' });

      case 'create_plan':
        // 개선 계획 수립
        const plan = await selfImprovementSystem.createImprovementPlan(
          data.target,
          data.currentState,
          data.desiredState
        );
        return NextResponse.json({ success: true, data: plan });

      case 'execute_plan':
        // 개선 계획 실행
        const result = await selfImprovementSystem.executeImprovementPlan(data.planId);
        return NextResponse.json({ success: true, data: result });

      default:
        return NextResponse.json(
          { error: `지원하지 않는 액션: ${action}` },
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
 * 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'learning':
        const learningStats = selfLearningSystem.getLearningStats();
        const performance = selfLearningSystem.analyzePerformance();
        return NextResponse.json({
          success: true,
          data: {
            ...learningStats,
            performance,
          },
        });

      case 'monitoring':
        const status = selfMonitoringSystem.getCurrentStatus();
        return NextResponse.json({ success: true, data: status });

      case 'improvement':
        const improvementStats = selfImprovementSystem.getImprovementStats();
        const plans = selfImprovementSystem.getAllImprovementPlans();
        return NextResponse.json({
          success: true,
          data: {
            ...improvementStats,
            plans,
          },
        });

      case 'meta':
        const metaStats = metaLearningSystem.getStrategyStats();
        return NextResponse.json({ success: true, data: metaStats });

      case 'all':
        // 모든 정보 통합
        return NextResponse.json({
          success: true,
          data: {
            learning: {
              ...selfLearningSystem.getLearningStats(),
              performance: selfLearningSystem.analyzePerformance(),
            },
            monitoring: selfMonitoringSystem.getCurrentStatus(),
            improvement: {
              ...selfImprovementSystem.getImprovementStats(),
              plans: selfImprovementSystem.getAllImprovementPlans(),
            },
            meta: metaLearningSystem.getStrategyStats(),
          },
        });

      default:
        return NextResponse.json({
          success: true,
          message: '자기 학습 시스템 API',
          availableTypes: ['learning', 'monitoring', 'improvement', 'meta', 'all'],
        });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: '조회 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

