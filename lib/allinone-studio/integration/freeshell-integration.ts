/**
 * STEP 4: freeshell 기준 기능 통합 설계
 * 기존 freeshell 플랫폼에 AI 콘텐츠 스튜디오 통합
 */

/**
 * ============================================
 * 기존 freeshell 기능 vs 신규 기능 매핑
 * ============================================
 */

export const FeatureMapping = {
  // 기존 기능
  existing: {
    'web-app-editor': {
      name: '웹/앱 에디터',
      location: '/editor',
      description: 'HTML/CSS/JS 기반 웹/앱 편집',
    },
    'ai-assistant': {
      name: 'AI 어시스턴트',
      location: '/build',
      description: 'AI 기반 웹/앱 생성',
    },
    'template-gallery': {
      name: '템플릿 갤러리',
      location: '/templates/website',
      description: '웹/앱 템플릿 선택',
    },
    'project-management': {
      name: '프로젝트 관리',
      location: '/projects',
      description: '프로젝트 목록 및 관리',
    },
  },
  
  // 신규 기능
  new: {
    'shortform-studio': {
      name: '숏폼 스튜디오',
      location: '/studio/shortform',
      description: 'AI 기반 숏폼 영상 생성',
      integration: 'standalone',  // 독립 메뉴
    },
    'scene-editor': {
      name: 'Scene 에디터',
      location: '/studio/scene-editor',
      description: 'Scene 기반 영상 편집',
      integration: 'extend-editor',  // 기존 에디터 확장
    },
    'character-creator': {
      name: '캐릭터 생성기',
      location: '/studio/character',
      description: 'AI 기반 캐릭터 생성',
      integration: 'new-feature',  // 신규 기능
    },
    'render-manager': {
      name: '렌더링 관리',
      location: '/studio/render',
      description: '영상 렌더링 작업 관리',
      integration: 'extend-projects',  // 프로젝트 관리 확장
    },
  },
};

/**
 * ============================================
 * 메뉴 통합 구조
 * ============================================
 */

export const MenuIntegration = {
  // 메인 네비게이션
  mainNavigation: [
    {
      label: '홈',
      href: '/',
      icon: 'Home',
    },
    {
      label: '웹/앱 만들기',
      href: '/build',
      icon: 'Code',
      existing: true,
    },
    {
      label: '에디터',
      href: '/editor',
      icon: 'Edit',
      existing: true,
    },
    {
      label: '콘텐츠 스튜디오',  // 신규 메뉴
      href: '/studio',
      icon: 'Film',
      new: true,
      submenu: [
        {
          label: '숏폼 만들기',
          href: '/studio/shortform',
        },
        {
          label: 'Scene 에디터',
          href: '/studio/scene-editor',
        },
        {
          label: '캐릭터 생성',
          href: '/studio/character',
        },
        {
          label: '렌더링 관리',
          href: '/studio/render',
        },
      ],
    },
    {
      label: '템플릿 갤러리',
      href: '/templates/website',
      icon: 'Layout',
      existing: true,
    },
    {
      label: '프로젝트',
      href: '/projects',
      icon: 'Folder',
      existing: true,
    },
  ],
  
  // 사용자 메뉴
  userMenu: [
    {
      label: '대시보드',
      href: '/dashboard',
      existing: true,
    },
    {
      label: '내 프로젝트',
      href: '/projects',
      existing: true,
    },
    {
      label: '내 콘텐츠',  // 신규
      href: '/studio/my-content',
      new: true,
    },
    {
      label: '설정',
      href: '/mypage',
      existing: true,
    },
  ],
};

/**
 * ============================================
 * 사용자 흐름 변화
 * ============================================
 */

export const UserFlowChanges = {
  // 기존 흐름 (변경 없음)
  existing: {
    'web-app-creation': {
      steps: [
        '홈 → 웹/앱 만들기',
        '프롬프트 입력',
        '템플릿 선택',
        '에디터에서 편집',
        '다운로드',
      ],
      unchanged: true,
    },
  },
  
  // 신규 흐름
  new: {
    'shortform-creation': {
      steps: [
        '홈 → 콘텐츠 스튜디오 → 숏폼 만들기',
        '프롬프트 입력',
        '스타일 선택',
        '생성 시작 (자동)',
        '완성된 영상 다운로드',
      ],
      integration: 'seamless',  // 기존 흐름과 자연스럽게 통합
    },
    'scene-editing': {
      steps: [
        '프로젝트 → 콘텐츠 스튜디오 → Scene 에디터',
        '기존 Scene 로드 또는 새로 생성',
        'Scene 편집',
        '렌더링',
        '다운로드',
      ],
      integration: 'extend-projects',  // 프로젝트 관리 확장
    },
  },
  
  // 통합 흐름
  integrated: {
    'web-to-video': {
      steps: [
        '웹/앱 만들기로 웹사이트 생성',
        '콘텐츠 스튜디오에서 웹사이트를 영상으로 변환',
        'Scene 에디터에서 편집',
        '렌더링 및 다운로드',
      ],
      crossFeature: true,  // 기능 간 연동
    },
  },
};

