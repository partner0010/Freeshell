/**
 * STEP 1: 숏폼 자동 렌더링 FFmpeg 파이프라인
 * Scene JSON → FFmpeg 명령 → 최종 영상
 */

import sceneExample from '../final-specs/scene-character-final.json';

// SceneJSON 타입 정의
export type SceneJSON = typeof sceneExample.scene;

/**
 * 렌더링 입력 데이터
 */
export interface RenderInput {
  scenes: SceneJSON[];
  characters: Array<{
    id: string;
    frames: string[];  // 프레임 이미지 경로 배열
  }>;
  audioFiles: Array<{
    dialogueId: string;
    audioPath: string;
    startTime: number;
    duration: number;
  }>;
  bgmFile?: string;
  settings: {
    resolution: { width: number; height: number };
    fps: number;
    quality: 'low' | 'medium' | 'high';
    format: 'mp4' | 'webm';
  };
}

/**
 * 렌더링 출력 데이터
 */
export interface RenderOutput {
  videoPath: string;
  previewPath: string;
  thumbnailPath: string;
  duration: number;
  fileSize: number;
}

/**
 * ============================================
 * 전체 렌더링 파이프라인 순서
 * ============================================
 */

/**
 * 단계 1: Scene → 이미지/프레임 준비
 */
export interface Step1_PrepareFrames {
  input: {
    scenes: SceneJSON[];
    characters: RenderInput['characters'];
  };
  output: {
    sceneFrames: Array<{
      sceneId: string;
      frames: string[];  // 프레임 이미지 경로
      duration: number;
      fps: number;
    }>;
  };
  ffmpegCommands: string[];
}

/**
 * 단계 2: 음성 + 립싱크 타이밍 적용
 */
export interface Step2_ApplyAudio {
  input: {
    audioFiles: RenderInput['audioFiles'];
    scenes: SceneJSON[];
  };
  output: {
    audioTrack: string;  // 합성된 오디오 파일 경로
    timing: Array<{
      dialogueId: string;
      startTime: number;
      endTime: number;
    }>;
  };
  ffmpegCommands: string[];
}

/**
 * 단계 3: 장면 전환 (cut, fade, zoom)
 */
export interface Step3_ApplyTransitions {
  input: {
    sceneFrames: Step1_PrepareFrames['output']['sceneFrames'];
    scenes: SceneJSON[];
  };
  output: {
    transitionedVideo: string;  // 전환 효과 적용된 비디오
  };
  ffmpegCommands: string[];
}

/**
 * 단계 4: 자막 자동 삽입
 */
export interface Step4_AddSubtitles {
  input: {
    video: string;
    dialogues: Array<{
      id: string;
      text: string;
      timing: { start: number; duration: number };
    }>;
  };
  output: {
    subtitledVideo: string;
  };
  ffmpegCommands: string[];
}

/**
 * 단계 5: 배경 음악 믹싱
 */
export interface Step5_MixBGM {
  input: {
    video: string;
    bgmFile?: string;
    bgmVolume: number;
    dialogues: RenderInput['audioFiles'];
  };
  output: {
    mixedVideo: string;
  };
  ffmpegCommands: string[];
}

/**
 * 단계 6: 해상도/비율 변환
 */
export interface Step6_ConvertResolution {
  input: {
    video: string;
    targetResolution: { width: number; height: number };
    aspectRatio: '9:16' | '1:1' | '16:9';
  };
  output: {
    convertedVideo: string;
  };
  ffmpegCommands: string[];
}

/**
 * 단계 7: 최종 렌더링
 */
export interface Step7_FinalRender {
  input: {
    video: string;
    settings: RenderInput['settings'];
  };
  output: {
    finalVideo: string;
    previewVideo: string;
    thumbnail: string;
  };
  ffmpegCommands: string[];
}

/**
 * ============================================
 * Scene → FFmpeg 명령 매핑 방식
 * ============================================
 */

/**
 * Scene을 FFmpeg 명령으로 변환
 */
