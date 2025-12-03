/**
 * AI 협업 오케스트레이터
 * 여러 AI가 각자의 강점을 살려 협업하여 최고의 결과물을 생성
 * 
 * 새로운 기능:
 * - 이미지 생성 (DALL-E 3, Stable Diffusion)
 * - 음성 생성 (ElevenLabs, OpenAI TTS, Google TTS)
 * - 영상 생성 (Runway Gen-3, Replicate, D-ID)
 */

import { logger } from '../../utils/logger'
import { imageGenerator } from './imageGenerator'
import { voiceGenerator } from './voiceGenerator'
import { videoGenerator } from './videoGenerator'

// AI별 특화 분야 정의
export const AI_SPECIALTIES = {
  openai: {
    name: 'OpenAI GPT',
    strengths: ['창의적 글쓰기', '코드 생성', '일반 지식', '추론'],
    bestFor: ['스토리텔링', '아이디어 생성', '프로그래밍', '문서 작성'],
    role: 'creative_writer',
    icon: '🤖'
  },
  claude: {
    name: 'Claude',
    strengths: ['분석', '구조화', '윤리적 추론', '긴 문서 처리'],
    bestFor: ['데이터 분석', '논리적 설명', '교육 콘텐츠', '전문 문서'],
    role: 'analyst',
    icon: '🧠'
  },
  gemini: {
    name: 'Google Gemini',
    strengths: ['다국어', '최신 정보', '검색 통합', '멀티모달'],
    bestFor: ['글로벌 콘텐츠', '최신 트렌드', '번역', '이미지 분석'],
    role: 'researcher',
    icon: '🌟'
  },
  nanobana: {
    name: 'NanoBana AI',
    strengths: ['한국어', '로컬 문화', '한국 트렌드'],
    bestFor: ['한국어 콘텐츠', 'K-컬처', '한국 시장'],
    role: 'local_expert',
    icon: '🇰🇷'
  },
  kling: {
    name: 'Kling AI',
    strengths: ['영상 생성', '비디오 편집', '시각적 콘텐츠'],
    bestFor: ['숏폼 영상', '영상 스크립트', '비주얼 기획'],
    role: 'video_creator',
    icon: '🎬'
  },
  supertone: {
    name: 'SuperTone AI',
    strengths: ['음성 합성', '오디오 처리', '음악'],
    bestFor: ['보이스오버', '오디오북', '음성 콘텐츠'],
    role: 'audio_specialist',
    icon: '🎵'
  }
} as const

export type AIServiceType = keyof typeof AI_SPECIALTIES

// 작업 유형별 최적 AI 조합
export const TASK_AI_COMBINATIONS = {
  'youtube_script': {
    name: '유튜브 스크립트 작성',
    ais: ['openai', 'claude', 'gemini'] as AIServiceType[],
    workflow: {
      openai: '창의적인 스토리 구성과 후크 생성',
      claude: '논리적 구조화와 정보 검증',
      gemini: '최신 트렌드 반영 및 SEO 최적화'
    }
  },
  'shorts_content': {
    name: '숏폼 콘텐츠 제작',
    ais: ['openai', 'kling', 'supertone'] as AIServiceType[],
    workflow: {
      openai: '임팩트 있는 스크립트 작성',
      kling: '영상 비주얼 기획 및 편집 가이드',
      supertone: '보이스오버 및 배경음악 제안'
    }
  },
  'korean_content': {
    name: '한국어 콘텐츠 제작',
    ais: ['nanobana', 'openai', 'claude'] as AIServiceType[],
    workflow: {
      nanobana: '한국 문화 및 트렌드 반영',
      openai: '창의적인 표현 및 아이디어',
      claude: '구조화 및 완성도 향상'
    }
  },
  'educational': {
    name: '교육 콘텐츠',
    ais: ['claude', 'gemini', 'openai'] as AIServiceType[],
    workflow: {
      claude: '체계적인 교육 구조 설계',
      gemini: '최신 정보 및 사례 수집',
      openai: '이해하기 쉬운 설명 작성'
    }
  },
  'creative_writing': {
    name: '창의적 글쓰기',
    ais: ['openai', 'claude', 'nanobana'] as AIServiceType[],
    workflow: {
      openai: '독창적인 아이디어 및 스토리 전개',
      claude: '플롯 구조화 및 캐릭터 설정',
      nanobana: '한국 독자 감성 반영'
    }
  },
  'general': {
    name: '일반 대화',
    ais: ['openai', 'claude', 'gemini'] as AIServiceType[],
    workflow: {
      openai: '대화 리드 및 창의적 응답',
      claude: '논리적 보완',
      gemini: '정보 제공'
    }
  }
} as const

