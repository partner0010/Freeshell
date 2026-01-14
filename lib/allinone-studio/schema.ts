/**
 * 올인원 스튜디오 - 핵심 데이터 구조
 * Scene 기반 콘텐츠 제작 시스템
 */

/**
 * 캐릭터 정의
 */
export interface Character {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  style: 'anime' | 'realistic' | 'cartoon' | '3d' | '2d';
  appearance: {
    face: string;              // 얼굴 특징 설명
    hair: string;              // 머리카락
    clothes: string;            // 옷차림
    bodyType?: string;          // 체형
  };
  voice: {
    type: 'male' | 'female';
    age: 'child' | 'teen' | 'adult' | 'elder';
    tone: 'soft' | 'normal' | 'loud' | 'gentle' | 'energetic';
    voiceId?: string;           // TTS 음성 ID
  };
  expressions: Expression[];   // 지원하는 표정
  motions: Motion[];            // 지원하는 동작
  metadata?: {
    [key: string]: any;
  };
}

/**
 * 표정 정의
 */
export interface Expression {
  id: string;
  name: string;                // 'happy', 'sad', 'angry', 'surprised', 'neutral'
  blendshapes?: {              // Face Blendshape 값
    [key: string]: number;      // 0.0 ~ 1.0
  };
  emotionState: EmotionState;
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
  | 'calm';

/**
 * 동작 정의
 */
export interface Motion {
  id: string;
  name: string;                // 'idle', 'talk', 'walk', 'run', 'sit', 'wave'
  type: 'idle' | 'walk' | 'talk' | 'gesture' | 'emotion';
  duration?: number;            // 초 단위
  loop?: boolean;               // 반복 여부
}

/**
 * 대화 정의
 */
export interface Dialogue {
  id: string;
  characterId: string;
  text: string;
  emotion?: EmotionState;
  expression?: string;          // Expression ID
  motion?: string;              // Motion ID
  timing: {
    start: number;               // 시작 시간 (초)
    duration: number;           // 지속 시간 (초)
  };
  voice?: {
    text: string;               // TTS 텍스트
    voiceId?: string;           // 음성 ID
    speed?: number;             // 속도 (0.8 ~ 1.2)
    pitch?: number;             // 음높이 (0.8 ~ 1.2)
  };
  lipSync?: {
    enabled: boolean;
    data?: number[];            // 립싱크 데이터 (프레임별)
  };
}

/**
 * 장면 (Scene) 정의
 */
export interface Scene {
  id: string;
  name: string;
  type: 'shortform' | 'video' | 'animation' | 'movie';
  background: {
    type: 'image' | 'video' | '3d' | 'color' | 'gradient';
    source: string;             // URL 또는 색상값
    description?: string;       // AI 생성용 설명
  };
  camera: {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    fov?: number;               // 시야각
    zoom?: number;              // 줌 레벨
  };
  characters: Character[];       // 장면에 등장하는 캐릭터
  dialogues: Dialogue[];        // 대화 목록
  music: {
    type: 'bgm' | 'sfx' | 'none';
    track?: string;             // 음악 파일 URL
    volume: number;             // 0.0 ~ 1.0
    loop: boolean;
    autoGenerate?: boolean;     // AI 자동 생성 여부
  };
  timing: {
    start: number;              // 시작 시간 (초)
    duration: number;           // 지속 시간 (초)
  };
  transitions?: {
    type: 'fade' | 'cut' | 'slide' | 'zoom';
    duration: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

/**
 * 프로젝트 정의
 */
export interface AllInOneProject {
  id: string;
  name: string;
  type: 'shortform' | 'video' | 'animation' | 'movie';
  description: string;
  scenes: Scene[];
  characters: Character[];       // 프로젝트 전체 캐릭터 풀
  settings: {
    resolution: {
      width: number;
      height: number;
    };
    fps: number;                 // 프레임레이트
    quality: 'low' | 'medium' | 'high' | 'ultra';
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: string;
  };
}

/**
 * 콘텐츠 생성 옵션
 */
export interface ContentGenerationOptions {
  type: 'shortform' | 'video' | 'animation' | 'movie';
  prompt: string;                // 사용자 요구사항
  style?: {
    visual: 'anime' | 'realistic' | 'cartoon' | '3d';
    mood: 'happy' | 'serious' | 'dramatic' | 'funny';
  };
  duration?: number;            // 목표 길이 (초)
  characters?: {
    count: number;
    genders?: ('male' | 'female')[];
  };
  includeMusic?: boolean;
  includeVoice?: boolean;
}

/**
 * 렌더링 작업
 */
export interface RenderJob {
  id: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;              // 0 ~ 100
  output?: {
    video?: string;              // 비디오 URL
    audio?: string;              // 오디오 URL
    thumbnail?: string;          // 썸네일 URL
  };
  error?: string;
  createdAt: number;
  completedAt?: number;
}
