/**
 * STEP 1: Scene & Character JSON 스펙 완성
 * AI 콘텐츠 제작 공통 데이터 구조
 */

/**
 * ============================================
 * 1. Scene JSON 스펙
 * ============================================
 */
export interface SceneSpec {
  // 기본 정보
  id: string;                    // 고유 ID (예: "scene-001")
  name: string;                  // 장면 이름 (예: "오프닝 씬")
  type: 'shortform' | 'video' | 'animation' | 'movie';
  order: number;                 // 장면 순서 (0부터 시작)
  
  // 배경
  background: {
    type: 'image' | 'video' | '3d' | 'color' | 'gradient' | 'ai-generated';
    source: string;              // URL 또는 색상값 (#ffffff)
    description?: string;        // AI 생성용 설명
    opacity?: number;            // 0.0 ~ 1.0
  };
  
  // 카메라
  camera: {
    position: {                  // 카메라 위치 (3D 좌표)
      x: number;
      y: number;
      z: number;
    };
    rotation: {                  // 카메라 회전
      x: number;                 // pitch (상하)
      y: number;                 // yaw (좌우)
      z: number;                 // roll (기울기)
    };
    fov?: number;                // 시야각 (degrees, 기본값: 60)
    zoom?: number;               // 줌 레벨 (0.5 ~ 2.0, 기본값: 1.0)
    focus?: {                    // 포커스 설정
      target: string;            // 포커스 대상 (character ID 또는 'center')
      distance?: number;         // 포커스 거리
    };
  };
  
  // 조명
  lighting?: {
    type: 'natural' | 'dramatic' | 'soft' | 'dark' | 'bright';
    direction: 'front' | 'side' | 'back' | 'top' | 'bottom';
    intensity?: number;          // 0.0 ~ 1.0
    color?: string;              // 조명 색상 (#ffffff)
  };
  
  // 캐릭터 배치
  characters: SceneCharacter[];   // 장면에 등장하는 캐릭터들
  
  // 대화
  dialogues: DialogueSpec[];     // 대화 목록
  
  // 음악 & 음향
  audio: {
    bgm?: {                      // 배경 음악
      type: 'auto' | 'manual';   // 자동 생성 또는 수동 선택
      track?: string;            // 음악 파일 URL 또는 ID
      genre?: string;            // 장르 (예: "upbeat", "calm", "dramatic")
      volume: number;            // 0.0 ~ 1.0
      loop: boolean;
      fadeIn?: number;           // 페이드인 시간 (초)
      fadeOut?: number;          // 페이드아웃 시간 (초)
    };
    sfx?: {                      // 효과음
      events: Array<{
        time: number;            // 재생 시점 (초)
        sound: string;           // 효과음 파일 URL 또는 ID
        volume: number;          // 0.0 ~ 1.0
      }>;
    };
  };
  
  // 타이밍
  timing: {
    start: number;               // 시작 시간 (초, 프로젝트 기준)
    duration: number;            // 지속 시간 (초)
    transition?: {               // 전환 효과
      type: 'fade' | 'cut' | 'slide' | 'zoom' | 'wipe';
      duration: number;          // 전환 시간 (초)
      direction?: 'left' | 'right' | 'up' | 'down';
    };
  };
  
  // 메타데이터
  metadata?: {
    tags?: string[];             // 태그
    notes?: string;              // 메모
    [key: string]: any;          // 확장 가능
  };
}

/**
 * 장면 내 캐릭터 배치
 */
export interface SceneCharacter {
  characterId: string;           // Character ID 참조
  position: {                    // 캐릭터 위치 (3D 좌표)
    x: number;
    y: number;
    z: number;
  };
  rotation: {                    // 캐릭터 회전
    x: number;
    y: number;
    z: number;
  };
  scale?: {                      // 캐릭터 크기
    x: number;                   // 기본값: 1.0
    y: number;
    z: number;
  };
  visible: boolean;              // 표시 여부
  layer?: number;                // 레이어 순서 (높을수록 앞)
}

/**
 * ============================================
 * 2. Character JSON 스펙
 * ============================================
 */
export interface CharacterSpec {
  // 기본 정보
  id: string;                    // 고유 ID (예: "char-001")
  name: string;                  // 캐릭터 이름
  version: string;                // 버전 (예: "1.0.0")
  
