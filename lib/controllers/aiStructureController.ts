/**
 * AI Structure Controller
 * 2단계: 콘텐츠 구조
 */
import { aiPipelineService } from '@/lib/services/aiPipelineService';
import { paymentService } from '@/lib/services/paymentService';

export class AIStructureController {
  async execute(projectId: string, userId: string, inputData: {
    topic: string;
    coreMessage: string;
    platform: string;
    contentType: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
  }) {
    // 업그레이드 필요 여부 확인
    if (paymentService.checkUpgradeRequired(userId, 'STRUCTURE')) {
      throw new Error('이 기능을 사용하려면 플랜 업그레이드가 필요합니다.');
    }

    return aiPipelineService.executeStep(projectId, 'STRUCTURE', inputData);
  }
}

export const aiStructureController = new AIStructureController();