export function sceneToFFmpegCommands(scene: SceneJSON, framePaths: string[]): string[] {
  const commands: string[] = [];
  const fps = 30;
  const duration = scene.duration;
  const frameCount = Math.ceil(duration * fps);
  
  // 1. 프레임을 비디오로 변환
  const sceneVideo = `scene-${scene.id}.mp4`;
  commands.push(
    `ffmpeg -y -framerate ${fps} -i ${framePaths[0]} -t ${duration} -c:v libx264 -pix_fmt yuv420p ${sceneVideo}`
  );
  
  // 2. 배경 추가
  if (scene.background.type === 'image') {
    const bgVideo = `bg-${scene.id}.mp4`;
    commands.push(
      `ffmpeg -y -loop 1 -i ${scene.background.source} -t ${duration} -vf "scale=1920:1080" -c:v libx264 -pix_fmt yuv420p ${bgVideo}`
    );
    
    // 배경과 캐릭터 합성
    const compositedVideo = `composited-${scene.id}.mp4`;
    commands.push(
      `ffmpeg -y -i ${bgVideo} -i ${sceneVideo} -filter_complex "[0:v][1:v]overlay=0:0" -c:v libx264 -pix_fmt yuv420p ${compositedVideo}`
    );
  }
  
  // 3. 카메라 모션 적용
  if (scene.camera.motion.type !== 'static' && scene.camera.motion.keyframes.length > 0) {
    const motionVideo = `motion-${scene.id}.mp4`;
    const motionFilter = generateMotionFilter(scene.camera.motion);
    commands.push(
      `ffmpeg -y -i ${sceneVideo} -vf "${motionFilter}" -c:v libx264 -pix_fmt yuv420p ${motionVideo}`
    );
  }
  
  return commands;
}

/**
 * 카메라 모션 필터 생성
 */
function generateMotionFilter(motion: SceneJSON['camera']['motion']): string {
  if (motion.type === 'zoom') {
    const keyframes = motion.keyframes as Array<{ time: number; zoom?: number; position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number } }>;
    const zoomValues = keyframes.map(k => `zoom=${(k as any).zoom || 1.0}`).join(':');
    return `zoompan=z='${zoomValues}':d=${keyframes.length * 30}:x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):s=1920x1080`;
  } else if (motion.type === 'pan') {
    const keyframes = motion.keyframes as Array<{ time: number; zoom?: number; position?: { x: number; y: number; z: number }; rotation?: { x: number; y: number; z: number } }>;
    const panValues = keyframes.map(k => {
      const x = k.position?.x || 0;
      const y = k.position?.y || 0;
      return `x=${x}:y=${y}`;
    }).join(':');
    return `crop=1920:1080:${panValues}`;
  }
  return '';
}

/**
 * ============================================
 * FFmpeg 명령 예시
 * ============================================
 */

/**
 * 전체 파이프라인 FFmpeg 명령 생성
 */