  // 외형
  appearance: {
    gender: 'male' | 'female' | 'other';
    age: 'child' | 'teen' | 'adult' | 'elder';
    style: 'realistic' | 'anime' | 'cartoon' | '3d' | '2d';
    
    // 얼굴
    face: {
      shape: string;             // 얼굴형 (예: "oval", "round")
      skinColor?: string;        // 피부색 (#ffffff)
      eyeColor?: string;         // 눈 색상
      hairColor?: string;        // 머리 색상
    };
    
    // 머리카락
    hair: {
      style: string;             // 헤어스타일 (예: "short", "long", "ponytail")
      color: string;             // 색상
      length?: string;           // 길이
    };
    
    // 체형
    body?: {
      type: string;              // 체형 (예: "slim", "average", "muscular")
      height?: number;           // 키 (cm)
    };
    
    // 옷차림
    clothes: {
      top?: string;              // 상의 설명
      bottom?: string;           // 하의 설명
      shoes?: string;            // 신발 설명
      accessories?: string[];    // 액세서리
    };
    
    // AI 생성용 설명
    description?: string;        // 전체 외형 설명
  };
  
  // 음성
  voice: {
    type: 'male' | 'female';
    age: 'child' | 'teen' | 'adult' | 'elder';
    tone: 'soft' | 'normal' | 'loud' | 'gentle' | 'energetic' | 'calm';
    voiceId?: string;            // TTS 음성 ID
    speed?: number;               // 말하기 속도 (0.8 ~ 1.2, 기본값: 1.0)
    pitch?: number;              // 음높이 (0.8 ~ 1.2, 기본값: 1.0)
  };
  
  // 표정 시스템
  expressions: ExpressionSpec[]; // 지원하는 표정 목록
  
  // 동작 시스템
  motions: MotionSpec[];         // 지원하는 동작 목록
  
  // 성격 & 특성
  personality?: {
    traits: string[];            // 성격 특성 (예: ["cheerful", "brave"])
    description?: string;        // 성격 설명
  };
  
  // 메타데이터
  metadata?: {
    tags?: string[];             // 태그
    notes?: string;              // 메모
    [key: string]: any;          // 확장 가능
  };
}

/**
 * 표정 스펙
 */
export interface ExpressionSpec {
  id: string;                    // 고유 ID (예: "expr-happy")
  name: string;                  // 표정 이름 (예: "happy", "sad", "angry")
  emotionState: EmotionState;    // 감정 상태
  
  // Face Blendshape 값 (0.0 ~ 1.0)
  blendshapes?: {
    // 기본 표정
    smile?: number;               // 미소
    frown?: number;               // 찡그림
    surprise?: number;            // 놀람
    anger?: number;               // 분노
    sadness?: number;            // 슬픔
    fear?: number;               // 두려움
    disgust?: number;            // 혐오
    
    // 눈
    eyeBlinkLeft?: number;        // 왼쪽 눈 깜빡임
    eyeBlinkRight?: number;      // 오른쪽 눈 깜빡임
    eyeWide?: number;            // 눈 크게 뜸
    eyeSquint?: number;          // 눈 찡그림
    
    // 입
    mouthOpen?: number;          // 입 벌림
    mouthSmile?: number;         // 입 미소
    mouthFrown?: number;         // 입 찡그림
    jawOpen?: number;            // 턱 벌림
    
    // 눈썹
    browInnerUp?: number;        // 눈썹 안쪽 올림
    browOuterUp?: number;        // 눈썹 바깥 올림
    browDown?: number;           // 눈썹 내림
    
    // 기타
    [key: string]: number | undefined;
  };
  
  // 강도 (0.0 ~ 1.0, 기본값: 1.0)
  intensity?: number;
  
  // 전환 시간 (초, 기본값: 0.3)
  transitionDuration?: number;
}

/**
 * 감정 상태
 */
export type EmotionState = 
  | 'happy' 
  | 'sad' 
  | 'angry' 
  | 'surprised' 
  | 'fear' 
  | 'disgust' 
  | 'neutral' 
  | 'excited' 
  | 'calm'
  | 'confused'
  | 'proud'
  | 'embarrassed';

/**
 * 동작 스펙
 */
export interface MotionSpec {
  id: string;                    // 고유 ID (예: "motion-idle")
  name: string;                  // 동작 이름 (예: "idle", "talk", "walk")
  type: 'idle' | 'walk' | 'run' | 'talk' | 'gesture' | 'emotion' | 'custom';
  
  // 동작 속성
  duration?: number;             // 지속 시간 (초, 무한 반복 시 undefined)
  loop: boolean;                 // 반복 여부
  speed?: number;                 // 재생 속도 (0.5 ~ 2.0, 기본값: 1.0)
  
  // 애니메이션 데이터
  animation?: {
    type: 'keyframe' | 'clip' | 'procedural';
    data?: any;                  // 애니메이션 데이터 (형식은 구현에 따라 다름)
    file?: string;                // 애니메이션 파일 URL
  };
  
  // 동작 설명
  description?: string;
}

/**
 * ============================================
 * 3. Dialogue JSON 스펙
 * ============================================
 */