/**
 * ============================================
 * 점진적 기능 공개 전략
 * ============================================
 */

export const GradualRolloutStrategy = {
  // Phase 1: 베타 테스트 (1주)
  phase1: {
    duration: '1주',
    users: '10%',
    features: [
      'shortform-studio',
    ],
    feedback: '수집 및 개선',
  },
  
  // Phase 2: 제한적 공개 (2주)
  phase2: {
    duration: '2주',
    users: '50%',
    features: [
      'shortform-studio',
      'scene-editor',
    ],
    feedback: '수집 및 개선',
  },
  
  // Phase 3: 전체 공개 (4주)
  phase3: {
    duration: '4주',
    users: '100%',
    features: [
      'shortform-studio',
      'scene-editor',
      'character-creator',
      'render-manager',
    ],
    feedback: '지속적 개선',
  },
};

/**
 * ============================================
 * 기존 사용자 이탈 방지 전략
 * ============================================
 */

export const UserRetentionStrategy = {
  // 기존 기능 유지
  maintainExisting: {
    'web-app-editor': {
      status: 'unchanged',
      message: '기존 웹/앱 에디터는 그대로 사용 가능합니다.',
    },
    'ai-assistant': {
      status: 'unchanged',
      message: '기존 AI 어시스턴트는 그대로 사용 가능합니다.',
    },
    'template-gallery': {
      status: 'enhanced',
      message: '템플릿 갤러리에 영상 템플릿이 추가되었습니다.',
    },
  },
  
  // 신규 기능 소개
  introduceNew: {
    method: 'non-intrusive',
    timing: 'after-existing-feature-use',
    message: '새로운 콘텐츠 스튜디오 기능을 사용해보세요!',
    cta: '체험하기',
  },
  
  // 마이그레이션 지원
  migration: {
    'web-to-video': {
      enabled: true,
      description: '기존 웹/앱 프로젝트를 영상으로 변환 가능',
      guide: '/help/web-to-video',
    },
  },
  
  // 사용자 교육
  education: {
    'tutorial': {
      location: '/help/studio-tutorial',
      duration: '5분',
      interactive: true,
    },
    'faq': {
      location: '/help/studio-faq',
      updated: true,
    },
  },
};

/**
 * ============================================
 * 기술적 통합 포인트
 * ============================================
 */

export const TechnicalIntegration = {
  // 공통 컴포넌트 재사용
  sharedComponents: {
    'navbar': 'EnhancedNavbar',
    'auth': 'AuthRequired',
    'project-list': 'ProjectList',
    'editor-layout': 'EditorLayout',
  },
  
  // 공통 API 재사용
  sharedAPIs: {
    'auth': '/api/auth',
    'projects': '/api/projects',
    'ai': '/api/ai',
  },
  
  // 신규 API
  newAPIs: {
    'shortform': '/api/studio/shortform',
    'scene': '/api/studio/scene',
    'character': '/api/studio/character',
    'render': '/api/studio/render',
  },
  
  // 데이터 구조 통합
  dataIntegration: {
    'projects': {
      types: ['web-app', 'shortform', 'scene'] as const,
      unified: true,
    },
    'templates': {
      types: ['website', 'shortform'] as const,
      unified: true,
    },
  },
};

/**
 * ============================================
 * UI/UX 통합 원칙
 * ============================================
 */

export const UIIntegrationPrinciples = {
  // 일관된 디자인
  designConsistency: {
    'color-scheme': '기존 freeshell 색상 유지',
    'typography': '기존 폰트 유지',
    'spacing': '기존 간격 규칙 유지',
    'components': '기존 컴포넌트 재사용',
  },
  
  // 자연스러운 전환
  naturalTransition: {
    'menu-integration': '기존 메뉴 구조 유지, 신규 메뉴 추가',
    'page-transition': '기존 페이지 전환 애니메이션 유지',
    'loading-states': '기존 로딩 상태 스타일 유지',
  },
  
  // 사용자 친화적
  userFriendly: {
    'discoverability': '신규 기능을 자연스럽게 발견 가능',
    'learnability': '기존 사용 패턴과 유사',
    'accessibility': '기존 접근성 기준 유지',
  },
};

/**
 * ============================================
 * 통합 체크리스트
 * ============================================
 */

export const IntegrationChecklist = {
  // 개발 단계
  development: [
    '기존 컴포넌트 재사용 확인',
    '신규 API 엔드포인트 추가',
    '메뉴 구조 업데이트',
    '라우팅 설정',
    '인증/권한 통합',
  ],
  
  // 테스트 단계
  testing: [
    '기존 기능 회귀 테스트',
    '신규 기능 테스트',
    '통합 테스트',
    '사용자 시나리오 테스트',
  ],
  
  // 배포 단계
  deployment: [
    '점진적 롤아웃 계획',
    '모니터링 설정',
    '사용자 안내 준비',
    '피드백 수집 체계 구축',
  ],
};