export type TaskType = keyof typeof TASK_AI_COMBINATIONS

/**
 * 사용자 메시지에서 작업 유형 자동 감지
 */
export function detectTaskType(message: string): TaskType {
  const lowerMessage = message.toLowerCase()

  // 키워드 기반 작업 유형 감지
  if (
    lowerMessage.includes('유튜브') ||
    lowerMessage.includes('youtube') ||
    lowerMessage.includes('영상 스크립트') ||
    lowerMessage.includes('대본')
  ) {
    return 'youtube_script'
  }

  if (
    lowerMessage.includes('숏폼') ||
    lowerMessage.includes('쇼츠') ||
    lowerMessage.includes('shorts') ||
    lowerMessage.includes('틱톡') ||
    lowerMessage.includes('릴스')
  ) {
    return 'shorts_content'
  }

  if (
    lowerMessage.includes('교육') ||
    lowerMessage.includes('강의') ||
    lowerMessage.includes('튜토리얼') ||
    lowerMessage.includes('학습')
  ) {
    return 'educational'
  }

  if (
    lowerMessage.includes('스토리') ||
    lowerMessage.includes('소설') ||
    lowerMessage.includes('시나리오') ||
    lowerMessage.includes('창작')
  ) {
    return 'creative_writing'
  }

  // 한국어 콘텐츠 (한글 비율로 판단)
  const koreanChars = message.match(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g)
  if (koreanChars && koreanChars.length > message.length * 0.3) {
    return 'korean_content'
  }

  return 'general'
}

/**
 * 작업 유형에 따른 최적 AI 조합 추천
 */
export function recommendAICombo(taskType: TaskType): {
  ais: AIServiceType[]
  workflow: Record<string, string>
  reasoning: string
} {
  const combo = TASK_AI_COMBINATIONS[taskType]
  
  const reasoning = `이 작업(${combo.name})에는 다음 AI들이 최적입니다:\n` +
    Object.entries(combo.workflow)
      .map(([ai, role]) => `• ${AI_SPECIALTIES[ai as AIServiceType].name}: ${role}`)
      .join('\n')

  return {
    ais: combo.ais,
    workflow: combo.workflow,
    reasoning
  }
}

/**
 * AI 협업 실행 계획 생성
 */
export interface CollaborationPlan {
  taskType: TaskType
  selectedAIs: AIServiceType[]
  steps: Array<{
    step: number
    ai: AIServiceType
    role: string
    prompt: string
    dependsOn?: number[]
  }>
  mergeStrategy: 'sequential' | 'parallel' | 'hierarchical'
}

/**
 * 사용자 요청에 대한 AI 협업 계획 수립
 */
export function createCollaborationPlan(
  message: string,
  requestedAIs?: AIServiceType[]
): CollaborationPlan {
  // 작업 유형 자동 감지
  const taskType = detectTaskType(message)
  const recommendation = recommendAICombo(taskType)

  // 사용자가 AI를 지정했으면 우선 사용, 아니면 추천 조합 사용
  const selectedAIs = requestedAIs && requestedAIs.length > 0 
    ? requestedAIs 
    : recommendation.ais

  // AI가 1개면 단순 실행
  if (selectedAIs.length === 1) {
    return {
      taskType,
      selectedAIs,
      steps: [{
        step: 1,
        ai: selectedAIs[0],
        role: recommendation.workflow[selectedAIs[0]] || '응답 생성',
        prompt: message
      }],
      mergeStrategy: 'sequential'
    }
  }

  // 작업 유형별 협업 전략
  const steps = createTaskSteps(taskType, selectedAIs, message, recommendation.workflow)

  return {
    taskType,
    selectedAIs,
    steps,
    mergeStrategy: determineStrategy(taskType, selectedAIs)
  }
}

/**
 * 작업 유형별 단계 생성
 */