export interface DialogueSpec {
  // 기본 정보
  id: string;                    // 고유 ID (예: "dialogue-001")
  sceneId: string;               // 속한 Scene ID
  characterId: string;           // 대화하는 캐릭터 ID
  order: number;                 // 대화 순서 (0부터 시작)
  
  // 대사
  text: string;                  // 대사 텍스트
  
  // 감정 & 표현
  emotion: EmotionState;         // 감정 상태
  expression?: string;           // Expression ID (기본값: emotion과 동일)
  motion?: string;               // Motion ID (예: "motion-talk")
  
  // 타이밍
  timing: {
    start: number;               // 시작 시간 (초, Scene 기준)
    duration: number;            // 지속 시간 (초, 자동 계산 가능)
    pauseAfter?: number;         // 대사 후 일시정지 (초)
  };
  
  // 음성
  voice?: {
    text: string;                // TTS 텍스트 (text와 다를 수 있음)
    voiceId?: string;            // 음성 ID (Character의 voice.voiceId 사용 시 생략)
    speed?: number;              // 속도 오버라이드
    pitch?: number;              // 음높이 오버라이드
    volume?: number;             // 볼륨 (0.0 ~ 1.0)
  };
  
  // 립싱크
  lipSync?: {
    enabled: boolean;            // 립싱크 활성화 여부
    data?: number[];             // 립싱크 데이터 (프레임별, 0.0 ~ 1.0)
    method?: 'auto' | 'manual';  // 자동 생성 또는 수동 입력
  };
  
  // 카메라 (대사 중 카메라 제어)
  camera?: {
    focus?: 'character' | 'scene' | 'custom';
    zoom?: number;                // 줌 레벨
    angle?: 'front' | 'side' | 'close-up' | 'wide';
  };
  
  // 메타데이터
  metadata?: {
    importance?: 'high' | 'medium' | 'low';  // 중요도
    notes?: string;              // 메모
    [key: string]: any;          // 확장 가능
  };
}

/**
 * ============================================
 * 4. 예시 데이터
 * ============================================
 */

/**
 * 예시 Scene
 */
export const exampleScene: SceneSpec = {
  id: 'scene-001',
  name: '오프닝 씬',
  type: 'shortform',
  order: 0,
  background: {
    type: 'ai-generated',
    source: 'https://example.com/backgrounds/sunset-city.jpg',
    description: '도시의 석양 배경',
    opacity: 1.0,
  },
  camera: {
    position: { x: 0, y: 1.6, z: 5 },
    rotation: { x: 0, y: 0, z: 0 },
    fov: 60,
    zoom: 1.0,
    focus: {
      target: 'char-001',
      distance: 3,
    },
  },
  lighting: {
    type: 'natural',
    direction: 'front',
    intensity: 0.8,
    color: '#ffd700',
  },
  characters: [
    {
      characterId: 'char-001',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.0, y: 1.0, z: 1.0 },
      visible: true,
      layer: 1,
    },
  ],
  dialogues: [
    {
      id: 'dialogue-001',
      sceneId: 'scene-001',
      characterId: 'char-001',
      order: 0,
      text: '안녕하세요! 오늘은 특별한 이야기를 들려드릴게요.',
      emotion: 'happy',
      expression: 'expr-happy',
      motion: 'motion-talk',
      timing: {
        start: 0.0,
        duration: 3.0,
        pauseAfter: 0.5,
      },
      voice: {
        text: '안녕하세요! 오늘은 특별한 이야기를 들려드릴게요.',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
      },
      lipSync: {
        enabled: true,
        method: 'auto',
      },
      camera: {
        focus: 'character',
        angle: 'close-up',
      },
    },
  ],
  audio: {
    bgm: {
      type: 'auto',
      genre: 'upbeat',
      volume: 0.3,
      loop: true,
      fadeIn: 1.0,
    },
  },
  timing: {
    start: 0.0,
    duration: 10.0,
    transition: {
      type: 'fade',
      duration: 0.5,
    },
  },
  metadata: {
    tags: ['opening', 'introduction'],
    notes: '프로젝트 시작 장면',
  },
};

/**
 * 예시 Character
 */
