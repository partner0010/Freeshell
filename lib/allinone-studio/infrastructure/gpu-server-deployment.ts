/**
 * STEP 2: GPU 1대 기준 서버 배치 전략
 * GPU 1대 환경에서 안정적 운영을 위한 배치 전략
 */

/**
 * ============================================
 * 전체 서버 구성도
 * ============================================
 */

export const ServerArchitecture = {
  // GPU 서버 (1대)
  gpuServer: {
    specs: {
      gpu: '24GB VRAM',
      cpu: '8+ cores',
      ram: '32GB+',
      storage: '500GB+ SSD',
    },
    services: [
      'LLM 텍스트 생성 (Ollama)',
      '이미지 생성 (Stable Diffusion)',
      '음성 생성 (TTS)',
    ],
    constraints: {
      maxConcurrentLLM: 2,
      maxConcurrentImageGen: 1,
      maxConcurrentTTS: 3,
    },
  },
  
  // CPU 서버 (1대)
  cpuServer: {
    specs: {
      cpu: '16+ cores',
      ram: '64GB+',
      storage: '1TB+ SSD',
    },
    services: [
      'API 서버 (Next.js)',
      'FFmpeg 렌더링',
      '파일 저장소',
      '작업 큐 관리 (Redis)',
    ],
    constraints: {
      maxConcurrentRender: 2,
      maxConcurrentAPI: 100,
    },
  },
  
  // 네트워크
  network: {
    gpuToCpu: '내부 네트워크 (고속)',
    userToServer: '인터넷',
  },
};

/**
 * ============================================
 * GPU 작업 우선순위 큐 설계
 * ============================================
 */

export interface GPUJob {
  id: string;
  type: 'llm' | 'image' | 'tts';
  priority: 'high' | 'medium' | 'low';
  userId: string;
  estimatedVRAM: number;  // MB
  estimatedTime: number;  // seconds
  createdAt: number;
  retryCount: number;
}

export class GPUPriorityQueue {
  private queues: {
    high: GPUJob[];
    medium: GPUJob[];
    low: GPUJob[];
  } = {
    high: [],
    medium: [],
    low: [],
  };
  
  private running: Map<string, GPUJob> = new Map();
  private maxConcurrent: {
    llm: number;
    image: number;
    tts: number;
  } = {
    llm: 2,
    image: 1,
    tts: 3,
  };
  
  /**
   * 작업 추가
   */
  enqueue(job: GPUJob): void {
    this.queues[job.priority].push(job);
    this.queues[job.priority].sort((a, b) => a.createdAt - b.createdAt);
  }
  
  /**
   * 다음 작업 가져오기
   */
  dequeue(type: GPUJob['type']): GPUJob | null {
    // 실행 중인 작업 수 확인
    const runningCount = Array.from(this.running.values())
      .filter(j => j.type === type).length;
    
    if (runningCount >= this.maxConcurrent[type]) {
      return null;  // 동시 실행 한도 초과
    }
    
    // 우선순위 순서로 작업 가져오기
    for (const priority of ['high', 'medium', 'low'] as const) {
      const job = this.queues[priority].find(j => j.type === type);
      if (job) {
        this.queues[priority] = this.queues[priority].filter(j => j.id !== job.id);
        this.running.set(job.id, job);
        return job;
      }
    }
    
    return null;
  }
  
  /**
   * 작업 완료
   */
  complete(jobId: string): void {
    this.running.delete(jobId);
  }
  
  /**
   * 작업 실패
   */
  fail(jobId: string): void {
    const job = this.running.get(jobId);
    if (job) {
      this.running.delete(jobId);
      if (job.retryCount < 3) {
        job.retryCount++;
        this.enqueue(job);
      }
    }
  }
}

/**
 * ============================================
 * 작업 스케줄링 전략
 * ============================================
 */

export const SchedulingStrategy = {
  // LLM 작업
  llm: {
    priority: 'high',
    maxConcurrent: 2,
    timeout: 60,  // seconds
    retryPolicy: {
      maxRetries: 2,
      backoff: 'exponential',  // 1초, 2초, 4초
    },
  },
  
  // 이미지 생성
  image: {
    priority: 'high',
    maxConcurrent: 1,
    timeout: 120,  // seconds
    retryPolicy: {
      maxRetries: 1,
      backoff: 'fixed',  // 5초
    },
  },
  
  // TTS
  tts: {
    priority: 'medium',
    maxConcurrent: 3,
    timeout: 30,  // seconds
    retryPolicy: {
      maxRetries: 3,
      backoff: 'linear',  // 1초씩 증가
    },
  },
  
  // FFmpeg 렌더링 (CPU 서버)
  render: {
    priority: 'medium',
    maxConcurrent: 2,
    timeout: 300,  // seconds
    retryPolicy: {
      maxRetries: 1,
      backoff: 'fixed',  // 10초
    },
  },
};

