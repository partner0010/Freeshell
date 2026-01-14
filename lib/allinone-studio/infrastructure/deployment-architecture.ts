/**
 * STEP 2: GPU 노트북 기준 환경 구축 → 서버 확장 구조
 * 개발(노트북) / 운영(서버) 환경 분리 전략
 */

/**
 * ============================================
 * 전체 배치 아키텍처
 * ============================================
 */

export const DeploymentArchitecture = {
  // 프론트엔드
  frontend: {
    platform: 'Netlify',
    source: 'GitHub',
    domain: 'your-domain.com',
    type: 'static',
    build: 'Next.js static export',
  },
  
  // API 서버
  apiServer: {
    platform: 'VPS / Cloud Server',
    framework: 'FastAPI',
    domain: 'api.your-domain.com',
    type: 'REST API',
    features: [
      'Job Queue 관리',
      '작업 상태 조회',
      '비디오 파일 서빙',
    ],
  },
  
  // GPU 처리 노드
  gpuNode: {
    development: {
      type: 'GPU 노트북',
      location: '로컬',
      connection: '내부 네트워크',
      access: '직접 접근',
    },
    production: {
      type: 'GPU 서버',
      location: '클라우드 / 데이터센터',
      connection: 'API 서버와 통신',
      access: 'API 서버를 통한 접근',
    },
  },
};

/**
 * ============================================
 * 노트북 vs 서버 차이점
 * ============================================
 */

export const EnvironmentComparison = {
  development: {
    // GPU 노트북
    gpu: {
      type: '노트북 GPU',
      vram: '6GB~12GB',
      power: '배터리/전원',
      cooling: '팬 기반',
      stability: '중간',
    },
    network: {
      type: '로컬 네트워크',
      latency: '낮음',
      bandwidth: '높음',
      access: '직접 접근',
    },
    storage: {
      type: '로컬 디스크',
      capacity: '제한적',
      backup: '수동',
    },
    monitoring: {
      type: '기본',
      alert: '수동',
    },
  },
  
  production: {
    // GPU 서버
    gpu: {
      type: '서버 GPU',
      vram: '24GB+',
      power: '전원 공급',
      cooling: '전용 냉각',
      stability: '높음',
    },
    network: {
      type: '인터넷',
      latency: '중간',
      bandwidth: '충분',
      access: 'API 서버를 통한 접근',
    },
    storage: {
      type: '클라우드 스토리지',
      capacity: '확장 가능',
      backup: '자동',
    },
    monitoring: {
      type: '전문',
      alert: '자동',
    },
  },
};

/**
 * ============================================
 * GPU 자원 관리 전략
 * ============================================
 */

export const GPUResourceManagement = {
  development: {
    // 노트북
    maxConcurrent: 1,  // 순차 처리
    vramLimit: 0.8,  // 80% 사용 제한
    temperatureLimit: 80,  // 80도 제한
    idleTimeout: 300,  // 5분 유휴 시 모델 언로드
    powerMode: 'balanced',  // 균형 모드
  },
  
  production: {
    // 서버
    maxConcurrent: 2,  // 동시 처리 가능
    vramLimit: 0.9,  // 90% 사용 가능
    temperatureLimit: 85,  // 85도 제한
    idleTimeout: 600,  // 10분 유휴 시 모델 언로드
    powerMode: 'performance',  // 성능 모드
  },
};

/**
 * ============================================
 * 작업 큐 및 스케줄링 구조
 * ============================================
 */

export const QueueArchitecture = {
  // API 서버
  apiServer: {
    queue: {
      type: 'in-memory',
      storage: 'Redis (선택사항)',
      maxSize: 100,
      priority: true,
    },
    scheduler: {
      type: 'asyncio',
      workers: 1,  // API 서버는 큐만 관리
    },
  },
  
  // GPU 노드
  gpuNode: {
    queue: {
      type: 'local',
      storage: '파일 시스템',
      maxSize: 50,
      priority: true,
    },
    scheduler: {
      type: 'asyncio',
      workers: 1,  // 개발: 1, 운영: 2
    },
  },
};

/**
 * ============================================
 * 도메인 → API → GPU 처리 흐름
 * ============================================
 */

