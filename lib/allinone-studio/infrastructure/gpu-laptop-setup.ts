/**
 * STEP 3: GPU 노트북 기준 실제 세팅
 * GPU 노트북 환경에서 안정적 운영을 위한 설정
 */

/**
 * ============================================
 * GPU 노트북 한계 분석
 * ============================================
 */

export const GPULaptopLimitations = {
  // VRAM 제약
  vram: {
    '6GB': {
      maxLLMModel: 'llama3.1:8b',  // 양자화 필요
      maxImageGen: '512x512',
      maxConcurrentLLM: 1,
      maxConcurrentImage: 1,
      maxConcurrentTTS: 2,
    },
    '8GB': {
      maxLLMModel: 'llama3.1:8b',
      maxImageGen: '768x768',
      maxConcurrentLLM: 1,
      maxConcurrentImage: 1,
      maxConcurrentTTS: 3,
    },
    '12GB': {
      maxLLMModel: 'llama3.1:8b',
      maxImageGen: '1024x1024',
      maxConcurrentLLM: 2,
      maxConcurrentImage: 1,
      maxConcurrentTTS: 3,
    },
  },
  
  // 전력 제약
  power: {
    'battery': {
      recommendation: 'GPU 사용 최소화',
      maxConcurrentJobs: 1,
      throttleOnLowBattery: true,
    },
    'plugged': {
      recommendation: '정상 사용 가능',
      maxConcurrentJobs: 2,
      throttleOnLowBattery: false,
    },
  },
  
  // 열 관리
  thermal: {
    'normal': {
      maxConcurrentJobs: 2,
      throttleTemperature: 85,  // Celsius
    },
    'throttled': {
      maxConcurrentJobs: 1,
      throttleTemperature: 80,
    },
  },
};

/**
 * ============================================
 * 실행 가능한 AI 모델 선택 기준
 * ============================================
 */

export const ModelSelectionCriteria = {
  // LLM 모델
  llm: {
    'llama3.1:8b-q4': {
      vram: 5,  // GB
      speed: 'fast',
      quality: 'good',
      recommended: true,
    },
    'llama3.1:8b': {
      vram: 8,  // GB
      speed: 'medium',
      quality: 'excellent',
      recommended: false,  // VRAM 부족 가능
    },
    'mistral:7b-q4': {
      vram: 4,  // GB
      speed: 'fast',
      quality: 'good',
      recommended: true,
    },
  },
  
  // 이미지 생성 모델
  image: {
    'stable-diffusion-1.5': {
      vram: 4,  // GB
      resolution: '512x512',
      speed: 'medium',
      recommended: true,
    },
    'stable-diffusion-xl': {
      vram: 8,  // GB
      resolution: '1024x1024',
      speed: 'slow',
      recommended: false,  // VRAM 부족 가능
    },
  },
  
  // TTS 모델
  tts: {
    'edge-tts': {
      vram: 0,  // CPU만 사용
      speed: 'very-fast',
      quality: 'good',
      recommended: true,
    },
    'coqui-tts': {
      vram: 1,  // GB
      speed: 'fast',
      quality: 'excellent',
      recommended: false,  // VRAM 여유 있을 때
    },
  },
};

/**
 * ============================================
 * 작업 큐 및 순차 처리 전략
 * ============================================
 */

export class GPULaptopJobQueue {
  private queue: Array<{
    id: string;
    type: 'llm' | 'image' | 'tts';
    priority: 'high' | 'medium' | 'low';
    job: () => Promise<any>;
  }> = [];
  
  private running: Set<string> = new Set();
  private maxConcurrent: number = 1;  // GPU 노트북은 순차 처리
  
  /**
   * 작업 추가
   */
  enqueue(
    id: string,
    type: 'llm' | 'image' | 'tts',
    priority: 'high' | 'medium' | 'low',
    job: () => Promise<any>
  ): void {
    this.queue.push({ id, type, priority, job });
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // 큐 처리 시작
    this.processQueue();
  }
  
  /**
   * 큐 처리 (순차)
   */
  private async processQueue(): Promise<void> {
    if (this.running.size >= this.maxConcurrent) {
      return;  // 이미 실행 중인 작업이 있음
    }
    
    if (this.queue.length === 0) {
      return;  // 큐가 비어있음
    }
    
    const nextJob = this.queue.shift();
    if (!nextJob) return;
    
    this.running.add(nextJob.id);
    
    try {
      await nextJob.job();
    } catch (error) {
      console.error(`Job ${nextJob.id} failed:`, error);
    } finally {
      this.running.delete(nextJob.id);
      // 다음 작업 처리
      this.processQueue();
    }
  }
  
