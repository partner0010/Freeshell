/**
 * STEP 2: 캐릭터 음성 + 감정 TTS 구조
 * 성별, 감정, 대사에 따른 자연스러운 음성 생성
 */

/**
 * TTS 입력 데이터
 */
export interface TTSInput {
  characterId: string;
  gender: 'male' | 'female';
  emotion: 'happy' | 'sad' | 'angry' | 'surprised' | 'neutral' | 'excited' | 'calm';
  dialogueText: string;
  speechSpeed: number;  // 0.8 ~ 1.2
  tone: 'soft' | 'normal' | 'loud' | 'gentle' | 'energetic';
  age: 'child' | 'teen' | 'adult' | 'elder';
}

/**
 * TTS 출력 데이터
 */
export interface TTSOutput {
  audioPath: string;
  duration: number;
  timing: {
    phonemes: Array<{
      phoneme: string;
      start: number;
      duration: number;
      intensity: number;
    }>;
    words: Array<{
      word: string;
      start: number;
      duration: number;
    }>;
  };
  emotionTag: string;
  lipSyncData: number[];  // 프레임별 립싱크 데이터
}

/**
 * ============================================
 * 전체 TTS 처리 흐름
 * ============================================
 */

/**
 * TTS 처리 단계
 */
export interface TTSPipeline {
  // 1. 텍스트 전처리
  preprocess: (text: string) => string;
  
  // 2. 감정 분석 및 파라미터 매핑
  mapEmotionToParams: (emotion: string, gender: string) => TTSParams;
  
  // 3. 음성 생성
  generateVoice: (text: string, params: TTSParams) => Promise<string>;
  
  // 4. 타이밍 분석
  analyzeTiming: (audioPath: string, text: string) => Promise<TTSOutput['timing']>;
  
  // 5. 립싱크 데이터 생성
  generateLipSync: (timing: TTSOutput['timing']) => number[];
}

/**
 * TTS 파라미터
 */
export interface TTSParams {
  pitch: number;        // 0.5 ~ 2.0
  speed: number;        // 0.5 ~ 2.0
  volume: number;       // 0.0 ~ 1.0
  emotion: string;
  gender: string;
  age: string;
}

/**
 * ============================================
 * 감정 → 음성 파라미터 매핑
 * ============================================
 */

export const EmotionToVoiceParams: Record<string, TTSParams> = {
  happy: {
    pitch: 1.1,
    speed: 1.05,
    volume: 0.9,
    emotion: 'happy',
    gender: 'auto',
    age: 'auto',
  },
  sad: {
    pitch: 0.9,
    speed: 0.85,
    volume: 0.7,
    emotion: 'sad',
    gender: 'auto',
    age: 'auto',
  },
  angry: {
    pitch: 0.95,
    speed: 1.1,
    volume: 1.0,
    emotion: 'angry',
    gender: 'auto',
    age: 'auto',
  },
  surprised: {
    pitch: 1.2,
    speed: 1.0,
    volume: 0.95,
    emotion: 'surprised',
    gender: 'auto',
    age: 'auto',
  },
  neutral: {
    pitch: 1.0,
    speed: 1.0,
    volume: 0.8,
    emotion: 'neutral',
    gender: 'auto',
    age: 'auto',
  },
  excited: {
    pitch: 1.15,
    speed: 1.1,
    volume: 0.95,
    emotion: 'excited',
    gender: 'auto',
    age: 'auto',
  },
  calm: {
    pitch: 0.95,
    speed: 0.9,
    volume: 0.75,
    emotion: 'calm',
    gender: 'auto',
    age: 'auto',
  },
};

/**
 * 성별별 기본 파라미터
 */
export const GenderBaseParams: Record<string, Partial<TTSParams>> = {
  male: {
    pitch: 0.85,
    volume: 0.9,
  },
  female: {
    pitch: 1.15,
    volume: 0.85,
  },
};

/**
 * 나이별 기본 파라미터
 */
