/**
 * 모든 학습 시스템 통합 API
 * Learning Systems Integration API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLearningSystemSummary, checkLearningSystemHealth } from '@/lib/ai/learning-summary';
import { crossFeatureLearning } from '@/lib/ai/cross-feature-learning';
import { reinforcementLearning } from '@/lib/ai/reinforcement-learning';
import { adaptiveLearning } from '@/lib/ai/adaptive-learning';
import { predictiveLearning } from '@/lib/ai/predictive-learning';
import { hyperparameterTuning } from '@/lib/ai/hyperparameter-tuning';

export const runtime = 'nodejs';

/**
 * 학습 시스템 통계 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'summary':
        const summary = await getLearningSystemSummary();
        return NextResponse.json({ success: true, data: summary });

      case 'health':
        const health = checkLearningSystemHealth();
        return NextResponse.json({ success: true, data: health });

      case 'cross-feature':
        const crossStats = crossFeatureLearning.getStats();
        return NextResponse.json({ success: true, data: crossStats });

      case 'reinforcement':
        const rlStats = reinforcementLearning.getStats();
        return NextResponse.json({ success: true, data: rlStats });

      case 'adaptive':
        const adaptiveStats = adaptiveLearning.getStats();
        return NextResponse.json({ success: true, data: adaptiveStats });

      case 'predictive':
        const predictiveStats = predictiveLearning.getStats();
        return NextResponse.json({ success: true, data: predictiveStats });

      case 'hyperparameter':
        const hyperStats = hyperparameterTuning.getStats();
        return NextResponse.json({ success: true, data: hyperStats });

      case 'all':
        // 모든 학습 시스템 통계
        return NextResponse.json({
          success: true,
          data: {
            summary: await getLearningSystemSummary(),
            health: checkLearningSystemHealth(),
            crossFeature: crossFeatureLearning.getStats(),
            reinforcement: reinforcementLearning.getStats(),
            adaptive: adaptiveLearning.getStats(),
            predictive: predictiveLearning.getStats(),
            hyperparameter: hyperparameterTuning.getStats(),
          },
        });

      default:
        return NextResponse.json({
          success: true,
          message: '학습 시스템 통합 API',
          availableTypes: [
            'summary',
            'health',
            'cross-feature',
            'reinforcement',
            'adaptive',
            'predictive',
            'hyperparameter',
            'all',
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

/**
 * 학습 시스템 작업 수행
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'tune_hyperparameters':
        const feature = data.feature || 'autonomous_agent';
        const config = await hyperparameterTuning.tuneHyperparameters(feature);
        return NextResponse.json({ success: true, data: config });

      case 'adapt_strategy':
        const strategy = adaptiveLearning.getOptimalStrategy(data.feature);
        return NextResponse.json({ success: true, data: strategy });

      case 'predict_scenarios':
        const predictions = await predictiveLearning.predictFutureScenarios(
          data.context || {},
          data.feature || 'autonomous_agent'
        );
        return NextResponse.json({ success: true, data: predictions });

      case 'transfer_learning':
        const transfer = await crossFeatureLearning.transferLearning(
          data.sourceFeature,
          data.targetFeature,
          data.experience
        );
        return NextResponse.json({ success: true, data: transfer });

      case 'select_action':
        const actionResult = reinforcementLearning.selectAction(
          data.state,
          data.availableActions || []
        );
        return NextResponse.json({ success: true, data: { action: actionResult } });

      case 'record_reward':
        reinforcementLearning.recordReward(
          data.actionId,
          data.value,
          data.reason || ''
        );
        return NextResponse.json({ success: true, message: '보상이 기록되었습니다.' });

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

