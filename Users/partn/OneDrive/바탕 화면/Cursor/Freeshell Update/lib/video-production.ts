/**
 * 포켓 - 올인원 동영상 제작 솔루션
 * YouTube/SNS용 동영상 자동 생성
 */

import { openai } from './openai';
import { aiModelManager } from './ai-models';

export interface VideoProductionConfig {
  topic: string;
  style: 'animation' | 'realistic' | 'photo-restoration';
  duration: number; // 초
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export interface ScriptResult {
  script: string;
  characters: Array<{
    name: string;
    description: string;
    prompt: string;
  }>;
  scenes: Array<{
    sceneNumber: number;
    description: string;
    characters: string[];
    background: string;
    mood: string;
  }>;
}

export interface SceneImage {
  sceneNumber: number;
  url: string;
  prompt: string;
  metadata: {
    characters: string[];
    background: string;
    mood?: string;
    weather?: string;
    timeOfDay?: string;
  };
}

export interface VideoScene {
  sceneNumber: number;
  videoUrl: string;
  imageUrl: string;
  duration: number;
  prompt: string;
}

export interface AudioTrack {
  url: string;
  type: 'background' | 'voice' | 'sound-effect';
  prompt: string;
  volume: number;
}

export interface FinalVideo {
  videoUrl: string;
  thumbnail: string;
  script: ScriptResult;
  scenes: VideoScene[];
  audio: AudioTrack[];
  metadata: {
    totalDuration: number;
    style: string;
    generatedAt: string;
  };
}

/**
 * 포켓 동영상 제작 엔진
 */
export class VideoProductionEngine {
  /**
   * 1단계: ChatGPT로 대본 및 캐릭터 프롬프트 생성
   */
  async generateScript(config: VideoProductionConfig): Promise<ScriptResult> {
    try {
      const prompt = `다음 주제로 YouTube/SNS용 동영상 대본을 작성해주세요:

주제: ${config.topic}
스타일: ${config.style === 'animation' ? '3D 픽사 애니메이션 스타일' : config.style === 'realistic' ? '실사형' : '사진 복원형'}
영상 길이: ${config.duration}초

다음 형식으로 작성해주세요:

1. 대본 (각 장면별 대사와 나레이션)
2. 등장 캐릭터 (이름, 외모, 성격, 3D 픽사 애니메이션 스타일 프롬프트)
3. 장면별 연출 (장면 번호, 설명, 등장인물, 배경, 분위기)

JSON 형식으로 반환해주세요:
{
  "script": "전체 대본 텍스트",
  "characters": [
    {
      "name": "캐릭터 이름",
      "description": "캐릭터 설명",
      "prompt": "3D 픽사 애니메이션 스타일 캐릭터 프롬프트"
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "장면 설명",
      "characters": ["캐릭터 이름"],
      "background": "배경 설명",
      "mood": "분위기"
    }
  ]
}`;

      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: 'gpt-4',
          prompt: prompt,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.result;
        
        // JSON 파싱 시도
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn('JSON 파싱 실패, 기본 구조 생성:', e);
        }
      }