export function generateFFmpegPipeline(input: RenderInput): {
  commands: string[];
  script: string;
} {
  const commands: string[] = [];
  const tempDir = '/tmp/render';
  
  // 단계 1: Scene 프레임 준비
  const sceneVideos: string[] = [];
  input.scenes.forEach((scene, index) => {
    const character = input.characters.find(c => 
      scene.characters.some(sc => sc.characterId === c.id)
    );
    const framePaths = character?.frames || [];
    
    const sceneVideo = `${tempDir}/scene-${scene.id}.mp4`;
    const fps = input.settings.fps;
    const duration = scene.duration;
    
    commands.push(
      `ffmpeg -y -framerate ${fps} -i ${framePaths[0]} -t ${duration} -c:v libx264 -pix_fmt yuv420p ${sceneVideo}`
    );
    
    sceneVideos.push(sceneVideo);
  });
  
  // 단계 2: 음성 합성
  const audioFiles = input.audioFiles.map(a => `-i ${a.audioPath}`).join(' ');
  const audioFilter = input.audioFiles.map((a, i) => 
    `[${i}:a]adelay=${a.startTime * 1000}|${a.startTime * 1000}[a${i}]`
  ).join(';');
  const audioMix = input.audioFiles.map((_, i) => `[a${i}]`).join('');
  const audioOutput = `${tempDir}/dialogue-audio.wav`;
  
  commands.push(
    `ffmpeg -y ${audioFiles} -filter_complex "${audioFilter};${audioMix}amix=inputs=${input.audioFiles.length}:duration=longest" ${audioOutput}`
  );
  
  // 단계 3: 장면 전환
  const transitionedVideo = `${tempDir}/transitioned.mp4`;
  const sceneConcat = sceneVideos.map((v, i) => {
    const scene = input.scenes[i];
    const nextScene = input.scenes[i + 1];
    
    if (nextScene && scene.transition) {
      const transitionDuration = scene.transition.duration;
      if (scene.transition.type === 'fade') {
        return `[${i}:v]fade=t=out:st=${scene.duration - transitionDuration}:d=${transitionDuration}[v${i}];[v${i}][${i + 1}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${scene.duration - transitionDuration}[v${i + 1}]`;
      }
    }
    return `[${i}:v]`;
  }).join('');
  
  commands.push(
    `ffmpeg -y ${sceneVideos.map((v, i) => `-i ${v}`).join(' ')} -filter_complex "${transitionedVideo}" -c:v libx264 -pix_fmt yuv420p ${transitionedVideo}`
  );
  
  // 단계 4: 자막 추가
  const subtitledVideo = `${tempDir}/subtitled.mp4`;
  const subtitleFile = `${tempDir}/subtitles.srt`;
  const srtContent = generateSRT(input.scenes);
  
  commands.push(
    `echo "${srtContent}" > ${subtitleFile}`,
    `ffmpeg -y -i ${transitionedVideo} -vf "subtitles=${subtitleFile}:force_style='FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000'" -c:v libx264 -pix_fmt yuv420p ${subtitledVideo}`
  );
  
  // 단계 5: 배경 음악 믹싱
  const mixedVideo = `${tempDir}/mixed.mp4`;
  if (input.bgmFile) {
    const bgmVolume = input.scenes[0]?.music?.volume || 0.3;
    commands.push(
      `ffmpeg -y -i ${subtitledVideo} -i ${input.bgmFile} -i ${audioOutput} -filter_complex "[1:a]volume=${bgmVolume}[bgm];[2:a][bgm]amix=inputs=2:duration=longest" -c:v copy -c:a aac -b:a 192k ${mixedVideo}`
    );
  } else {
    commands.push(
      `ffmpeg -y -i ${subtitledVideo} -i ${audioOutput} -c:v copy -c:a aac -b:a 192k ${mixedVideo}`
    );
  }
  
  // 단계 6: 해상도 변환
  const convertedVideo = `${tempDir}/converted.mp4`;
  const { width, height } = input.settings.resolution;
  commands.push(
    `ffmpeg -y -i ${mixedVideo} -vf "scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset medium -crf 23 ${convertedVideo}`
  );
  
  // 단계 7: 최종 렌더링
  const finalVideo = `output-${Date.now()}.mp4`;
  const quality = input.settings.quality;
  const crf = quality === 'high' ? 18 : quality === 'medium' ? 23 : 28;
  
  commands.push(
    `ffmpeg -y -i ${convertedVideo} -c:v libx264 -preset slow -crf ${crf} -c:a aac -b:a 192k -movflags +faststart ${finalVideo}`
  );
  
  // 미리보기 생성
  const previewVideo = `preview-${Date.now()}.mp4`;
  commands.push(
    `ffmpeg -y -i ${convertedVideo} -vf "scale=640:360" -c:v libx264 -preset fast -crf 28 -c:a aac -b:a 64k ${previewVideo}`
  );
  
  // 썸네일 생성
  const thumbnail = `thumbnail-${Date.now()}.jpg`;
  commands.push(
    `ffmpeg -y -i ${convertedVideo} -ss 00:00:01 -vframes 1 -vf "scale=640:360" ${thumbnail}`
  );
  
  const script = commands.join('\n');
  
  return { commands, script };
}

