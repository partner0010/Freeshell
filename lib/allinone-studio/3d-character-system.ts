/**
 * STEP 3: 3D 캐릭터 + 표정·감정 시스템 구조
 * 웹 기반 3D 캐릭터 생성 및 표현 시스템
 */

import { CharacterSpec, ExpressionSpec, MotionSpec, EmotionState } from './scene-character-spec';

/**
 * ============================================
 * 1. 캐릭터 데이터 구조 (3D 확장)
 * ============================================
 */
export interface Character3D extends CharacterSpec {
  // 3D 모델 정보
  model: {
    type: 'glb' | 'gltf' | 'fbx' | 'obj' | 'procedural';
    url?: string;                // 모델 파일 URL
    format?: string;             // 파일 형식
    
    // 프로시저럴 생성 (모델 파일 없이)
    procedural?: {
      baseMesh: string;          // 기본 메시 (예: "human-male", "human-female")
      parameters: {               // 생성 파라미터
        [key: string]: number | string;
      };
    };
  };
  
  // 본(Bone) 구조
  skeleton?: {
    bones: Array<{
      name: string;
      parent?: string;
      position: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
    }>;
  };
  
  // 머티리얼
  materials?: Array<{
    name: string;
    type: 'standard' | 'pbr' | 'toon';
    properties: {
      color?: string;
      roughness?: number;
      metalness?: number;
      [key: string]: any;
    };
  }>;
}

/**
 * ============================================
 * 2. 표정 & 감정 시스템 구조
 * ============================================
 */

/**
 * Face Blendshape 시스템
 */
export interface FaceBlendshapeSystem {
  // Blendshape 타겟 목록
  targets: Array<{
    name: string;                // Blendshape 이름 (예: "eyeBlinkLeft")
    index: number;               // Blendshape 인덱스
    type: 'additive' | 'multiplicative';
  }>;
  
  // 기본 표정 프리셋
  presets: {
    [emotion: string]: {         // EmotionState
      [targetName: string]: number;  // 0.0 ~ 1.0
    };
  };
  
  // 표정 전환
  transitions: {
    duration: number;            // 전환 시간 (초)
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };
}

/**
 * 감정 상태 머신
 */
export interface EmotionStateMachine {
  // 현재 감정 상태
  currentState: EmotionState;
  
  // 감정 전환 규칙
  transitions: Array<{
    from: EmotionState;
    to: EmotionState;
    condition?: string;           // 전환 조건 (예: "dialogue.emotion === 'happy'")
    duration: number;            // 전환 시간 (초)
  }>;
  
  // 감정 강도
  intensity: number;             // 0.0 ~ 1.0
}

/**
 * ============================================
 * 3. 립싱크 처리 흐름
 * ============================================
 */

/**
 * 립싱크 데이터 구조
 */
export interface LipSyncData {
  // 음성 분석 결과
  audio: {
    url: string;                 // 오디오 파일 URL
    duration: number;            // 길이 (초)
    sampleRate: number;          // 샘플레이트
  };
  
  // 음소(Phoneme) 시퀀스
  phonemes: Array<{
    phoneme: string;             // 음소 (예: "AA", "EH", "IH", "OH", "UH")
    start: number;               // 시작 시간 (초)
    duration: number;            // 지속 시간 (초)
    intensity: number;           // 강도 (0.0 ~ 1.0)
  }>;
  
  // Viseme (시각적 음소) 매핑
  visemes: Array<{
    viseme: string;              // Viseme 타입 (예: "silence", "aa", "ee", "oh")
    start: number;
    duration: number;
    blendshape: {                // 해당 Blendshape 값
      [targetName: string]: number;
    };
  }>;
  
  // 프레임별 데이터 (렌더링용)
  frames: Array<{
    time: number;                // 시간 (초)
    blendshape: {                 // Blendshape 값
      [targetName: string]: number;
    };
  }>;
}

/**
 * 립싱크 처리 단계
 */
export interface LipSyncProcess {
  // 1. 음성 분석
  analyzeAudio(audioUrl: string): Promise<{
    phonemes: LipSyncData['phonemes'];
  }>;
  
  // 2. Viseme 변환
  convertToVisemes(phonemes: LipSyncData['phonemes']): LipSyncData['visemes'];
  
  // 3. Blendshape 매핑
  mapToBlendshapes(visemes: LipSyncData['visemes']): LipSyncData['frames'];
  
  // 4. 동기화
  syncWithDialogue(frames: LipSyncData['frames'], dialogue: {
    start: number;
    duration: number;
  }): LipSyncData['frames'];
}

/**
 * ============================================
 * 4. 애니메이션 트리 구조
 * ============================================
 */

/**
 * 애니메이션 트리 노드
 */
export interface AnimationNode {
  id: string;
  name: string;
  type: 'clip' | 'blend' | 'layer' | 'state';
  
  // 클립 타입
  clip?: {
    name: string;
    duration: number;
    loop: boolean;
    tracks: Array<{
      target: string;            // 타겟 (예: "bone.LeftArm.rotation")
      keyframes: Array<{
        time: number;
        value: number | { x: number; y: number; z: number };
        interpolation?: 'linear' | 'step' | 'cubic';
      }>;
    }>;
  };
  
  // 블렌드 타입
  blend?: {
    children: string[];          // 자식 노드 ID
    weights: number[];            // 블렌드 가중치 (0.0 ~ 1.0)
  };
  
  // 레이어 타입
  layer?: {
    base: string;                 // 베이스 노드 ID
    additive: string[];           // 추가 노드 ID들
    masks?: {                     // 마스크 (어떤 본에 적용할지)
      [boneName: string]: boolean;
    };
  };
  