/**
 * ============================================
 * 동시 요청 제한 정책
 * ============================================
 */

export const RateLimitingPolicy = {
  // 사용자별 제한
  perUser: {
    free: {
      'llm-requests': {
        limit: 10,  // per hour
        window: 3600,  // seconds
      },
      'image-requests': {
        limit: 5,  // per hour
        window: 3600,
      },
      'render-requests': {
        limit: 3,  // per hour
        window: 3600,
      },
    },
    paid: {
      'llm-requests': {
        limit: 100,  // per hour
        window: 3600,
      },
      'image-requests': {
        limit: 50,  // per hour
        window: 3600,
      },
      'render-requests': {
        limit: 20,  // per hour
        window: 3600,
      },
    },
  },
  
  // 전체 시스템 제한
  global: {
    'max-concurrent-users': 50,
    'max-queue-size': 100,
    'max-wait-time': 600,  // seconds
  },
};

/**
 * ============================================
 * 장애 발생 시 대응 전략
 * ============================================
 */

export const FailureRecoveryStrategy = {
  // GPU 서버 장애
  gpuServerFailure: {
    detection: {
      method: 'health-check',
      interval: 30,  // seconds
      timeout: 10,  // seconds
    },
    response: {
      immediate: [
        '새 작업 큐에 추가 중지',
        '실행 중인 작업 취소',
        '사용자에게 대기 안내',
      ],
      recovery: [
        'GPU 서버 재시작',
        '작업 큐 복구',
        '대기 중인 작업 재시도',
      ],
      fallback: [
        'CPU 기반 LLM 사용 (느림)',
        '이미지 생성 대기',
        'TTS 대기',
      ],
    },
  },
  
  // CPU 서버 장애
  cpuServerFailure: {
    detection: {
      method: 'health-check',
      interval: 30,
      timeout: 10,
    },
    response: {
      immediate: [
        'API 요청 거부',
        '렌더링 작업 중지',
      ],
      recovery: [
        'CPU 서버 재시작',
        '작업 큐 복구',
      ],
    },
  },
  
  // 작업 실패
  jobFailure: {
    retry: {
      maxRetries: 3,
      backoffStrategy: 'exponential',
    },
    fallback: {
      llm: '규칙 기반 응답',
      image: '기본 이미지 사용',
      tts: '기본 음성 사용',
    },
  },
};

/**
 * ============================================
 * 비용 최소화 전략
 * ============================================
 */

export const CostOptimizationStrategy = {
  // GPU 리소스 관리
  gpuResource: {
    'idle-timeout': 300,  // 5분 유휴 시 모델 언로드
    'model-caching': true,  // 자주 사용하는 모델 캐시
    'batch-processing': true,  // 가능한 경우 배치 처리
  },
  
  // CPU 리소스 관리
  cpuResource: {
    'render-optimization': true,  // 렌더링 최적화
    'file-cleanup': true,  // 임시 파일 정리
    'compression': true,  // 파일 압축 저장
  },
  
  // 네트워크 비용
  network: {
    'cdn-usage': false,  // MVP 단계에서는 CDN 미사용
    'compression': true,  // 응답 압축
  },
  
  // 스토리지 비용
  storage: {
    'retention-policy': {
      'user-files': 30,  // 30일 후 삭제
      'temp-files': 1,  // 1일 후 삭제
    },
    'compression': true,  // 파일 압축 저장
  },
};

/**
 * ============================================
 * 모니터링 지표
 * ============================================
 */

export const MonitoringMetrics = {
  gpu: {
    'vram-usage': 'GPU VRAM 사용률',
    'gpu-utilization': 'GPU 사용률',
    'queue-size': '대기 중인 작업 수',
    'average-wait-time': '평균 대기 시간',
  },
  cpu: {
    'cpu-usage': 'CPU 사용률',
    'memory-usage': '메모리 사용률',
    'render-queue-size': '렌더링 대기 작업 수',
  },
  system: {
    'api-success-rate': 'API 성공률',
    'job-success-rate': '작업 성공률',
    'average-response-time': '평균 응답 시간',
  },
};
