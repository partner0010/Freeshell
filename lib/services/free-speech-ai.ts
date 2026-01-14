/**
 * 완전 무료 음성 AI 서비스
 * OpenAI Whisper (오픈소스) 통합
 */

export interface SpeechAIResponse {
  text: string;
  source: 'whisper-local' | 'whisper-api' | 'vosk' | 'fallback';
  success: boolean;
  confidence: number;
  responseTime: number;
}

/**
 * 음성을 텍스트로 변환 (STT - Speech to Text)
 */
export async function transcribeSpeech(
  audioBlob: Blob | ArrayBuffer,
  options?: {
    language?: string;
    model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  }
): Promise<SpeechAIResponse> {
  const startTime = Date.now();

  // 1순위: Whisper API (Hugging Face Inference API - 무료)
  try {
    const result = await tryWhisperAPI(audioBlob, options);
    if (result.success) {
      return {
        ...result,
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.warn('[FreeSpeechAI] Whisper API 실패:', error);
  }

  // 2순위: Vosk (로컬 실행)
  try {
    const result = await tryVosk(audioBlob, options);
    if (result.success) {
      return {
        ...result,
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.warn('[FreeSpeechAI] Vosk 실패:', error);
  }

  // Fallback
  return {
    text: '',
    source: 'fallback',
    success: false,
    confidence: 0,
    responseTime: Date.now() - startTime,
  };
}

/**
 * Whisper API (Hugging Face Inference API)
 */
async function tryWhisperAPI(
  audioBlob: Blob | ArrayBuffer,
  options?: { language?: string; model?: string }
): Promise<SpeechAIResponse> {
  try {
    // Hugging Face Whisper 모델 사용
    const model = options?.model || 'openai/whisper-base';
    const formData = new FormData();
    
    // Blob을 File로 변환
    const file = audioBlob instanceof Blob 
      ? new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
      : new File([new Blob([audioBlob])], 'audio.webm', { type: 'audio/webm' });
    
    formData.append('file', file);
    if (options?.language) {
      formData.append('language', options.language);
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (response.ok) {
      const data = await response.json();
      const text = data.text || '';
      if (text) {
        return {
          text,
          source: 'whisper-api',
          success: true,
          confidence: 0.9,
          responseTime: 0,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeSpeechAI] Whisper API 오류:', error);
  }

  return {
    text: '',
    source: 'whisper-api',
    success: false,
    confidence: 0,
    responseTime: 0,
  };
}

/**
 * Vosk (로컬 실행)
 */
async function tryVosk(
  audioBlob: Blob | ArrayBuffer,
  options?: { language?: string }
): Promise<SpeechAIResponse> {
  // Vosk는 로컬 서버가 필요함
  // 사용자가 Vosk 서버를 실행한 경우에만 작동
  const voskUrl = process.env.VOSK_URL || 'http://localhost:2700';
  
  try {
    const formData = new FormData();
    const file = audioBlob instanceof Blob 
      ? new File([audioBlob], 'audio.webm', { type: 'audio/webm' })
      : new File([new Blob([audioBlob])], 'audio.webm', { type: 'audio/webm' });
    
    formData.append('audio', file);

    const response = await fetch(`${voskUrl}/recognize`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.text || '';
      if (text) {
        return {
          text,
          source: 'vosk',
          success: true,
          confidence: 0.85,
          responseTime: 0,
        };
      }
    }
  } catch (error) {
    // Vosk 서버가 실행되지 않았을 수 있음 (정상)
    console.log('[FreeSpeechAI] Vosk 사용 불가 (서버가 실행되지 않았을 수 있음)');
  }

  return {
    text: '',
    source: 'vosk',
    success: false,
    confidence: 0,
    responseTime: 0,
  };
}

/**
 * 텍스트를 음성으로 변환 (TTS - Text to Speech)
 */
export async function synthesizeSpeech(
  text: string,
  options?: {
    language?: string;
    voice?: string;
  }
): Promise<Blob | null> {
  // 1순위: Web Speech API (브라우저 내장, 완전 무료)
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return await synthesizeWithWebSpeechAPI(text, options);
    }
  } catch (error) {
    console.warn('[FreeSpeechAI] Web Speech API 실패:', error);
  }

  // 2순위: Edge TTS (Microsoft Edge TTS - 무료)
  try {
    return await synthesizeWithEdgeTTS(text, options);
  } catch (error) {
    console.warn('[FreeSpeechAI] Edge TTS 실패:', error);
  }

  return null;
}

/**
 * Web Speech API (브라우저 내장)
 */
async function synthesizeWithWebSpeechAPI(
  text: string,
  options?: { language?: string; voice?: string }
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options?.language || 'ko-KR';
    
    // 음성 선택
    const voices = speechSynthesis.getVoices();
    if (options?.voice) {
      const voice = voices.find(v => v.name.includes(options.voice!));
      if (voice) utterance.voice = voice;
    }

    // 오디오 캡처는 복잡하므로 간단한 구현
    utterance.onend = () => {
      // 실제로는 MediaRecorder를 사용해야 하지만, 여기서는 null 반환
      resolve(null);
    };

    speechSynthesis.speak(utterance);
    
    // Web Speech API는 직접 Blob을 생성할 수 없으므로 null 반환
    setTimeout(() => resolve(null), 1000);
  });
}

/**
 * Edge TTS (Microsoft Edge TTS - 무료)
 */
async function synthesizeWithEdgeTTS(
  text: string,
  options?: { language?: string; voice?: string }
): Promise<Blob | null> {
  try {
    // Edge TTS는 공개 API가 아니므로, 대신 다른 무료 TTS 사용
    // 실제로는 서버 사이드에서 Edge TTS를 사용하거나
    // 다른 무료 TTS API를 사용해야 함
    return null;
  } catch (error) {
    console.warn('[FreeSpeechAI] Edge TTS 오류:', error);
    return null;
  }
}