export const exampleCharacter: CharacterSpec = {
  id: 'char-001',
  name: '루나',
  version: '1.0.0',
  appearance: {
    gender: 'female',
    age: 'adult',
    style: 'anime',
    face: {
      shape: 'oval',
      skinColor: '#ffe4c4',
      eyeColor: '#4a90e2',
      hairColor: '#ff69b4',
    },
    hair: {
      style: 'long',
      color: '#ff69b4',
      length: 'shoulder',
    },
    body: {
      type: 'slim',
      height: 165,
    },
    clothes: {
      top: '흰색 블라우스',
      bottom: '청바지',
      shoes: '운동화',
      accessories: ['귀걸이'],
    },
    description: '밝고 친근한 표정의 여성 캐릭터, 분홍색 긴 머리',
  },
  voice: {
    type: 'female',
    age: 'adult',
    tone: 'soft',
    voiceId: 'female-soft-001',
    speed: 1.0,
    pitch: 1.0,
  },
  expressions: [
    {
      id: 'expr-happy',
      name: 'happy',
      emotionState: 'happy',
      blendshapes: {
        smile: 0.8,
        eyeSquint: 0.3,
        mouthSmile: 0.7,
      },
      intensity: 1.0,
      transitionDuration: 0.3,
    },
    {
      id: 'expr-sad',
      name: 'sad',
      emotionState: 'sad',
      blendshapes: {
        frown: 0.6,
        sadness: 0.7,
        browDown: 0.4,
      },
      intensity: 1.0,
      transitionDuration: 0.3,
    },
    {
      id: 'expr-angry',
      name: 'angry',
      emotionState: 'angry',
      blendshapes: {
        anger: 0.8,
        frown: 0.7,
        browDown: 0.6,
      },
      intensity: 1.0,
      transitionDuration: 0.3,
    },
    {
      id: 'expr-surprised',
      name: 'surprised',
      emotionState: 'surprised',
      blendshapes: {
        surprise: 0.9,
        eyeWide: 0.8,
        mouthOpen: 0.5,
        browInnerUp: 0.7,
      },
      intensity: 1.0,
      transitionDuration: 0.2,
    },
    {
      id: 'expr-neutral',
      name: 'neutral',
      emotionState: 'neutral',
      blendshapes: {},
      intensity: 1.0,
      transitionDuration: 0.3,
    },
  ],
  motions: [
    {
      id: 'motion-idle',
      name: 'idle',
      type: 'idle',
      loop: true,
      speed: 1.0,
      description: '기본 대기 동작',
    },
    {
      id: 'motion-talk',
      name: 'talk',
      type: 'talk',
      loop: true,
      speed: 1.0,
      description: '대화 중 동작',
    },
    {
      id: 'motion-wave',
      name: 'wave',
      type: 'gesture',
      duration: 2.0,
      loop: false,
      speed: 1.0,
      description: '손 흔들기',
    },
  ],
  personality: {
    traits: ['cheerful', 'friendly', 'optimistic'],
    description: '밝고 긍정적인 성격',
  },
  metadata: {
    tags: ['main-character', 'female', 'anime'],
    notes: '메인 캐릭터',
  },
};

/**
 * ============================================
 * 5. 필드 설명 테이블 (주석)
 * ============================================
 */

/**
 * Scene 필드 설명:
 * 
 * - id: 장면 고유 식별자 (필수)
 * - name: 장면 이름 (사용자 표시용)
 * - type: 콘텐츠 타입 (shortform/video/animation/movie)
 * - order: 장면 순서 (정렬용)
 * - background: 배경 설정 (이미지/비디오/3D/색상)
 * - camera: 카메라 위치, 회전, 줌, 포커스
 * - lighting: 조명 타입, 방향, 강도
 * - characters: 장면에 등장하는 캐릭터 배치
 * - dialogues: 대화 목록
 * - audio: 배경 음악 및 효과음
 * - timing: 시작 시간, 지속 시간, 전환 효과
 * - metadata: 확장 가능한 메타데이터
 * 
 * Character 필드 설명:
 * 
 * - id: 캐릭터 고유 식별자 (필수)
 * - name: 캐릭터 이름
 * - appearance: 외형 설정 (성별, 나이, 스타일, 얼굴, 머리, 체형, 옷)
 * - voice: 음성 설정 (타입, 나이, 톤, 속도, 음높이)
 * - expressions: 지원하는 표정 목록 (Blendshape 값 포함)
 * - motions: 지원하는 동작 목록
 * - personality: 성격 특성
 * - metadata: 확장 가능한 메타데이터
 * 
 * Dialogue 필드 설명:
 * 
 * - id: 대화 고유 식별자 (필수)
 * - sceneId: 속한 Scene ID
 * - characterId: 대화하는 캐릭터 ID
 * - order: 대화 순서
 * - text: 대사 텍스트
 * - emotion: 감정 상태
 * - expression: 표정 ID (선택사항)
 * - motion: 동작 ID (선택사항)
 * - timing: 시작 시간, 지속 시간, 일시정지
 * - voice: 음성 설정 (오버라이드 가능)
 * - lipSync: 립싱크 설정
 * - camera: 대사 중 카메라 제어
 * - metadata: 확장 가능한 메타데이터
 */