export const AgeBaseParams: Record<string, Partial<TTSParams>> = {
  child: {
    pitch: 1.3,
    speed: 1.1,
    volume: 0.8,
  },
  teen: {
    pitch: 1.1,
    speed: 1.05,
    volume: 0.85,
  },
  adult: {
    pitch: 1.0,
    speed: 1.0,
    volume: 0.8,
  },
  elder: {
    pitch: 0.9,
    speed: 0.9,
    volume: 0.75,
  },
};

/**
 * 최종 파라미터 계산
 */
export function calculateTTSParams(input: TTSInput): TTSParams {
  const emotionParams = EmotionToVoiceParams[input.emotion] || EmotionToVoiceParams.neutral;
  const genderParams = GenderBaseParams[input.gender] || {};
  const ageParams = AgeBaseParams[input.age] || {};
  
  return {
    pitch: (emotionParams.pitch * (genderParams.pitch || 1.0) * (ageParams.pitch || 1.0)) * input.speechSpeed,
    speed: (emotionParams.speed * (ageParams.speed || 1.0)) * input.speechSpeed,
    volume: emotionParams.volume * (genderParams.volume || 1.0) * (ageParams.volume || 1.0),
    emotion: input.emotion,
    gender: input.gender,
    age: input.age,
  };
}

/**
 * ============================================
 * Dialogue → 음성 변환 구조
 * ============================================
 */

/**
 * Dialogue를 TTS 입력으로 변환
 */
export function dialogueToTTSInput(
  dialogue: {
    speakerId: string;
    text: string;
    emotion: string;
    voiceTone: string;
  },
  character: {
    id: string;
    gender: 'male' | 'female';
    voice: {
      age: string;
      tone: string;
      speed: number;
    };
  }
): TTSInput {
  return {
    characterId: character.id,
    gender: character.gender,
    emotion: dialogue.emotion as any,
    dialogueText: dialogue.text,
    speechSpeed: character.voice.speed || 1.0,
    tone: (dialogue.voiceTone || character.voice.tone) as any,
    age: character.voice.age as any,
  };
}

/**
 * TTS 생성 함수
 */
export async function generateTTS(input: TTSInput): Promise<TTSOutput> {
  // 1. 파라미터 계산
  const params = calculateTTSParams(input);
  
  // 2. 텍스트 전처리
  const processedText = preprocessText(input.dialogueText);
  
  // 3. 음성 생성 (Web Speech API 또는 오픈소스 TTS)
  const audioPath = await generateVoiceFile(processedText, params);
  
  // 4. 타이밍 분석
  const timing = await analyzeAudioTiming(audioPath, processedText);
  
  // 5. 립싱크 데이터 생성
  const lipSyncData = generateLipSyncFromTiming(timing);
  
  // 6. 오디오 길이 측정
  const duration = await getAudioDuration(audioPath);
  
  return {
    audioPath,
    duration,
    timing,
    emotionTag: input.emotion,
    lipSyncData,
  };
}

/**
 * ============================================
 * Scene 연동 방식
 * ============================================
 */

/**
 * Scene의 모든 Dialogue를 음성으로 변환
 */
export async function generateSceneVoices(
  scene: {
    id: string;
    dialogues: Array<{
      id: string;
      speakerId: string;
      text: string;
      emotion: string;
      voiceTone: string;
      timing: { start: number; duration: number };
    }>;
  },
  characters: Array<{
    id: string;
    gender: 'male' | 'female';
    voice: {
      age: string;
      tone: string;
      speed: number;
    };
  }>
): Promise<Array<{
  dialogueId: string;
  audioPath: string;
  timing: TTSOutput['timing'];
  lipSyncData: number[];
}>> {
  const results = await Promise.all(
    scene.dialogues.map(async (dialogue) => {
      const character = characters.find(c => c.id === dialogue.speakerId);
      if (!character) throw new Error(`Character not found: ${dialogue.speakerId}`);
      
      const ttsInput = dialogueToTTSInput(dialogue, character);
      const ttsOutput = await generateTTS(ttsInput);
      
      return {
        dialogueId: dialogue.id,
        audioPath: ttsOutput.audioPath,
        timing: ttsOutput.timing,
        lipSyncData: ttsOutput.lipSyncData,
      };
    })
  );
  
  return results;
}

