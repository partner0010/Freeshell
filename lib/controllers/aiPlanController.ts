/**
 * AI Plan Controller
 * 1단계: 콘텐츠 기획
 */
import { aiPipelineService } from '@/lib/services/aiPipelineService';
import { paymentService } from '@/lib/services/paymentService';

export class AIPlanController {
  async execute(projectId: string, userId: string, inputData: {
    targetAudience: string;
    purpose: 'traffic' | 'conversion' | 'branding';
    platform: string;
    additionalInfo?: string;
  }) {
    // 업그레이드 필요 여부 확인
    if (paymentService.checkUpgradeRequired(userId, 'PLAN')) {
      throw new Error('이 기능을 사용하려면 플랜 업그레이드가 필요합니다.');
    }

    return aiPipelineService.executeStep(projectId, 'PLAN', inputData);
  }
}

export const aiPlanController = new AIPlanController();