export const RequestFlow = {
  // 1. 사용자 요청
  userRequest: {
    source: '브라우저',
    destination: 'Netlify (프론트엔드)',
    method: 'POST /api/studio/shortform/generate',
  },
  
  // 2. 프론트엔드 → API 서버
  frontendToAPI: {
    source: 'Netlify',
    destination: 'api.your-domain.com',
    method: 'POST /api/v1/generate',
    data: {
      userPrompt: 'string',
      style: 'string',
      duration: 'number',
      userId: 'string',
    },
  },
  
  // 3. API 서버 → Job Queue
  apiToQueue: {
    action: '작업 등록',
    storage: 'Job Manager',
    status: 'pending',
  },
  
  // 4. GPU 노드 작업 처리
  gpuProcessing: {
    source: 'GPU 노드',
    action: '작업 큐에서 가져와 처리',
    steps: [
      '스크립트 생성',
      'Scene 생성',
      '캐릭터 생성',
      '음성 생성',
      '자막 생성',
      '렌더링',
    ],
  },
  
  // 5. 결과 반환
  result: {
    storage: 'API 서버 파일 시스템',
    url: 'api.your-domain.com/api/v1/job/{jobId}/download',
    status: 'completed',
  },
};

/**
 * ============================================
 * 향후 서버 확장 시 변경 포인트
 * ============================================
 */

export const ExpansionPoints = {
  // GPU 노드 추가
  addGPUNodes: {
    change: 'GPU 노드 여러 개 추가',
    impact: [
      '작업 큐 분산',
      '로드 밸런싱',
      '노드 간 통신',
    ],
    codeChange: [
      'GPU_NODE_URLS 환경 변수 추가',
      '로드 밸런서 구현',
      '노드 상태 모니터링',
    ],
  },
  
  // Redis 큐 도입
  addRedisQueue: {
    change: 'Redis 기반 분산 큐',
    impact: [
      '여러 GPU 노드 지원',
      '작업 상태 공유',
      '고가용성',
    ],
    codeChange: [
      'Redis 클라이언트 추가',
      '큐 구현 변경',
      '작업 상태 Redis 저장',
    ],
  },
  
  // 클라우드 스토리지
  addCloudStorage: {
    change: 'S3 / GCS 스토리지',
    impact: [
      '확장 가능한 저장소',
      'CDN 연동',
      '백업 자동화',
    ],
    codeChange: [
      '스토리지 클라이언트 추가',
      '파일 업로드 로직 변경',
      'URL 생성 로직 변경',
    ],
  },
  
  // 모니터링 강화
  addMonitoring: {
    change: 'Prometheus + Grafana',
    impact: [
      '실시간 모니터링',
      '알림 시스템',
      '성능 분석',
    ],
    codeChange: [
      '메트릭 수집 추가',
      '대시보드 구성',
      '알림 규칙 설정',
    ],
  },
};

/**
 * ============================================
 * 환경 변수 기반 분기
 * ============================================
 */

export const EnvironmentVariables = {
  development: {
    ENVIRONMENT: 'development',
    GPU_TYPE: 'laptop',
    MAX_CONCURRENT_JOBS: '1',
    OLLAMA_URL: 'http://localhost:11434',
    STABLE_DIFFUSION_URL: 'http://localhost:7860',
    STORAGE_PATH: '/tmp/shortform',
  },
  
  production: {
    ENVIRONMENT: 'production',
    GPU_TYPE: 'server',
    MAX_CONCURRENT_JOBS: '2',
    OLLAMA_URL: 'http://gpu-node:11434',
    STABLE_DIFFUSION_URL: 'http://gpu-node:7860',
    STORAGE_PATH: '/var/shortform',
  },
};

/**
 * ============================================
 * 보안 고려 사항
 * ============================================
 */

export const SecurityConsiderations = {
  // API 서버
  apiServer: {
    authentication: 'API Key 또는 JWT',
    rateLimiting: '사용자별 제한',
    cors: 'Netlify 도메인만 허용',
    ssl: 'HTTPS 필수',
  },
  
  // GPU 노드
  gpuNode: {
    access: 'API 서버만 접근 가능',
    network: '내부 네트워크 또는 VPN',
    authentication: 'API Key 기반',
  },
  
  // 파일 접근
  fileAccess: {
    storage: 'API 서버를 통한 접근만',
    url: '임시 URL 또는 서명된 URL',
    expiration: '24시간',
  },
};
