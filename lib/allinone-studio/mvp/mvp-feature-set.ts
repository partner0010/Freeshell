/**
 * STEP 1: MVP 기준 기능 최소 세트 정의
 * 실제 사용자에게 공개 가능한 MVP 기능 정의
 */

/**
 * ============================================
 * MVP 핵심 기능 목록
 * ============================================
 */

export const MVPFeatures = {
  // ✅ 필수 포함 기능
  required: {
    // Scene 기반 숏폼 생성
    'shortform-generation': {
      id: 'shortform-generation',
      name: '숏폼 자동 생성',
      description: '프롬프트 입력 → Scene JSON → 영상 생성',
      priority: 'critical',
      dependencies: [],
    },
    
    // 캐릭터 생성
    'character-creation': {
      id: 'character-creation',
      name: '캐릭터 생성',
      description: '기본 캐릭터 생성 (2D 이미지 기반)',
      priority: 'critical',
      dependencies: [],
    },
    
    // 음성 + 자막
    'voice-subtitle': {
      id: 'voice-subtitle',
      name: '음성 + 자막',
      description: 'TTS 음성 생성 및 자동 자막 생성',
      priority: 'critical',
      dependencies: ['character-creation'],
    },
    
    // 자동 렌더링
    'auto-rendering': {
      id: 'auto-rendering',
      name: '자동 렌더링',
      description: 'FFmpeg 기반 영상 자동 렌더링',
      priority: 'critical',
      dependencies: ['shortform-generation', 'voice-subtitle'],
    },
    
    // 기본 편집
    'basic-editing': {
      id: 'basic-editing',
      name: '기본 편집',
      description: 'Scene 순서 변경, 대사 수정, 자막 스타일 변경',
      priority: 'high',
      dependencies: ['shortform-generation'],
    },
    
    // 프리뷰
    'preview': {
      id: 'preview',
      name: '프리뷰',
      description: '생성 전 Scene 프리뷰',
      priority: 'high',
      dependencies: ['shortform-generation'],
    },
    
    // 다운로드
    'download': {
      id: 'download',
      name: '다운로드',
      description: '생성된 영상 다운로드',
      priority: 'critical',
      dependencies: ['auto-rendering'],
    },
  },
  
  // ❌ MVP에서 제외할 기능
  excluded: {
    // 영화 제작 모드
    'movie-mode': {
      reason: '복잡도 높음, MVP 범위 초과',
      futurePhase: 'Phase 3',
    },
    
    // 고급 3D 애니메이션
    'advanced-3d': {
      reason: 'GPU 리소스 과다, 기술적 복잡도 높음',
      futurePhase: 'Phase 3',
    },
    
    // 마켓/플러그인
    'marketplace': {
      reason: '커뮤니티 구축 전 단계, 우선순위 낮음',
      futurePhase: 'Phase 2',
    },
    
    // 팀 협업
    'team-collaboration': {
      reason: 'MVP는 개인 사용자 중심',
      futurePhase: 'Phase 2',
    },
    
    // 실시간 협업
    'realtime-collab': {
      reason: '인프라 복잡도 높음',
      futurePhase: 'Phase 3',
    },
    
    // 고급 AI 기능
    'advanced-ai': {
      reason: '기본 AI로 충분, 고급 기능은 Phase 2',
      futurePhase: 'Phase 2',
    },
  },
};

/**
 * ============================================
 * 사용자 핵심 사용 시나리오
 * ============================================
 */

export const MVPUserScenario = {
  scenario: '첫 숏폼 생성',
  
  steps: [
    {
      step: 1,
      action: '사용자 로그인',
      duration: '10초',
      required: true,
    },
    {
      step: 2,
      action: '프롬프트 입력: "고양이가 요리를 하는 숏폼"',
      duration: '30초',
      required: true,
    },
    {
      step: 3,
      action: 'AI 스크립트 생성 (자동)',
      duration: '10-30초',
      required: true,
      systemAction: true,
    },
    {
      step: 4,
      action: 'Scene 프리뷰 확인',
      duration: '20초',
      required: false,
      optional: true,
    },
    {
      step: 5,
      action: '생성 시작 버튼 클릭',
      duration: '5초',
      required: true,
    },
    {
      step: 6,
      action: '렌더링 진행 (자동)',
      duration: '1-3분',
      required: true,
      systemAction: true,
    },
    {
      step: 7,
      action: '완성된 영상 다운로드',
      duration: '10초',
      required: true,
    },
  ],
  
  totalTime: '2-4분',
  successCriteria: '사용자가 다운로드 가능한 mp4 파일을 받음',
};

/**
 * ============================================
 * MVP 성공 기준
 * ============================================
 */

