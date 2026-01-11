/**
 * AI Quality Controller
 * 4단계: 품질 개선
 */
import { aiPipelineService } from '@/lib/services/aiPipelineService';
import { paymentService } from '@/lib/services/paymentService';
import { aiStepResultStorage } from '@/lib/db/storage';

export class AIQualityController {
  async execute(projectId: string, userId: string, inputData: {
    contentType: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
  }) {
    // 업그레이드 필요 여부 확인 (무료 플랜은 3단계까지만)
    if (paymentService.checkUpgradeRequired(userId, 'QUALITY')) {
      throw new Error('이 기능을 사용하려면 플랜 업그레이드가 필요합니다. 3단계 이후는 유료 플랜에서만 이용 가능합니다.');
    }

    // 이전 단계 결과 가져오기
    const planResult = aiStepResultStorage.findByProjectIdAndStepType(projectId, 'PLAN');
    const draftResult = aiStepResultStorage.findByProjectIdAndStepType(projectId, 'DRAFT');

    if (!planResult || planResult.status !== 'success') {
      throw new Error('1단계(기획) 결과가 필요합니다.');
    }

    if (!draftResult || draftResult.status !== 'success') {
      throw new Error('3단계(초안) 결과가 필요합니다.');
    }

    return aiPipelineService.executeStep(projectId, 'QUALITY', {
      ...inputData,
      plan: planResult.output_data,
      draft: draftResult.output_data,
    });
  }
}

export const aiQualityController = new AIQualityController();