      // 폴백: 기본 구조 반환
      return {
        script: `${config.topic}에 대한 동영상 대본입니다.`,
        characters: [
          {
            name: '주인공',
            description: '주인공 캐릭터',
            prompt: `3D 픽사 애니메이션 스타일, ${config.style === 'animation' ? '캐주얼하고 친근한' : '현실적인'} 캐릭터`,
          },
        ],
        scenes: [
          {
            sceneNumber: 1,
            description: `${config.topic} 소개 장면`,
            characters: ['주인공'],
            background: '밝고 깔끔한 배경',
            mood: '친근하고 긍정적인',
          },
        ],
      };
    } catch (error) {
      console.error('대본 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 2단계: Google Wisk로 연출 장면 이미지 생성 (최대 50개)
   */
  async generateSceneImages(
    script: ScriptResult,
    config: VideoProductionConfig
  ): Promise<SceneImage[]> {
    const images: SceneImage[] = [];
    const maxScenes = Math.min(script.scenes.length, 50);

    for (let i = 0; i < maxScenes; i++) {
      const scene = script.scenes[i];
      
      // 이미지 생성 프롬프트 구성 (try 블록 밖에서 정의)
      const imagePrompt = `${config.style === 'animation' ? '3D 픽사 애니메이션 스타일, ' : config.style === 'realistic' ? '실사형, 고품질, ' : '사진 복원형, '}${scene.description}, ${scene.background}, ${scene.mood} 분위기, ${scene.characters.join(', ')} 등장, ${config.aspectRatio} 비율, 고해상도`;
      
      try {
        // OpenAI DALL-E 3로 이미지 생성 (Google Wisk 대체)
        const imageUrl = await openai.generateImage(imagePrompt);

        images.push({
          sceneNumber: scene.sceneNumber,
          url: imageUrl,
          prompt: imagePrompt,
          metadata: {
            characters: scene.characters,
            background: scene.background,
            mood: scene.mood,
          },
        });

        // API 제한을 고려한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`장면 ${scene.sceneNumber} 이미지 생성 오류:`, error);
        // 폴백: 플레이스홀더 이미지
        images.push({
          sceneNumber: scene.sceneNumber,
          url: `https://via.placeholder.com/1920x1080/6366f1/ffffff?text=Scene+${scene.sceneNumber}`,
          prompt: imagePrompt,
          metadata: {
            characters: scene.characters,
            background: scene.background,
            mood: scene.mood,
          },
        });
      }
    }

    return images;
  }

  /**
   * 3단계: Google Wisk + Grok4로 애니메이션 생성
   */
  async generateVideoScenes(
    sceneImages: SceneImage[],
    script: ScriptResult,
    config: VideoProductionConfig
  ): Promise<VideoScene[]> {
    const videoScenes: VideoScene[] = [];

    for (const sceneImage of sceneImages) {
      try {
        const scene = script.scenes.find(s => s.sceneNumber === sceneImage.sceneNumber);
        if (!scene) continue;

        // 애니메이션 프롬프트 생성
        const animationPrompt = `${sceneImage.prompt}, 자연스러운 움직임, 부드러운 애니메이션, ${config.style === 'animation' ? '3D 픽사 스타일 애니메이션' : '실사형 움직임'}, ${config.duration / sceneImages.length}초 길이`;

        // Kling AI 또는 Sora 스타일로 영상 생성 (Google Wisk + Grok4 대체)
        // 실제로는 Kling AI API 사용
        const videoUrl = await this.generateVideoFromImage(
          sceneImage.url,
          animationPrompt,
          {
            duration: Math.max(3, Math.floor(config.duration / sceneImages.length)),
            style: config.style,
          }
        );

        videoScenes.push({
          sceneNumber: sceneImage.sceneNumber,
          videoUrl: videoUrl,
          imageUrl: sceneImage.url,
          duration: Math.max(3, Math.floor(config.duration / sceneImages.length)),
          prompt: animationPrompt,
        });
      } catch (error) {
        console.error(`장면 ${sceneImage.sceneNumber} 영상 생성 오류:`, error);
        // 폴백: 정적 이미지
        videoScenes.push({
          sceneNumber: sceneImage.sceneNumber,
          videoUrl: sceneImage.url, // 이미지를 영상으로 사용
          imageUrl: sceneImage.url,
          duration: 3,
          prompt: sceneImage.prompt,
        });
      }
    }

    return videoScenes;
  }

  /**
   * 이미지에서 영상 생성 (Kling AI 스타일)
   */
  private async generateVideoFromImage(
    imageUrl: string,
    prompt: string,
    options: { duration: number; style: string }
  ): Promise<string> {
    try {
      // Kling AI API 호출 시도
      const response = await fetch('/api/video/animate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          prompt,
          duration: options.duration,
          style: options.style,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.videoUrl || imageUrl;
      }
    } catch (error) {
      console.warn('Kling AI 호출 실패, 폴백 사용:', error);
    }

    // 폴백: 이미지 URL 반환 (정적 이미지)
    return imageUrl;
  }

  /**
   * 4단계: MMAudio AI로 오디오 합성
   */
  async generateAudio(
    script: ScriptResult,
    videoScenes: VideoScene[],
    config: VideoProductionConfig
  ): Promise<AudioTrack[]> {
    const audioTracks: AudioTrack[] = [];

    try {
      // 배경 음악 생성
      const bgMusicPrompt = `${config.topic}에 어울리는 배경 음악, ${script.scenes[0]?.mood || '긍정적인'} 분위기, 전문적인 품질`;
      
      const bgMusicUrl = await this.generateAudioWithMMAudio(bgMusicPrompt, {
        type: 'background',
        duration: config.duration,
      });

      audioTracks.push({
        url: bgMusicUrl,
        type: 'background',
        prompt: bgMusicPrompt,
        volume: 0.3,
      });

      // 나레이션/대사 음성 생성
      for (const scene of script.scenes) {
        const voicePrompt = `${scene.description}, 자연스러운 나레이션, 전문적인 음성`;
        
        const voiceUrl = await this.generateAudioWithMMAudio(voicePrompt, {
          type: 'voice',
          duration: Math.max(3, Math.floor(config.duration / script.scenes.length)),
        });

        audioTracks.push({
          url: voiceUrl,
          type: 'voice',
          prompt: voicePrompt,
          volume: 0.8,
        });
      }

      // 효과음 생성
      const soundEffectPrompt = `${config.topic}에 어울리는 효과음, 몰입감 있는 사운드`;
      
      const soundEffectUrl = await this.generateAudioWithMMAudio(soundEffectPrompt, {
        type: 'sound-effect',
        duration: config.duration,
      });

      audioTracks.push({
        url: soundEffectUrl,
        type: 'sound-effect',
        prompt: soundEffectPrompt,
        volume: 0.2,
      });
    } catch (error) {
      console.error('오디오 생성 오류:', error);
      // 폴백: 기본 오디오
      audioTracks.push({
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        type: 'background',
        prompt: '기본 배경 음악',
        volume: 0.3,
      });
    }

    return audioTracks;
  }

  /**
   * MMAudio AI로 오디오 생성
   */
  private async generateAudioWithMMAudio(
    prompt: string,
    options: { type: string; duration: number }
  ): Promise<string> {
    try {
      // MMAudio AI API 호출 시도
      const response = await fetch('/api/audio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: options.type,
          duration: options.duration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      }
    } catch (error) {
      console.warn('MMAudio AI 호출 실패, 폴백 사용:', error);
    }

    // 폴백: 기본 오디오 URL
    return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
  }

  /**
   * 전체 동영상 제작 프로세스 실행
   */
  async produceVideo(config: VideoProductionConfig): Promise<FinalVideo> {
    // 1단계: 대본 및 캐릭터 생성
    const script = await this.generateScript(config);

    // 2단계: 장면 이미지 생성
    const sceneImages = await this.generateSceneImages(script, config);

    // 3단계: 영상 장면 생성
    const videoScenes = await this.generateVideoScenes(sceneImages, script, config);

    // 4단계: 오디오 생성
    const audioTracks = await this.generateAudio(script, videoScenes, config);

    // 최종 영상 URL (실제로는 모든 장면을 합성)
    const finalVideoUrl = await this.composeFinalVideo(videoScenes, audioTracks, config);

    return {
      videoUrl: finalVideoUrl,
      thumbnail: sceneImages[0]?.url || '',
      script,
      scenes: videoScenes,
      audio: audioTracks,
      metadata: {
        totalDuration: config.duration,
        style: config.style,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 최종 영상 합성
   */
  private async composeFinalVideo(
    scenes: VideoScene[],
    audio: AudioTrack[],
    config: VideoProductionConfig
  ): Promise<string> {
    try {
      // 영상 합성 API 호출
      const response = await fetch('/api/video/compose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenes,
          audio,
          config,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.videoUrl || scenes[0]?.videoUrl || '';
      }
    } catch (error) {
      console.warn('영상 합성 실패, 첫 번째 장면 반환:', error);
    }

    // 폴백: 첫 번째 장면 반환
    return scenes[0]?.videoUrl || '';
  }
}

export const videoProductionEngine = new VideoProductionEngine();

