/**
 * STEP 4: 콘텐츠 스튜디오 UI 설계
 * 웹 기반 콘텐츠 스튜디오 UX 구조
 */

/**
 * ============================================
 * 1. 전체 메뉴 트리
 * ============================================
 */
export const StudioMenuTree = {
  // 메인 대시보드
  dashboard: {
    path: '/allinone-studio',
    name: '대시보드',
    icon: 'Home',
    children: null,
  },
  
  // 프로젝트 관리
  projects: {
    path: '/allinone-studio/projects',
    name: '프로젝트',
    icon: 'Folder',
    children: {
      list: {
        path: '/allinone-studio/projects',
        name: '프로젝트 목록',
      },
      create: {
        path: '/allinone-studio/projects/create',
        name: '새 프로젝트',
      },
      templates: {
        path: '/allinone-studio/projects/templates',
        name: '템플릿',
      },
    },
  },
  
  // 콘텐츠 생성
  create: {
    path: '/allinone-studio/create',
    name: '콘텐츠 생성',
    icon: 'Sparkles',
    children: {
      shortform: {
        path: '/allinone-studio/create?type=shortform',
        name: '숏폼 제작',
      },
      video: {
        path: '/allinone-studio/create?type=video',
        name: '영상 제작',
      },
      animation: {
        path: '/allinone-studio/create?type=animation',
        name: '애니메이션 제작',
      },
      movie: {
        path: '/allinone-studio/create?type=movie',
        name: '영화 제작',
      },
    },
  },
  
  // 캐릭터 제작
  characters: {
    path: '/allinone-studio/characters',
    name: '캐릭터 제작',
    icon: 'User',
    children: {
      list: {
        path: '/allinone-studio/characters',
        name: '캐릭터 목록',
      },
      create: {
        path: '/allinone-studio/characters/create',
        name: '새 캐릭터',
      },
      library: {
        path: '/allinone-studio/characters/library',
        name: '캐릭터 라이브러리',
      },
    },
  },
  
  // Scene 편집기
  editor: {
    path: '/allinone-studio/editor',
    name: 'Scene 편집기',
    icon: 'Edit',
    children: null,
  },
  
  // 타임라인
  timeline: {
    path: '/allinone-studio/timeline',
    name: '타임라인',
    icon: 'Clock',
    children: null,
  },
  
  // AI 도우미
  aiAssistant: {
    path: '/allinone-studio/ai-assistant',
    name: 'AI 도우미',
    icon: 'Sparkles',
    children: null,
  },
  
  // 미리보기
  preview: {
    path: '/allinone-studio/preview',
    name: '미리보기',
    icon: 'Play',
    children: null,
  },
  
  // 렌더링
  render: {
    path: '/allinone-studio/render',
    name: '렌더링',
    icon: 'Video',
    children: null,
  },
};

/**
 * ============================================
 * 2. 주요 화면 설명
 * ============================================
 */

/**
 * 대시보드 화면
 */
export interface DashboardScreen {
  layout: {
    header: {
      title: string;
      actions: ['new-project', 'import', 'settings'];
    };
    content: {
      recentProjects: {
        title: string;
        items: Array<{
          id: string;
          name: string;
          thumbnail: string;
          updatedAt: number;
        }>;
      };
      quickActions: {
        title: string;
        buttons: ['create-shortform', 'create-video', 'create-character'];
      };
      statistics: {
        title: string;
        metrics: ['total-projects', 'total-characters', 'total-scenes'];
      };
    };
  };
}

/**
 * 프로젝트 편집 화면
 */
export interface ProjectEditorScreen {
  layout: {
    // 상단 툴바
    toolbar: {
      left: ['undo', 'redo', 'save'];
      center: ['play', 'pause', 'stop'];
      right: ['preview', 'render', 'export'];
    };
    
    // 왼쪽 사이드바
    leftSidebar: {
      tabs: ['scenes', 'characters', 'assets'];
      content: {
        scenes: {
          list: Array<{
            id: string;
            name: string;
            thumbnail: string;
            duration: number;
          }>;
          actions: ['add', 'duplicate', 'delete', 'reorder'];
        };
        characters: {
          list: Array<{
            id: string;
            name: string;
            thumbnail: string;
          }>;
          actions: ['add', 'edit', 'delete'];
        };
        assets: {
          categories: ['images', 'videos', 'audio', '3d-models'];
          upload: boolean;
        };
      };
    };
    
    // 중앙 캔버스
    canvas: {
      type: '3d-viewport' | '2d-canvas' | 'video-preview';
      controls: ['zoom', 'pan', 'rotate', 'select'];
      grid: boolean;
      helpers: ['camera', 'lights', 'axes'];
    };
    
    // 오른쪽 속성 패널
    rightSidebar: {
      tabs: ['properties', 'animation', 'ai-assistant'];
      content: {
        properties: {
          selected: 'scene' | 'character' | 'dialogue' | null;
          fields: Array<{
            name: string;
            type: 'text' | 'number' | 'color' | 'select' | 'slider';
            value: any;
          }>;
        };
        animation: {
          timeline: {
            tracks: Array<{
              name: string;
              keyframes: Array<{
                time: number;
                value: any;
              }>;
            }>;
          };
        };
        aiAssistant: {
          suggestions: Array<{
            type: 'improvement' | 'fix' | 'enhancement';
            message: string;
            action: string;
          }>;
        };
      };
    };
    
    // 하단 타임라인
    timeline: {
      tracks: Array<{
        type: 'scene' | 'character' | 'audio' | 'effect';
        name: string;
        clips: Array<{
          id: string;
          start: number;
          duration: number;
          content: any;
        }>;
      }>;
      playhead: number;
      zoom: number;
    };
  };
}

