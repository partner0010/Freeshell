/**
 * AI Platform Controller
 * 5단계: 플랫폼 변환
 */
import { aiPipelineService } from '@/lib/services/aiPipelineService';
import { paymentService } from '@/lib/services/paymentService';
import { aiStepResultStorage } from '@/lib/db/storage';

export class AIPlatformController {
  async execute(projectId: string, userId: string, inputData: {
    targetPlatform: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
    originalPlatform?: string;
  }) {
    // 플랫폼 변환은 유료 플랜 전용
    const { plan } = paymentService.getActivePlan(userId);
    if (!paymentService.checkPlanLimit(userId, 'platformConversion')) {
      throw new Error('플랫폼 변환 기능은 유료 플랜에서만 이용 가능합니다. 플랜을 업그레이드해주세요.');
    }

    // 이전 단계 결과 가져오기
    const qualityResult = aiStepResultStorage.findByProjectIdAndStepType(projectId, 'QUALITY');

    if (!qualityResult || qualityResult.status !== 'success') {
      throw new Error('4단계(품질 개선) 결과가 필요합니다.');
    }

    return aiPipelineService.executeStep(projectId, 'PLATFORM', {
      ...inputData,
      improvedContent: qualityResult.output_data,
    });
  }
}

export const aiPlatformController = new AIPlatformController();