/**
 * ============================================
 * 확장 구조 (다국어)
 * ============================================
 */

export interface MultilingualTTS {
  language: string;
  voice: {
    locale: string;
    gender: 'male' | 'female';
  };
  text: string;
}

export const LanguageVoiceMap: Record<string, { male: string; female: string }> = {
  ko: {
    male: 'ko-KR-Male',
    female: 'ko-KR-Female',
  },
  en: {
    male: 'en-US-Male',
    female: 'en-US-Female',
  },
  ja: {
    male: 'ja-JP-Male',
    female: 'ja-JP-Female',
  },
  zh: {
    male: 'zh-CN-Male',
    female: 'zh-CN-Female',
  },
};

/**
 * 다국어 TTS 생성
 */
export async function generateMultilingualTTS(
  text: string,
  language: string,
  gender: 'male' | 'female',
  emotion: string
): Promise<TTSOutput> {
  const voiceId = LanguageVoiceMap[language]?.[gender] || LanguageVoiceMap.ko[gender];
  const params = calculateTTSParams({
    characterId: 'multilingual',
    gender,
    emotion: emotion as any,
    dialogueText: text,
    speechSpeed: 1.0,
    tone: 'normal',
    age: 'adult',
  });
  
  return await generateTTS({
    characterId: 'multilingual',
    gender,
    emotion: emotion as any,
    dialogueText: text,
    speechSpeed: params.speed,
    tone: 'normal',
    age: 'adult',
  });
}

// 헬퍼 함수들 (실제 구현 필요)
function preprocessText(text: string): string {
  // 텍스트 정규화, 특수문자 처리 등
  return text.trim();
}

async function generateVoiceFile(text: string, params: TTSParams): Promise<string> {
  // Web Speech API 또는 오픈소스 TTS 사용
  // 실제 구현 필요
  throw new Error('Not implemented');
}

async function analyzeAudioTiming(audioPath: string, text: string): Promise<TTSOutput['timing']> {
  // 오디오 분석하여 Phoneme/Words 타이밍 추출
  // 실제 구현 필요
  throw new Error('Not implemented');
}

function generateLipSyncFromTiming(timing: TTSOutput['timing']): number[] {
  // Phoneme → Viseme → Blendshape 변환
  // 실제 구현 필요
  const fps = 30;
  const totalFrames = Math.ceil(timing.words[timing.words.length - 1]?.start + timing.words[timing.words.length - 1]?.duration || 0) * fps;
  
  const lipSyncData: number[] = [];
  for (let i = 0; i < totalFrames; i++) {
    const time = i / fps;
    const currentPhoneme = timing.phonemes.find(p => 
      time >= p.start && time < p.start + p.duration
    );
    
    if (currentPhoneme) {
      // Viseme 매핑 (간단한 예시)
      const visemeValue = mapPhonemeToViseme(currentPhoneme.phoneme);
      lipSyncData.push(visemeValue);
    } else {
      lipSyncData.push(0.0); // 닫힘
    }
  }
  
  return lipSyncData;
}

function mapPhonemeToViseme(phoneme: string): number {
  // Phoneme → Viseme 매핑
  const visemeMap: Record<string, number> = {
    'SIL': 0.0,
    'AA': 0.8,
    'EH': 0.6,
    'IH': 0.5,
    'OH': 0.7,
    'UH': 0.4,
  };
  
  return visemeMap[phoneme] || 0.3;
}

async function getAudioDuration(audioPath: string): Promise<number> {
  // 오디오 길이 측정
  // 실제 구현 필요
  throw new Error('Not implemented');
}