/**
 * 캐릭터 제작 화면
 */
export interface CharacterCreatorScreen {
  layout: {
    // 왼쪽: 캐릭터 편집
    leftPanel: {
      tabs: ['appearance', 'voice', 'expressions', 'motions'];
      content: {
        appearance: {
          categories: ['face', 'hair', 'body', 'clothes'];
          controls: Array<{
            name: string;
            type: 'slider' | 'color' | 'select' | 'text';
            value: any;
          }>;
        };
        voice: {
          gender: 'male' | 'female';
          age: 'child' | 'teen' | 'adult' | 'elder';
          tone: string;
          preview: boolean;
        };
        expressions: {
          list: Array<{
            id: string;
            name: string;
            preview: string;
          }>;
          editor: {
            blendshapes: Array<{
              name: string;
              value: number;
            }>;
          };
        };
        motions: {
          list: Array<{
            id: string;
            name: string;
            type: string;
          }>;
          preview: boolean;
        };
      };
    };
    
    // 중앙: 3D 뷰포트
    viewport: {
      type: '3d-preview';
      camera: {
        angle: 'front' | 'side' | 'back' | 'free';
        zoom: number;
      };
      lighting: {
        type: 'studio' | 'natural' | 'dramatic';
      };
      controls: ['rotate', 'zoom', 'pan'];
    };
    
    // 오른쪽: AI 도우미
    rightPanel: {
      aiSuggestions: Array<{
        type: 'appearance' | 'expression' | 'motion';
        message: string;
        preview: string;
      }>;
      generate: {
        prompt: string;
        button: 'generate-character';
      };
    };
  };
}

/**
 * ============================================
 * 3. 사용자 플로우
 * ============================================
 */

/**
 * 숏폼 제작 플로우
 */
export const ShortformCreationFlow = [
  {
    step: 1,
    name: '프롬프트 입력',
    screen: 'create',
    actions: ['enter-prompt', 'select-style', 'set-duration'],
    next: 'generating',
  },
  {
    step: 2,
    name: 'AI 자동 생성',
    screen: 'generating',
    actions: ['wait-for-ai', 'view-progress'],
    next: 'preview',
  },
  {
    step: 3,
    name: '미리보기 확인',
    screen: 'preview',
    actions: ['play-preview', 'review-scenes', 'check-audio'],
    next: 'edit',
  },
  {
    step: 4,
    name: '편집 (선택사항)',
    screen: 'editor',
    actions: ['edit-dialogue', 'adjust-timing', 'change-expression'],
    next: 'render',
  },
  {
    step: 5,
    name: '렌더링',
    screen: 'render',
    actions: ['start-render', 'wait-for-completion', 'download'],
    next: 'complete',
  },
];

/**
 * 영화 제작 플로우
 */
export const MovieCreationFlow = [
  {
    step: 1,
    name: '스토리 작성',
    screen: 'story-editor',
    actions: ['write-story', 'add-scenes', 'define-characters'],
    next: 'character-creation',
  },
  {
    step: 2,
    name: '캐릭터 제작',
    screen: 'character-creator',
    actions: ['create-characters', 'set-expressions', 'configure-voice'],
    next: 'scene-editing',
  },
  {
    step: 3,
    name: 'Scene 편집',
    screen: 'project-editor',
    actions: ['arrange-scenes', 'add-dialogues', 'set-camera', 'add-music'],
    next: 'timeline',
  },
  {
    step: 4,
    name: '타임라인 편집',
    screen: 'timeline',
    actions: ['sync-audio', 'adjust-transitions', 'fine-tune-timing'],
    next: 'preview',
  },
  {
    step: 5,
    name: '미리보기 & 수정',
    screen: 'preview',
    actions: ['play-full', 'identify-issues', 'return-to-edit'],
    next: 'render',
  },
  {
    step: 6,
    name: '최종 렌더링',
    screen: 'render',
    actions: ['configure-quality', 'start-render', 'monitor-progress'],
    next: 'complete',
  },
];

