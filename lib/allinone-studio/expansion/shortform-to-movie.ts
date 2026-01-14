/**
 * STEP 1: 숏폼 → 영화 자동 확장 로직
 * Scene 배열을 중·장편 영상 또는 영화 구조로 확장
 */

import sceneExample from '../final-specs/scene-character-final.json';

// SceneJSON 타입 정의
export type SceneJSON = typeof sceneExample.scene;

/**
 * 확장 입력 데이터
 */
export interface ExpansionInput {
  shortformScenes: SceneJSON[];
  overallTheme: string;
  targetLength: '3min' | '10min' | '30min' | 'movie';
  style: 'realistic' | 'anime' | 'cartoon';
}

/**
 * 확장 출력 데이터
 */
export interface ExpansionOutput {
  expandedScenes: SceneJSON[];
  storyArc: StoryArc;
  characterConsistency: CharacterConsistencyMap;
  newScenes: SceneJSON[];
  reusedScenes: Array<{ original: string; reused: string }>;
  expandedSceneMappings: Array<{ original: string; expanded: string }>;
}

/**
 * 스토리 아크 구조
 */
export interface StoryArc {
  introduction: {
    scenes: string[];  // Scene ID 배열
    duration: number;
    purpose: string;
  };
  development: {
    scenes: string[];
    duration: number;
    purpose: string;
  };
  conflict: {
    scenes: string[];
    duration: number;
    purpose: string;
  };
  climax: {
    scenes: string[];
    duration: number;
    purpose: string;
  };
  resolution: {
    scenes: string[];
    duration: number;
    purpose: string;
  };
  totalDuration: number;
}

/**
 * 캐릭터 일관성 맵
 */
export interface CharacterConsistencyMap {
  [characterId: string]: {
    appearance: any;
    voice: any;
    personality: string[];
    emotionArc: Array<{
      sceneId: string;
      emotion: string;
      intensity: number;
    }>;
  };
}

/**
 * ============================================
 * 전체 확장 로직 단계
 * ============================================
 */

/**
 * 단계 1: 숏폼 Scene 분석
 */
export interface Step1_AnalyzeShortform {
  input: {
    scenes: SceneJSON[];
    theme: string;
  };
  output: {
    summary: {
      totalDuration: number;
      characterCount: number;
      dialogueCount: number;
      mainCharacters: string[];
      keyMoments: Array<{
        sceneId: string;
        description: string;
        importance: 'high' | 'medium' | 'low';
      }>;
    };
    structure: {
      hasIntroduction: boolean;
      hasConflict: boolean;
      hasResolution: boolean;
    };
  };
}

/**
 * 단계 2: 스토리 아크 구조 적용
 */
