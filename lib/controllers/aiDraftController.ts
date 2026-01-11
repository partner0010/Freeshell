/**
 * AI Draft Controller
 * 3단계: 초안 생성
 */
import { aiPipelineService } from '@/lib/services/aiPipelineService';
import { paymentService } from '@/lib/services/paymentService';
import { aiStepResultStorage } from '@/lib/db/storage';

export class AIDraftController {
  async execute(projectId: string, userId: string, inputData: {
    contentType: 'youtube-script' | 'blog-post' | 'sns-post' | 'instagram-caption' | 'twitter-thread';
  }) {
    // 업그레이드 필요 여부 확인
    if (paymentService.checkUpgradeRequired(userId, 'DRAFT')) {
      throw new Error('이 기능을 사용하려면 플랜 업그레이드가 필요합니다.');
    }

    // 이전 단계 결과 가져오기
    const planResult = aiStepResultStorage.findByProjectIdAndStepType(projectId, 'PLAN');
    const structureResult = aiStepResultStorage.findByProjectIdAndStepType(projectId, 'STRUCTURE');

    if (!planResult || planResult.status !== 'success') {
      throw new Error('1단계(기획) 결과가 필요합니다.');
    }

    if (!structureResult || structureResult.status !== 'success') {
      throw new Error('2단계(구조) 결과가 필요합니다.');
    }

    return aiPipelineService.executeStep(projectId, 'DRAFT', {
      ...inputData,
      plan: planResult.output_data,
      structure: structureResult.output_data,
    });
  }
}

export const aiDraftController = new AIDraftController();

