/**
 * AI Pipeline 서비스
 * AI 단계 실행 및 결과 저장을 관리
 */
import { aiStepResultStorage } from '@/lib/db/storage';
import { projectStorage } from '@/lib/db/storage';
import type { AIStepResult, CreateAIStepResultInput, StepType, StepStatus } from '@/lib/models/AIStepResult';
import { planContent } from '@/lib/content-planner';
import { structureContent } from '@/lib/content-structurer';
import { draftContent } from '@/lib/content-drafter';
import { improveContent } from '@/lib/content-improver';
import { convertToPlatform } from '@/lib/content-converter';
import type { ContentPlan } from '@/lib/content-planner';
import type { ContentStructure } from '@/lib/content-structurer';
import type { ContentDraft } from '@/lib/content-drafter';
import type { ImprovedContent } from '@/lib/content-improver';
import type { PlatformContent } from '@/lib/content-converter';

export class AIPipelineService {
  /**
   * AI 단계 실행 및 결과 저장
   */
  async executeStep(
    projectId: string,
    stepType: StepType,
    inputData: any
  ): Promise<AIStepResult> {
    // 프로젝트 확인
    const project = projectStorage.findById(projectId);
    if (!project) {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    // 입력 데이터 저장
    const stepResult = aiStepResultStorage.create({
      project_id: projectId,
      step_type: stepType,
      input_data: inputData,
      output_data: null,
      status: 'retry',
    });

    try {
      let outputData: any = null;

      // 단계별 실행
      switch (stepType) {
        case 'PLAN':
          outputData = await planContent(
            inputData.targetAudience,
            inputData.purpose,
            inputData.platform,
            inputData.additionalInfo
          );
          break;

        case 'STRUCTURE':
          outputData = await structureContent(
            inputData.topic,
            inputData.coreMessage,
            inputData.platform,
            inputData.contentType
          );
          break;

        case 'DRAFT':
          outputData = await draftContent(
            inputData.structure as ContentStructure,
            inputData.plan as ContentPlan,
            inputData.contentType
          );
          break;

        case 'QUALITY':
          outputData = await improveContent(
            inputData.draft as ContentDraft,
            inputData.plan as ContentPlan,
            inputData.contentType
          );
          break;

        case 'PLATFORM':
          outputData = await convertToPlatform(
            inputData.improvedContent as ImprovedContent,
            inputData.targetPlatform,
            inputData.originalPlatform
          );
          break;

        default:
          throw new Error(`지원하지 않는 단계: ${stepType}`);
      }

      // 성공으로 업데이트
      return aiStepResultStorage.update(stepResult.id, {
        output_data: outputData,
        status: 'success',
      }) as AIStepResult;
    } catch (error: any) {
      // 실패로 업데이트
      return aiStepResultStorage.update(stepResult.id, {
        output_data: { error: error.message },
        status: 'failed',
      }) as AIStepResult;
    }
  }

  /**
   * 프로젝트의 특정 단계 결과 조회
   */
  getStepResult(projectId: string, stepType: StepType): AIStepResult | undefined {
    return aiStepResultStorage.findByProjectIdAndStepType(projectId, stepType);
  }

  /**
   * 프로젝트의 모든 단계 결과 조회
   */
  getProjectStepResults(projectId: string): AIStepResult[] {
    return aiStepResultStorage.findByProjectId(projectId);
  }

  /**
   * 단계 재시도 (기존 결과는 유지하고 새 결과 생성)
   */
  async retryStep(
    projectId: string,
    stepType: StepType,
    inputData: any
  ): Promise<AIStepResult> {
    // 기존 결과는 유지하고 새로 생성
    return this.executeStep(projectId, stepType, inputData);
  }
}

export const aiPipelineService = new AIPipelineService();