  // 상태 머신 타입
  state?: {
    currentState: string;
    states: Array<{
      name: string;
      nodeId: string;
      transitions: Array<{
        to: string;
        condition: string;
      }>;
    }>;
  };
  
  // 자식 노드
  children?: AnimationNode[];
}

/**
 * 애니메이션 트리
 */
export interface AnimationTree {
  root: AnimationNode;
  nodes: Map<string, AnimationNode>;
  
  // 애니메이션 재생
  play(animationId: string, options?: {
    loop?: boolean;
    speed?: number;
    blendTime?: number;
  }): void;
  
  // 애니메이션 블렌드
  blend(fromId: string, toId: string, duration: number): void;
  
  // 애니메이션 레이어 추가
  addLayer(baseId: string, layerId: string, mask?: { [boneName: string]: boolean }): void;
}

/**
 * ============================================
 * 5. Scene 시스템과 연동 방식
 * ============================================
 */

/**
 * Scene에서 캐릭터 애니메이션 제어
 */
export interface SceneCharacterAnimation {
  // 캐릭터 참조
  characterId: string;
  
  // 현재 애니메이션
  currentAnimation: {
    nodeId: string;
    time: number;
    playing: boolean;
  };
  
  // 대화 중 애니메이션
  dialogueAnimation: {
    expression: ExpressionSpec;
    motion: MotionSpec;
    lipSync: LipSyncData;
    timing: {
      start: number;
      duration: number;
    };
  };
  
  // 애니메이션 트리
  animationTree: AnimationTree;
  
  // 업데이트 (매 프레임)
  update(deltaTime: number): void;
  
  // 애니메이션 전환
  transitionTo(animationId: string, duration: number): void;
  
  // 표정 변경
  setExpression(expressionId: string, intensity: number, duration: number): void;
  
  // 동작 변경
  setMotion(motionId: string, loop: boolean): void;
  
  // 립싱크 동기화
  syncLipSync(lipSyncData: LipSyncData, startTime: number): void;
}

/**
 * ============================================
 * 기술 스택 (무료/오픈소스)
 * ============================================
 */

/**
 * 3D 렌더링 엔진 옵션
 */
export const RenderingEngineOptions = {
  // Three.js (가장 일반적)
  threejs: {
    name: 'Three.js',
    type: 'webgl',
    features: ['gltf', 'glb', 'animations', 'blendshapes'],
    license: 'MIT',
  },
  
  // Babylon.js (고급 기능)
  babylon: {
    name: 'Babylon.js',
    type: 'webgl',
    features: ['gltf', 'fbx', 'animations', 'physics', 'pbr'],
    license: 'Apache 2.0',
  },
  
  // PlayCanvas (게임 엔진)
  playcanvas: {
    name: 'PlayCanvas',
    type: 'webgl',
    features: ['gltf', 'animations', 'physics'],
    license: 'MIT',
  },
};

/**
 * 캐릭터 생성 옵션
 */
export const CharacterGenerationOptions = {
  // Ready Player Me (무료)
  readyPlayerMe: {
    name: 'Ready Player Me',
    type: 'avatar',
    features: ['realistic', 'customizable', 'glb-export'],
    api: true,
    free: true,
  },
  
  // VRoid Hub (무료)
  vroid: {
    name: 'VRoid Hub',
    type: 'anime',
    features: ['anime-style', 'customizable', 'glb-export'],
    api: false,
    free: true,
  },
  
  // MakeHuman (오픈소스)
  makehuman: {
    name: 'MakeHuman',
    type: 'realistic',
    features: ['procedural', 'customizable', 'export'],
    api: false,
    free: true,
  },
};

/**
 * 립싱크 라이브러리 옵션
 */
export const LipSyncLibraryOptions = {
  // Rhubarb Lip Sync (오픈소스)
  rhubarb: {
    name: 'Rhubarb Lip Sync',
    type: 'phoneme-based',
    features: ['phoneme-detection', 'viseme-mapping'],
    license: 'MIT',
  },
  
  // Web Speech API (브라우저 기본)
  webSpeech: {
    name: 'Web Speech API',
    type: 'speech-recognition',
    features: ['real-time', 'browser-native'],
    license: 'Free',
  },
  
  // Coqui TTS (오픈소스)
  coqui: {
    name: 'Coqui TTS',
    type: 'tts',
    features: ['tts', 'phoneme-extraction'],
    license: 'MPL 2.0',
  },
};

/**
 * ============================================
 * 구현 예시 구조
 * ============================================
 */

/**
 * 3D 캐릭터 렌더러 인터페이스
 */
export interface Character3DRenderer {
  // 캐릭터 로드
  loadCharacter(character: Character3D): Promise<void>;
  
  // 표정 설정
  setExpression(expressionId: string, intensity: number): void;
  
  // 동작 재생
  playMotion(motionId: string, loop: boolean): void;
  
  // 립싱크 적용
  applyLipSync(lipSyncData: LipSyncData, time: number): void;
  
  // 렌더링
  render(): void;
  
  // 업데이트 (매 프레임)
  update(deltaTime: number): void;
}

/**
 * Scene과의 연동 예시
 */
export interface Scene3DIntegration {
  // Scene에서 캐릭터 추가
  addCharacterToScene(sceneId: string, character: Character3D, position: {
    x: number;
    y: number;
    z: number;
  }): SceneCharacterAnimation;
  
  // 대화 시작
  startDialogue(dialogue: {
    characterId: string;
    text: string;
    emotion: EmotionState;
    timing: {
      start: number;
      duration: number;
    };
  }): void;
  
  // 애니메이션 동기화
  syncAnimations(sceneId: string, time: number): void;
}