export const MVPSuccessCriteria = {
  // 정량적 기준
  quantitative: {
    // 사용자 측면
    user: {
      'first-video-success-rate': {
        metric: '첫 영상 생성 성공률',
        target: '>= 80%',
        measurement: '첫 시도에서 다운로드 가능한 영상 생성 비율',
      },
      'average-generation-time': {
        metric: '평균 생성 시간',
        target: '<= 3분',
        measurement: '프롬프트 입력부터 다운로드까지',
      },
      'user-retention-day1': {
        metric: '1일 사용자 유지율',
        target: '>= 40%',
        measurement: '첫 사용 후 다음날 재방문 비율',
      },
    },
    
    // 시스템 측면
    system: {
      'api-success-rate': {
        metric: 'API 성공률',
        target: '>= 95%',
        measurement: '모든 API 호출 성공률',
      },
      'render-success-rate': {
        metric: '렌더링 성공률',
        target: '>= 90%',
        measurement: '렌더링 작업 완료 비율',
      },
      'average-response-time': {
        metric: '평균 응답 시간',
        target: '<= 2초',
        measurement: 'API 평균 응답 시간',
      },
    },
  },
  
  // 정성적 기준
  qualitative: {
    'user-satisfaction': {
      metric: '사용자 만족도',
      target: '>= 4.0 / 5.0',
      measurement: '설문조사 평점',
    },
    'video-quality': {
      metric: '영상 품질',
      target: '사용 가능한 수준',
      measurement: '주관적 평가 (자막 가독성, 음성 명확성, 영상 안정성)',
    },
    'ease-of-use': {
      metric: '사용 편의성',
      target: '설명 없이 사용 가능',
      measurement: '튜토리얼 없이 첫 영상 생성 성공',
    },
  },
};

/**
 * ============================================
 * 출시 후 확장 로드맵
 * ============================================
 */

export const ExpansionRoadmap = {
  'Phase 1 (MVP)': {
    duration: '1-2개월',
    features: [
      '숏폼 자동 생성',
      '기본 캐릭터 생성',
      '음성 + 자막',
      '자동 렌더링',
      '기본 편집',
    ],
    goal: '최소 기능으로 첫 사용자 확보',
  },
  
  'Phase 2 (Growth)': {
    duration: '2-3개월',
    features: [
      '템플릿 라이브러리',
      '캐릭터 커스터마이징 확대',
      '음성 옵션 확대',
      '자막 스타일 확대',
      '배경 음악 추가',
      '기본 마켓플레이스 (템플릿 공유)',
    ],
    goal: '사용자 유지율 향상, 기능 다양화',
  },
  
  'Phase 3 (Scale)': {
    duration: '3-6개월',
    features: [
      '영화 제작 모드',
      '3D 캐릭터 지원',
      '고급 애니메이션',
      '플러그인 시스템',
      '팀 협업',
      'API 공개',
    ],
    goal: '고급 사용자 확보, 플랫폼 확장',
  },
};

/**
 * ============================================
 * 지금 만들면 망하는 기능 목록
 * ============================================
 */

export const FeaturesToAvoid = {
  'over-engineering': {
    feature: '과도한 아키텍처',
    reason: 'MVP는 단순함이 생명',
    impact: '개발 시간 증가, 복잡도 증가',
  },
  
  'premature-optimization': {
    feature: '성능 최적화 (너무 이른)',
    reason: '사용자 없이 최적화는 의미 없음',
    impact: '개발 시간 낭비',
  },
  
  'too-many-options': {
    feature: '과도한 옵션 제공',
    reason: '선택의 폭이 넓으면 사용자 혼란',
    impact: '사용자 이탈',
  },
  
  'complex-ui': {
    feature: '복잡한 UI',
    reason: '학습 곡선이 높으면 사용자 이탈',
    impact: '사용자 이탈',
  },
  
  'paid-features-early': {
    feature: '너무 이른 유료화',
    reason: '가치 증명 전 유료화는 사용자 이탈',
    impact: '사용자 이탈',
  },
  
  'social-features': {
    feature: '소셜 기능 (공유, 댓글 등)',
    reason: '핵심 기능 안정화 전 소셜은 불필요',
    impact: '개발 리소스 낭비',
  },
  
  'analytics-overload': {
    feature: '과도한 분석 도구',
    reason: 'MVP 단계에서는 기본 분석만 필요',
    impact: '개발 시간 낭비',
  },
};

/**
 * ============================================
 * MVP 기능 우선순위 매트릭스
 * ============================================
 */

export const FeaturePriorityMatrix = {
  'must-have': [
    'shortform-generation',
    'character-creation',
    'voice-subtitle',
    'auto-rendering',
    'download',
  ],
  
  'should-have': [
    'basic-editing',
    'preview',
  ],
  
  'nice-to-have': [
    'template-library',
    'character-customization',
  ],
  
  'won\'t-have': [
    'movie-mode',
    'advanced-3d',
    'marketplace',
    'team-collaboration',
  ],
};