export interface Step2_ApplyStoryArc {
  input: {
    analysis: Step1_AnalyzeShortform['output'];
    targetLength: ExpansionInput['targetLength'];
    theme: string;
  };
  output: {
    storyArc: StoryArc;
    requiredScenes: Array<{
      arc: 'introduction' | 'development' | 'conflict' | 'climax' | 'resolution';
      description: string;
      estimatedDuration: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
}

/**
 * 단계 3: Scene 재사용 / 확장 / 신규 생성 구분
 */
export interface Step3_ClassifyScenes {
  input: {
    originalScenes: SceneJSON[];
    storyArc: StoryArc;
    targetLength: ExpansionInput['targetLength'];
  };
  output: {
    reuse: Array<{
      sceneId: string;
      arc: string;
      modifications?: Array<{
        path: string;
        value: any;
      }>;
    }>;
    expand: Array<{
      originalSceneId: string;
      expansionType: 'duration' | 'dialogue' | 'subplot';
      newScenes: SceneJSON[];
    }>;
    create: Array<{
      arc: string;
      description: string;
      estimatedDuration: number;
    }>;
  };
}

/**
 * 단계 4: 캐릭터 감정선 유지
 */
export interface Step4_MaintainEmotionArc {
  input: {
    originalScenes: SceneJSON[];
    expandedScenes: SceneJSON[];
    characters: CharacterConsistencyMap;
  };
  output: {
    characterEmotionArc: CharacterConsistencyMap;
    consistencyChecks: Array<{
      characterId: string;
      sceneId: string;
      issue?: string;
      fix?: {
        path: string;
        value: any;
      };
    }>;
  };
}

/**
 * 단계 5: 대사 및 장면 자동 보강
 */
export interface Step5_EnhanceScenes {
  input: {
    scenes: SceneJSON[];
    storyArc: StoryArc;
    characters: CharacterConsistencyMap;
  };
  output: {
    enhancedScenes: SceneJSON[];
    addedDialogues: number;
    addedScenes: number;
    modifications: Array<{
      sceneId: string;
      type: 'dialogue-added' | 'scene-extended' | 'transition-added';
      description: string;
    }>;
  };
}

/**
 * ============================================
 * 숏폼 → 영화 변환 알고리즘
 * ============================================
 */

/**
 * 타겟 길이별 Scene 수 계산
 */
export const TargetLengthScenes = {
  '3min': {
    minScenes: 3,
    maxScenes: 5,
    avgSceneDuration: 20,
  },
  '10min': {
    minScenes: 8,
    maxScenes: 12,
    avgSceneDuration: 30,
  },
  '30min': {
    minScenes: 15,
    maxScenes: 25,
    avgSceneDuration: 45,
  },
  'movie': {
    minScenes: 30,
    maxScenes: 60,
    avgSceneDuration: 60,
  },
};

/**
 * 숏폼 → 영화 확장 실행
 */
export async function expandShortformToMovie(
  input: ExpansionInput
): Promise<ExpansionOutput> {
  // 1. 숏폼 분석
  const analysis = await analyzeShortform(input.shortformScenes, input.overallTheme);
  
  // 2. 스토리 아크 적용
  const storyArc = await applyStoryArc(analysis, input.targetLength, input.overallTheme);
  
  // 3. Scene 분류
  const classification = await classifyScenes(
    input.shortformScenes,
    storyArc,
    input.targetLength
  );
  
  // 4. Scene 생성/확장
  const expandedScenes = await generateExpandedScenes(
    classification,
    input.shortformScenes,
    storyArc,
    input.style
  );
  
  // 5. 캐릭터 일관성 유지
  const characterConsistency = await maintainCharacterConsistency(
    input.shortformScenes,
    expandedScenes
  );
  
  // 6. 대사 및 장면 보강
  const enhancedScenes = await enhanceScenes(
    expandedScenes,
    storyArc,
    characterConsistency
  );
  
  return {
    expandedScenes: enhancedScenes,
    storyArc,
    characterConsistency,
    newScenes: classification.create.map(c => c as any),
    reusedScenes: classification.reuse.map(r => ({
      original: r.sceneId,
      reused: r.sceneId,
    })),
    expandedSceneMappings: classification.expand.map(e => ({
      original: e.originalSceneId,
      expanded: e.newScenes[0]?.id || '',
    })),
  };
}

/**
 * ============================================
 * Scene 증식 규칙
 * ============================================
 */

export const SceneExpansionRules = {
  // 재사용 규칙
  reuse: {
    condition: (scene: SceneJSON, arc: string) => {
      // 도입부나 결말부의 핵심 Scene은 재사용
      return arc === 'introduction' || arc === 'resolution';
    },
    modifications: {
      duration: (original: number, target: number) => {
        // 최대 20% 연장 가능
        return Math.min(original * 1.2, target);
      },
      camera: (scene: SceneJSON) => {
        // 카메라 앵글만 약간 조정
        return {
          ...scene.camera,
          zoom: scene.camera.zoom * 0.95,
        };
      },
    },
  },
  
  // 확장 규칙
  expand: {
    condition: (scene: SceneJSON, arc: string) => {
      // 전개부나 갈등부는 확장 가능
      return arc === 'development' || arc === 'conflict';
    },
    expansionTypes: {
      duration: {
        multiplier: 1.5,  // 1.5배 연장
        maxDuration: 60,   // 최대 60초
      },
      dialogue: {
        addCount: 2,       // 대화 2개 추가
        spacing: 3,        // 3초 간격
      },
      subplot: {
        addScenes: 2,      // 서브플롯 Scene 2개 추가
      },
    },
  },
  
  // 신규 생성 규칙
  create: {
    condition: (arc: string, existingScenes: SceneJSON[]) => {
      // 각 아크별 최소 Scene 수 확인
      const arcSceneCount = existingScenes.filter(s => 
        getSceneArc(s, existingScenes) === arc
      ).length;
      
      const requiredCount = {
        introduction: 2,
        development: 3,
        conflict: 2,
        climax: 1,
        resolution: 2,
      };
      
      return arcSceneCount < (requiredCount[arc as keyof typeof requiredCount] || 0);
    },
    generation: {
      introduction: {
        template: 'opening-scene',
        duration: 15,
        purpose: '캐릭터 소개 및 배경 설정',
      },
      development: {
        template: 'story-progress',
        duration: 30,
        purpose: '스토리 전개 및 캐릭터 관계 발전',
      },
      conflict: {
        template: 'conflict-scene',
        duration: 45,
        purpose: '갈등 발생 및 고조',
      },
      climax: {
        template: 'climax-scene',
        duration: 60,
        purpose: '절정 및 해결 시도',
      },
      resolution: {
        template: 'ending-scene',
        duration: 20,
        purpose: '결말 및 마무리',
      },
    },
  },
};

/**
 * ============================================
 * 캐릭터 일관성 유지 전략
 * ============================================
 */

export const CharacterConsistencyStrategy = {
  // 외형 일관성
  appearance: {
    check: (original: any, expanded: any) => {
      const keys = ['gender', 'ageRange', 'style', 'appearance'];
      return keys.every(key => 
        JSON.stringify(original[key]) === JSON.stringify(expanded[key])
      );
    },
    fix: (original: any, expanded: any) => {
      return {
        ...expanded,
        appearance: original.appearance,
        voice: original.voice,
      };
    },
  },
  
  // 음성 일관성
  voice: {
    check: (original: any, expanded: any) => {
      return original.voice.voiceId === expanded.voice.voiceId &&
             original.voice.tone === expanded.voice.tone;
    },
    fix: (original: any, expanded: any) => {
      return {
        ...expanded,
        voice: original.voice,
      };
    },
  },
  
  // 감정선 일관성
  emotionArc: {
    check: (scenes: SceneJSON[], characterId: string) => {
      const emotions = scenes
        .flatMap(s => s.dialogues)
        .filter(d => d.speakerId === characterId)
        .map(d => d.emotion);
      
      // 감정 변화가 자연스러운지 확인
      const transitions = [];
      for (let i = 1; i < emotions.length; i++) {
        const transition = getEmotionTransition(emotions[i - 1], emotions[i]);
        if (transition.abrupt) {
          transitions.push({
            sceneIndex: i,
            issue: `감정 전환이 급격함: ${emotions[i - 1]} → ${emotions[i]}`,
          });
        }
      }
      
      return transitions;
    },
    fix: (scenes: SceneJSON[], characterId: string, issues: any[]) => {
      // 중간 Scene 추가하여 감정 전환 완화
      const fixedScenes = [...scenes];
      issues.forEach(issue => {
        const transitionScene = createTransitionScene(
          scenes[issue.sceneIndex - 1],
          scenes[issue.sceneIndex],
          characterId
        );
        fixedScenes.splice(issue.sceneIndex, 0, transitionScene);
      });
      return fixedScenes;
    },
  },
};

/**
 * ============================================
 * 사용자 개입 지점 (자동/수동)
 * ============================================
 */

export const UserInterventionPoints = {
  // 자동 처리
  automatic: [
    'scene-duration-adjustment',
    'dialogue-timing-optimization',
    'camera-angle-consistency',
    'background-style-matching',
    'audio-volume-balancing',
  ],
  
  // 수동 확인 필요
  manual: [
    'new-scene-creation',
    'major-character-change',
    'story-arc-modification',
    'dialogue-content-change',
    'style-preference',
  ],
  
  // 사용자 선택
  optional: [
    'subplot-addition',
    'character-background-expansion',
    'special-effect-addition',
    'music-selection',
  ],
};

// 헬퍼 함수들 (실제 구현 필요)
async function analyzeShortform(scenes: SceneJSON[], theme: string): Promise<Step1_AnalyzeShortform['output']> {
  throw new Error('Not implemented');
}

async function applyStoryArc(
  analysis: Step1_AnalyzeShortform['output'],
  targetLength: ExpansionInput['targetLength'],
  theme: string
): Promise<StoryArc> {
  throw new Error('Not implemented');
}

async function classifyScenes(
  scenes: SceneJSON[],
  storyArc: StoryArc,
  targetLength: ExpansionInput['targetLength']
): Promise<Step3_ClassifyScenes['output']> {
  throw new Error('Not implemented');
}

async function generateExpandedScenes(
  classification: Step3_ClassifyScenes['output'],
  originalScenes: SceneJSON[],
  storyArc: StoryArc,
  style: string
): Promise<SceneJSON[]> {
  throw new Error('Not implemented');
}

async function maintainCharacterConsistency(
  originalScenes: SceneJSON[],
  expandedScenes: SceneJSON[]
): Promise<CharacterConsistencyMap> {
  throw new Error('Not implemented');
}

async function enhanceScenes(
  scenes: SceneJSON[],
  storyArc: StoryArc,
  characters: CharacterConsistencyMap
): Promise<SceneJSON[]> {
  throw new Error('Not implemented');
}

function getSceneArc(scene: SceneJSON, allScenes: SceneJSON[]): string {
  // Scene이 속한 스토리 아크 판단
  const index = allScenes.findIndex(s => s.id === scene.id);
  const total = allScenes.length;
  const ratio = index / total;
  
  if (ratio < 0.2) return 'introduction';
  if (ratio < 0.4) return 'development';
  if (ratio < 0.6) return 'conflict';
  if (ratio < 0.8) return 'climax';
  return 'resolution';
}

function getEmotionTransition(from: string, to: string): { abrupt: boolean; natural: boolean } {
  const naturalTransitions: Record<string, string[]> = {
    neutral: ['happy', 'sad', 'surprised'],
    happy: ['excited', 'calm', 'neutral'],
    sad: ['neutral', 'calm'],
    angry: ['neutral', 'sad'],
  };
  
  const allowed = naturalTransitions[from] || [];
  return {
    abrupt: !allowed.includes(to),
    natural: allowed.includes(to),
  };
}

function createTransitionScene(before: SceneJSON, after: SceneJSON, characterId: string): SceneJSON {
  // 전환 Scene 생성
  throw new Error('Not implemented');
}