  /**
   * 실행 중인 작업 수
   */
  getRunningCount(): number {
    return this.running.size;
  }
  
  /**
   * 대기 중인 작업 수
   */
  getQueueSize(): number {
    return this.queue.length;
  }
}

/**
 * ============================================
 * VRAM 관리 전략
 * ============================================
 */

export const VRAMManagementStrategy = {
  // 모델 언로드
  modelUnload: {
    'idle-timeout': 300,  // 5분 유휴 시 언로드
    'max-memory-usage': 0.9,  // 90% 사용 시 언로드
    'priority-based': true,  // 우선순위 기반 언로드
  },
  
  // 모델 로드
  modelLoad: {
    'lazy-loading': true,  // 필요할 때만 로드
    'preload-priority': 'llm',  // LLM 우선 로드
  },
  
  // 메모리 모니터링
  monitoring: {
    'check-interval': 10,  // 10초마다 체크
    'alert-threshold': 0.85,  // 85% 사용 시 경고
    'critical-threshold': 0.95,  // 95% 사용 시 중지
  },
};

/**
 * ============================================
 * 과부하 방지 정책
 * ============================================
 */

export const OverloadPreventionPolicy = {
  // CPU 온도 모니터링
  cpuTemperature: {
    'normal-max': 70,  // Celsius
    'throttle-threshold': 80,
    'shutdown-threshold': 90,
  },
  
  // GPU 온도 모니터링
  gpuTemperature: {
    'normal-max': 75,  // Celsius
    'throttle-threshold': 85,
    'shutdown-threshold': 95,
  },
  
  // 작업 제한
  jobLimits: {
    'max-concurrent': 1,  // 동시 작업 1개만
    'max-queue-size': 10,  // 최대 대기 10개
    'max-daily-jobs': 50,  // 하루 최대 50개
  },
  
  // 자동 조절
  autoThrottle: {
    'enabled': true,
    'reduce-on-high-temp': true,
    'pause-on-critical-temp': true,
    'resume-on-normal-temp': true,
  },
};

/**
 * ============================================
 * MVP 운영 시 권장 설정
 * ============================================
 */

export const MVPRecommendedSettings = {
  // 모델 설정
  models: {
    llm: 'llama3.1:8b-q4',  // 양자화된 모델
    image: 'stable-diffusion-1.5',
    tts: 'edge-tts',  // CPU만 사용
  },
  
  // 작업 설정
  jobs: {
    maxConcurrent: 1,  // 순차 처리
    queueSize: 5,  // 최대 5개 대기
    timeout: 300,  // 5분 타임아웃
  },
  
  // 리소스 설정
  resources: {
    vramLimit: 0.8,  // 80% 사용 제한
    cpuLimit: 0.7,  // 70% 사용 제한
    temperatureLimit: 80,  // 80도 제한
  },
  
  // 사용자 제한
  userLimits: {
    free: {
      maxJobsPerHour: 3,
      maxJobsPerDay: 10,
    },
    paid: {
      maxJobsPerHour: 10,
      maxJobsPerDay: 50,
    },
  },
};

/**
 * ============================================
 * 실제 세팅 스크립트 예시
 * ============================================
 */

export const SetupScripts = {
  // Ollama 설치 및 모델 다운로드
  ollama: `
# Ollama 설치 (Linux/Mac)
curl -fsSL https://ollama.ai/install.sh | sh

# 모델 다운로드 (양자화 버전)
ollama pull llama3.1:8b-q4

# Ollama 서버 시작
ollama serve
  `,
  
  // Stable Diffusion 설치
  stableDiffusion: `
# Stable Diffusion WebUI 설치
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui
cd stable-diffusion-webui
./webui.sh --api --lowvram
  `,
  
  // Edge TTS (설치 불필요, Python 패키지)
  edgeTTS: `
pip install edge-tts
  `,
  
  // 환경 변수 설정
  env: `
# .env 파일
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-q4
STABLE_DIFFUSION_URL=http://localhost:7860
TTS_ENGINE=edge
SHORTFORM_BACKEND_URL=http://localhost:8000
  `,
};