/**
 * SRT 자막 파일 생성
 */
function generateSRT(scenes: SceneJSON[]): string {
  let srt = '';
  let index = 1;
  let currentTime = 0;
  
  scenes.forEach(scene => {
    scene.dialogues.forEach(dialogue => {
      const start = formatSRTTime(currentTime + dialogue.timing.start);
      const end = formatSRTTime(currentTime + dialogue.timing.start + dialogue.timing.duration);
      
      srt += `${index}\n`;
      srt += `${start} --> ${end}\n`;
      srt += `${dialogue.text}\n\n`;
      
      index++;
    });
    
    currentTime += scene.duration;
  });
  
  return srt;
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/**
 * ============================================
 * 병렬 처리 구조
 * ============================================
 */

/**
 * 병렬 렌더링 작업
 */
export interface ParallelRenderJob {
  jobId: string;
  scenes: SceneJSON[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  workers: Array<{
    id: string;
    sceneId: string;
    status: 'pending' | 'idle' | 'processing' | 'completed' | 'failed';
    progress: number;
  }>;
}

/**
 * 병렬 처리 실행
 */
export async function executeParallelRender(
  input: RenderInput,
  maxWorkers: number = 4
): Promise<RenderOutput> {
  const jobs: ParallelRenderJob[] = [];
  
  // Scene별로 작업 분할
  input.scenes.forEach((scene, index) => {
    if (index % maxWorkers === 0) {
      jobs.push({
        jobId: `job-${index}`,
        scenes: [],
        status: 'pending',
        progress: 0,
        workers: [],
      });
    }
    
    const currentJob = jobs[jobs.length - 1];
    currentJob.scenes.push(scene);
    currentJob.workers.push({
      id: `worker-${scene.id}`,
      sceneId: scene.id,
      status: 'pending',
      progress: 0,
    });
  });
  
  // 병렬 실행
  const results = await Promise.all(
    jobs.map(async (job) => {
      return await Promise.all(
        job.workers.map(async (worker) => {
          worker.status = 'processing';
          try {
            const scene = input.scenes.find(s => s.id === worker.sceneId);
            if (!scene) throw new Error('Scene not found');
            
            const commands = sceneToFFmpegCommands(scene, []);
            // FFmpeg 실행 (실제 구현 필요)
            await executeFFmpegCommands(commands);
            
            worker.status = 'completed';
            worker.progress = 100;
          } catch (error) {
            worker.status = 'failed';
            throw error;
          }
        })
      );
    })
  );
  
  // 결과 합성
  const finalOutput = await combineResults(results);
  
  return finalOutput;
}

/**
 * ============================================
 * 렌더 실패 시 재시도 전략
 * ============================================
 */

export interface RetryStrategy {
  maxRetries: number;
  retryDelay: number;
  exponentialBackoff: boolean;
  retryableErrors: string[];
}

export const defaultRetryStrategy: RetryStrategy = {
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  retryableErrors: [
    'Network error',
    'Temporary failure',
    'Resource unavailable',
  ],
};

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  strategy: RetryStrategy = defaultRetryStrategy
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= strategy.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < strategy.maxRetries) {
        const isRetryable = strategy.retryableErrors.some(e => 
          error.message?.includes(e)
        );
        
        if (!isRetryable) {
          throw error;
        }
        
        const delay = strategy.exponentialBackoff
          ? strategy.retryDelay * Math.pow(2, attempt)
          : strategy.retryDelay;
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// 헬퍼 함수들 (실제 구현 필요)
async function executeFFmpegCommands(commands: string[]): Promise<void> {
  // FFmpeg 실행 로직
  throw new Error('Not implemented');
}

async function combineResults(results: any[]): Promise<RenderOutput> {
  // 결과 합성 로직
  throw new Error('Not implemented');
}