/**
 * ============================================
 * 4. AI 도우미 위치와 역할
 * ============================================
 */

/**
 * AI 도우미 배치
 */
export const AIAssistantPlacement = {
  // 사이드 패널 (항상 접근 가능)
  sidePanel: {
    position: 'right',
    width: '400px',
    collapsible: true,
    tabs: ['suggestions', 'auto-generate', 'analyze'],
    features: {
      suggestions: {
        trigger: 'on-selection',
        types: ['improvement', 'fix', 'enhancement'],
      },
      autoGenerate: {
        trigger: 'on-prompt',
        types: ['character', 'scene', 'dialogue'],
      },
      analyze: {
        trigger: 'on-request',
        types: ['quality', 'timing', 'emotion'],
      },
    },
  },
  
  // 인라인 제안 (컨텍스트 기반)
  inlineSuggestions: {
    position: 'contextual',
    types: {
      dialogue: {
        location: 'dialogue-editor',
        suggestions: ['emotion', 'expression', 'timing'],
      },
      scene: {
        location: 'scene-editor',
        suggestions: ['camera', 'lighting', 'background'],
      },
      character: {
        location: 'character-editor',
        suggestions: ['appearance', 'expression', 'motion'],
      },
    },
  },
  
  // 플로팅 버튼 (빠른 액세스)
  floatingButton: {
    position: 'bottom-right',
    icon: 'Sparkles',
    actions: ['quick-generate', 'analyze-current', 'suggest-improvements'],
  },
};

/**
 * AI 도우미 역할
 */
export const AIAssistantRoles = {
  // 스토리 작가
  storyWriter: {
    input: 'user-prompt',
    output: 'script-json',
    features: ['generate-story', 'suggest-dialogues', 'improve-narrative'],
  },
  
  // 캐릭터 디자이너
  characterDesigner: {
    input: 'character-description',
    output: 'character-json',
    features: ['generate-appearance', 'suggest-expressions', 'create-variations'],
  },
  
  // 숏폼 제작자
  shortformCreator: {
    input: 'prompt',
    output: 'complete-shortform',
    features: ['auto-generate', 'optimize-timing', 'suggest-edits'],
  },
  
  // 감정 & 대사 분석가
  emotionAnalyst: {
    input: 'dialogue-text',
    output: 'emotion-mapping',
    features: ['detect-emotion', 'suggest-expression', 'optimize-timing'],
  },
  
  // 에디터 도우미
  editorAssistant: {
    input: 'current-state',
    output: 'suggestions',
    features: ['suggest-improvements', 'detect-issues', 'optimize-performance'],
  },
};

/**
 * ============================================
 * 5. 모바일/웹 대응 전략
 * ============================================
 */

/**
 * 반응형 레이아웃
 */
export const ResponsiveLayout = {
  // 데스크톱 (1024px+)
  desktop: {
    layout: 'full',
    features: {
      sidebars: ['left', 'right'],
      timeline: 'full',
      viewport: 'large',
      aiPanel: 'always-visible',
    },
  },
  
  // 태블릿 (768px ~ 1023px)
  tablet: {
    layout: 'adaptive',
    features: {
      sidebars: ['collapsible'],
      timeline: 'compact',
      viewport: 'medium',
      aiPanel: 'toggleable',
    },
  },
  
  // 모바일 (768px 미만)
  mobile: {
    layout: 'simplified',
    features: {
      sidebars: ['drawer'],
      timeline: 'minimal',
      viewport: 'small',
      aiPanel: 'modal',
    },
    limitations: {
      '3d-editing': 'limited',
      'complex-animations': 'view-only',
      'multi-scene': 'simplified',
    },
  },
};

/**
 * 모바일 최적화 기능
 */
export const MobileOptimizations = {
  // 터치 제스처
  gestures: {
    'pinch-zoom': 'viewport-zoom',
    'swipe': 'scene-navigation',
    'long-press': 'context-menu',
  },
  
  // 단순화된 UI
  simplified: {
    'character-creator': 'preset-based',
    'scene-editor': 'template-based',
    'timeline': 'key-moments-only',
  },
  
  // 클라우드 렌더링
  cloudRendering: {
    enabled: true,
    reason: '모바일 성능 제한',
    options: ['queue-render', 'notify-when-ready'],
  },
};