function createTaskSteps(
  taskType: TaskType,
  ais: AIServiceType[],
  userMessage: string,
  workflow: Record<string, string>
): CollaborationPlan['steps'] {
  const steps: CollaborationPlan['steps'] = []

  switch (taskType) {
    case 'youtube_script':
    case 'shorts_content':
      // 순차적 개선 방식
      ais.forEach((ai, index) => {
        steps.push({
          step: index + 1,
          ai,
          role: workflow[ai] || 'AI 처리',
          prompt: index === 0 
            ? userMessage 
            : `이전 AI의 결과를 기반으로 ${workflow[ai]}을(를) 수행하세요:\n\n[이전 결과]\n\n추가 요청: ${userMessage}`,
          dependsOn: index > 0 ? [index] : undefined
        })
      })
      break

    case 'educational':
    case 'creative_writing':
      // 병렬 처리 후 통합
      ais.forEach((ai, index) => {
        steps.push({
          step: index + 1,
          ai,
          role: workflow[ai] || 'AI 처리',
          prompt: `${workflow[ai]}의 관점에서 다음 요청에 답변하세요:\n\n${userMessage}`
        })
      })
      break

    case 'korean_content':
      // 한국 특화 처리
      const nanoIdx = ais.indexOf('nanobana')
      if (nanoIdx >= 0) {
        // NanoBana를 먼저 실행
        const reorderedAIs = [ais[nanoIdx], ...ais.filter((_, i) => i !== nanoIdx)]
        reorderedAIs.forEach((ai, index) => {
          steps.push({
            step: index + 1,
            ai,
            role: workflow[ai] || 'AI 처리',
            prompt: index === 0 
              ? userMessage 
              : `이전 결과를 보완하여 ${workflow[ai]}을(를) 수행하세요:\n\n[이전 결과]\n\n원래 요청: ${userMessage}`,
            dependsOn: index > 0 ? [index] : undefined
          })
        })
      }
      break

    default:
      // 일반 병렬 처리
      ais.forEach((ai, index) => {
        steps.push({
          step: index + 1,
          ai,
          role: workflow[ai] || 'AI 응답 생성',
          prompt: userMessage
        })
      })
  }

  return steps
}

/**
 * 병합 전략 결정
 */
function determineStrategy(
  taskType: TaskType,
  ais: AIServiceType[]
): CollaborationPlan['mergeStrategy'] {
  // 영상/오디오 작업은 순차적
  if (taskType === 'shorts_content' || taskType === 'youtube_script') {
    return 'sequential'
  }

  // 교육/창작 콘텐츠는 계층적 (각자 작업 후 통합)
  if (taskType === 'educational' || taskType === 'creative_writing') {
    return 'hierarchical'
  }

  // 한국어 콘텐츠는 순차적 개선
  if (taskType === 'korean_content') {
    return 'sequential'
  }

  // 일반 작업은 병렬 후 통합
  return 'parallel'
}

/**
 * AI 협업 결과 설명 생성
 */
export function generateCollaborationSummary(plan: CollaborationPlan): string {
  const aiNames = plan.selectedAIs.map(ai => AI_SPECIALTIES[ai].name).join(', ')
  
  let summary = `🤝 **AI 협업 모드**\n\n`
  summary += `**참여 AI**: ${aiNames}\n`
  summary += `**작업 유형**: ${TASK_AI_COMBINATIONS[plan.taskType].name}\n`
  summary += `**병합 전략**: ${getMergeStrategyName(plan.mergeStrategy)}\n\n`
  
  summary += `**협업 과정**:\n`
  plan.steps.forEach(step => {
    const aiInfo = AI_SPECIALTIES[step.ai]
    summary += `${step.step}. ${aiInfo.icon} **${aiInfo.name}** - ${step.role}\n`
  })

  return summary
}

function getMergeStrategyName(strategy: CollaborationPlan['mergeStrategy']): string {
  switch (strategy) {
    case 'sequential': return '순차적 개선 (각 AI가 이전 결과를 개선)'
    case 'parallel': return '병렬 처리 (각 AI가 독립적으로 작업 후 통합)'
    case 'hierarchical': return '계층적 통합 (각 AI의 강점을 조합)'
  }
}

// 로거에 정보 출력
logger.info('AI 협업 오케스트레이터 초기화 완료', {
  availableAIs: Object.keys(AI_SPECIALTIES),
  taskTypes: Object.keys(TASK_AI_COMBINATIONS)
})

