/**
 * STEP 4: 콘텐츠 스튜디오 와이어프레임
 * 텍스트 기반 와이어프레임 정의
 */

/**
 * ============================================
 * 1. 전체 화면 구조
 * ============================================
 */

/**
 * 화면 1: 프로젝트 대시보드
 */
export const DashboardWireframe = {
  layout: {
    header: {
      component: 'Header',
      elements: [
        { type: 'logo', position: 'left' },
        { type: 'navigation', position: 'center' },
        { type: 'user-menu', position: 'right' },
      ],
    },
    main: {
      component: 'Dashboard',
      sections: [
        {
          id: 'quick-actions',
          type: 'button-group',
          elements: [
            { id: 'create-shortform', label: '숏폼 만들기', action: '/create?type=shortform' },
            { id: 'create-video', label: '영상 만들기', action: '/create?type=video' },
            { id: 'create-character', label: '캐릭터 만들기', action: '/characters/create' },
          ],
        },
        {
          id: 'recent-projects',
          type: 'grid',
          columns: 4,
          elements: [
            {
              type: 'project-card',
              fields: ['thumbnail', 'name', 'updatedAt', 'duration'],
              actions: ['open', 'duplicate', 'delete'],
            },
          ],
        },
        {
          id: 'statistics',
          type: 'metrics',
          elements: [
            { id: 'total-projects', label: '전체 프로젝트', value: 'number' },
            { id: 'total-characters', label: '캐릭터', value: 'number' },
            { id: 'total-scenes', label: '장면', value: 'number' },
          ],
        },
      ],
    },
  },
};

/**
 * 화면 2: 캐릭터 생성 화면
 */
export const CharacterCreatorWireframe = {
  layout: {
    header: {
      component: 'Header',
      elements: [
        { type: 'back-button', position: 'left' },
        { type: 'title', text: '캐릭터 제작', position: 'center' },
        { type: 'save-button', position: 'right' },
      ],
    },
    main: {
      component: 'CharacterCreator',
      layout: 'three-column',
      columns: [
        {
          id: 'left-panel',
          width: '300px',
          component: 'CharacterEditor',
          tabs: [
            {
              id: 'appearance',
              label: '외형',
              sections: [
                { id: 'face', type: 'form', fields: ['shape', 'skinColor', 'eyeColor'] },
                { id: 'hair', type: 'form', fields: ['style', 'color', 'length'] },
                { id: 'body', type: 'form', fields: ['type', 'height'] },
                { id: 'clothes', type: 'form', fields: ['top', 'bottom', 'shoes'] },
              ],
            },
            {
              id: 'voice',
              label: '음성',
              sections: [
                { id: 'voice-settings', type: 'form', fields: ['type', 'age', 'tone', 'speed', 'pitch'] },
                { id: 'preview', type: 'audio-player', action: 'test-voice' },
              ],
            },
            {
              id: 'expressions',
              label: '표정',
              sections: [
                { id: 'expression-list', type: 'list', items: 'expressions', actions: ['add', 'edit', 'delete'] },
                { id: 'expression-editor', type: 'form', fields: ['name', 'emotionState', 'blendshapes'] },
              ],
            },
            {
              id: 'gestures',
              label: '제스처',
              sections: [
                { id: 'gesture-list', type: 'list', items: 'gestures', actions: ['add', 'edit', 'delete'] },
                { id: 'gesture-editor', type: 'form', fields: ['name', 'type', 'loop', 'duration'] },
              ],
            },
          ],
        },
        {
          id: 'center-panel',
          width: 'flex',
          component: 'Viewport3D',
          elements: [
            { type: 'character-preview', position: 'center' },
            { type: 'camera-controls', position: 'top-right' },
            { type: 'lighting-controls', position: 'top-left' },
          ],
        },
        {
          id: 'right-panel',
          width: '400px',
          component: 'AIAssistant',
          sections: [
            { id: 'ai-suggestions', type: 'suggestion-list', trigger: 'on-change' },
            { id: 'ai-generate', type: 'prompt-input', action: 'generate-character' },
          ],
        },
      ],
    },
  },
};

/**
 * 화면 3: Scene 편집기
 */
export const SceneEditorWireframe = {
  layout: {
    header: {
      component: 'Toolbar',
      sections: [
        {
          id: 'left-toolbar',
          elements: ['undo', 'redo', 'save'],
        },
        {
          id: 'center-toolbar',
          elements: ['play', 'pause', 'stop', 'time-display'],
        },
        {
          id: 'right-toolbar',
          elements: ['preview', 'render', 'export'],
        },
      ],
    },
    main: {
      component: 'SceneEditor',
      layout: 'four-panel',
      panels: [
        {
          id: 'left-sidebar',
          width: '250px',
          component: 'SceneList',
          tabs: [
            { id: 'scenes', label: '장면', type: 'list', actions: ['add', 'duplicate', 'delete', 'reorder'] },
            { id: 'characters', label: '캐릭터', type: 'list', actions: ['add', 'edit', 'delete'] },
            { id: 'assets', label: '에셋', type: 'grid', categories: ['images', 'videos', 'audio', '3d-models'] },
          ],
        },
        {
          id: 'center-canvas',
          width: 'flex',
          component: 'Canvas3D',
          elements: [
            { type: 'viewport', position: 'center' },
            { type: 'grid', position: 'background' },
            { type: 'camera-gizmo', position: 'top-right' },
            { type: 'transform-gizmo', position: 'center', condition: 'on-selection' },
          ],
        },
        {
          id: 'right-sidebar',
          width: '350px',
          component: 'PropertiesPanel',
          tabs: [
            {
              id: 'properties',
              label: '속성',
              sections: [
                { id: 'scene-properties', type: 'form', condition: 'scene-selected', fields: ['name', 'duration', 'background', 'camera', 'lighting'] },
                { id: 'character-properties', type: 'form', condition: 'character-selected', fields: ['position', 'rotation', 'scale', 'visible'] },
                { id: 'dialogue-properties', type: 'form', condition: 'dialogue-selected', fields: ['text', 'emotion', 'expression', 'timing'] },
              ],
            },
            {
              id: 'animation',
              label: '애니메이션',
              sections: [
                { id: 'timeline-mini', type: 'timeline', tracks: ['expression', 'motion', 'camera'] },
                { id: 'keyframe-editor', type: 'keyframe-list', actions: ['add', 'edit', 'delete'] },
              ],
            },
            {
              id: 'ai-assistant',
              label: 'AI 도우미',
              sections: [
                { id: 'suggestions', type: 'suggestion-list', trigger: 'on-selection' },
                { id: 'auto-generate', type: 'prompt-input', action: 'generate-scene' },
              ],
            },
          ],
        },
        {
          id: 'bottom-timeline',
          height: '200px',
          component: 'Timeline',
          elements: [
            { type: 'playhead', position: 'center' },
            { type: 'tracks', tracks: ['scene', 'character', 'dialogue', 'audio', 'effects'] },
            { type: 'zoom-controls', position: 'bottom-right' },
            { type: 'time-ruler', position: 'top' },
          ],
        },
      ],
    },
  },
};

/**
 * 화면 4: 타임라인
 */
export const TimelineWireframe = {
  layout: {
    header: {
      component: 'Toolbar',
      elements: ['play', 'pause', 'stop', 'loop', 'time-display', 'zoom-in', 'zoom-out'],
    },
    main: {
      component: 'Timeline',
      sections: [
        {
          id: 'track-list',
          width: '200px',
          type: 'list',
          tracks: [
            { id: 'scene-track', label: '장면', type: 'scene', color: 'blue' },
            { id: 'character-track', label: '캐릭터', type: 'character', color: 'green' },
            { id: 'dialogue-track', label: '대화', type: 'dialogue', color: 'purple' },
            { id: 'audio-track', label: '음악', type: 'audio', color: 'orange' },
            { id: 'effects-track', label: '효과', type: 'effects', color: 'red' },
          ],
        },
        {
          id: 'timeline-canvas',
          width: 'flex',
          type: 'canvas',
          elements: [
            { type: 'time-ruler', position: 'top' },
            { type: 'playhead', position: 'center', draggable: true },
            { type: 'clips', position: 'tracks', draggable: true, resizable: true },
            { type: 'snap-guides', position: 'background' },
          ],
        },
      ],
    },
  },
};

/**
 * 화면 5: AI 도우미 패널
 */
export const AIAssistantWireframe = {
  layout: {
    component: 'AIAssistantPanel',
    position: 'right-sidebar',
    width: '400px',
    collapsible: true,
    tabs: [
      {
        id: 'suggestions',
        label: '제안',
        sections: [
          { id: 'suggestion-list', type: 'list', items: 'suggestions', actions: ['apply', 'dismiss'] },
          { id: 'suggestion-filter', type: 'filter', options: ['improvement', 'fix', 'enhancement'] },
        ],
      },
      {
        id: 'auto-generate',
        label: '자동 생성',
        sections: [
          { id: 'prompt-input', type: 'textarea', placeholder: '생성할 내용을 입력하세요' },
          { id: 'generate-options', type: 'form', fields: ['type', 'style', 'duration'] },
          { id: 'generate-button', type: 'button', action: 'generate' },
        ],
      },
      {
        id: 'analyze',
        label: '분석',
        sections: [
          { id: 'analyze-button', type: 'button', action: 'analyze-current' },
          { id: 'analysis-result', type: 'report', fields: ['quality', 'timing', 'emotion', 'suggestions'] },
        ],
      },
    ],
  },
};

/**
 * 화면 6: 미리보기 화면
 */
export const PreviewWireframe = {
  layout: {
    header: {
      component: 'Toolbar',
      elements: ['play', 'pause', 'stop', 'fullscreen', 'quality-selector'],
    },
    main: {
      component: 'Preview',
      sections: [
        {
          id: 'preview-viewport',
          width: 'flex',
          type: 'video-player',
          elements: [
            { type: 'video-canvas', position: 'center' },
            { type: 'controls-overlay', position: 'bottom' },
            { type: 'progress-bar', position: 'bottom' },
          ],
        },
        {
          id: 'preview-controls',
          width: '300px',
          type: 'control-panel',
          sections: [
            { id: 'playback-controls', type: 'button-group', elements: ['play', 'pause', 'stop', 'loop'] },
            { id: 'quality-settings', type: 'form', fields: ['resolution', 'fps', 'quality'] },
            { id: 'export-options', type: 'form', fields: ['format', 'quality', 'resolution'] },
          ],
        },
      ],
    },
  },
};

/**
 * 화면 7: 렌더링 화면
 */
export const RenderWireframe = {
  layout: {
    header: {
      component: 'Header',
      elements: [
        { type: 'back-button', position: 'left' },
        { type: 'title', text: '렌더링', position: 'center' },
      ],
    },
    main: {
      component: 'Render',
      sections: [
        {
          id: 'render-settings',
          type: 'form',
          fields: [
            { id: 'resolution', type: 'select', options: ['1920x1080', '1080x1920', '1080x1080'] },
            { id: 'fps', type: 'number', default: 30 },
            { id: 'quality', type: 'select', options: ['low', 'medium', 'high', 'ultra'] },
            { id: 'format', type: 'select', options: ['mp4', 'webm'] },
          ],
        },
        {
          id: 'render-progress',
          type: 'progress',
          elements: [
            { type: 'progress-bar', position: 'center' },
            { type: 'progress-text', position: 'center' },
            { type: 'estimated-time', position: 'center' },
          ],
        },
        {
          id: 'render-queue',
          type: 'list',
          elements: [
            { type: 'queue-item', fields: ['name', 'status', 'progress', 'actions'] },
          ],
        },
      ],
    },
  },
};

/**
 * ============================================
 * 2. 화면별 주요 UI 요소
 * ============================================
 */

export const UIElements = {
  dashboard: {
    projectCard: {
      thumbnail: 'image',
      name: 'text',
      updatedAt: 'datetime',
      duration: 'time',
      actions: ['open', 'duplicate', 'delete'],
    },
    quickActionButton: {
      icon: 'icon',
      label: 'text',
      action: 'navigation',
    },
  },
  characterCreator: {
    viewport3D: {
      canvas: 'webgl-canvas',
      cameraControls: 'orbit-controls',
      lightingControls: 'light-gizmo',
      characterPreview: '3d-model',
    },
    expressionEditor: {
      blendshapeSlider: 'slider',
      preview: 'live-preview',
      intensity: 'slider',
    },
  },
  sceneEditor: {
    canvas3D: {
      viewport: 'webgl-canvas',
      grid: 'grid-helper',
      cameraGizmo: 'camera-gizmo',
      transformGizmo: 'transform-gizmo',
      selection: 'selection-outline',
    },
    propertiesPanel: {
      formField: 'input',
      colorPicker: 'color-picker',
      vector3Input: 'vector-input',
      timeline: 'mini-timeline',
    },
  },
  timeline: {
    track: {
      label: 'text',
      clips: 'clip-array',
      resizable: true,
      draggable: true,
    },
    clip: {
      content: 'preview',
      start: 'time',
      duration: 'time',
      resizable: true,
      draggable: true,
    },
  },
  preview: {
    videoPlayer: {
      canvas: 'video-canvas',
      controls: 'video-controls',
      progressBar: 'progress-bar',
    },
  },
};

/**
 * ============================================
 * 3. 사용자 플로우
 * ============================================
 */

export const UserFlows = {
  shortformCreation: {
    steps: [
      {
        step: 1,
        screen: 'dashboard',
        action: 'click-create-shortform',
        next: 'create',
      },
      {
        step: 2,
        screen: 'create',
        action: 'enter-prompt',
        fields: ['prompt', 'duration', 'style'],
        next: 'generating',
      },
      {
        step: 3,
        screen: 'generating',
        action: 'wait-for-ai',
        progress: 'step-by-step',
        next: 'preview',
      },
      {
        step: 4,
        screen: 'preview',
        action: 'review-content',
        options: ['edit', 'render', 'save'],
        next: 'editor-or-render',
      },
    ],
  },
  characterCreation: {
    steps: [
      {
        step: 1,
        screen: 'dashboard',
        action: 'click-create-character',
        next: 'character-creator',
      },
      {
        step: 2,
        screen: 'character-creator',
        action: 'edit-appearance',
        tabs: ['appearance', 'voice', 'expressions', 'gestures'],
        next: 'preview',
      },
      {
        step: 3,
        screen: 'character-creator',
        action: 'preview-in-viewport',
        next: 'save',
      },
      {
        step: 4,
        screen: 'character-creator',
        action: 'save-character',
        next: 'complete',
      },
    ],
  },
  sceneEditing: {
    steps: [
      {
        step: 1,
        screen: 'dashboard',
        action: 'open-project',
        next: 'scene-editor',
      },
      {
        step: 2,
        screen: 'scene-editor',
        action: 'select-scene',
        next: 'edit-scene',
      },
      {
        step: 3,
        screen: 'scene-editor',
        action: 'edit-properties',
        panels: ['left-sidebar', 'center-canvas', 'right-sidebar'],
        next: 'preview',
      },
      {
        step: 4,
        screen: 'scene-editor',
        action: 'preview-scene',
        next: 'timeline',
      },
      {
        step: 5,
        screen: 'timeline',
        action: 'edit-timing',
        next: 'render',
      },
    ],
  },
};

/**
 * ============================================
 * 4. AI 도우미 개입 위치
 * ============================================
 */

export const AIAssistantInterventions = {
  characterCreator: {
    location: 'right-panel',
    triggers: [
      { event: 'appearance-change', action: 'suggest-improvements' },
      { event: 'expression-edit', action: 'suggest-blendshapes' },
      { event: 'voice-test', action: 'suggest-voice-settings' },
    ],
    suggestions: {
      type: 'inline',
      position: 'contextual',
      actions: ['apply', 'dismiss', 'learn-more'],
    },
  },
  sceneEditor: {
    location: 'right-sidebar-tab',
    triggers: [
      { event: 'scene-select', action: 'analyze-scene' },
      { event: 'dialogue-edit', action: 'suggest-emotion' },
      { event: 'camera-change', action: 'suggest-angle' },
    ],
    suggestions: {
      type: 'panel',
      position: 'right-sidebar',
      actions: ['apply', 'dismiss', 'regenerate'],
    },
  },
  timeline: {
    location: 'floating-button',
    triggers: [
      { event: 'timing-issue', action: 'suggest-timing' },
      { event: 'transition-add', action: 'suggest-transition' },
    ],
    suggestions: {
      type: 'popup',
      position: 'contextual',
      actions: ['apply', 'dismiss'],
    },
  },
  autoGeneration: {
    location: 'ai-assistant-tab',
    triggers: [
      { event: 'user-prompt', action: 'generate-content' },
      { event: 'button-click', action: 'generate-scene' },
    ],
    flow: {
      input: 'prompt-textarea',
      processing: 'progress-indicator',
      output: 'generated-content-preview',
      actions: ['apply', 'regenerate', 'dismiss'],
    },
  },
};

/**
 * ============================================
 * 5. 모바일 대응 전략
 * ============================================
 */

export const MobileStrategy = {
  layout: {
    desktop: {
      breakpoint: '1024px',
      layout: 'full',
      features: 'all',
    },
    tablet: {
      breakpoint: '768px',
      layout: 'adaptive',
      features: {
        sidebars: 'collapsible',
        timeline: 'compact',
        viewport: 'medium',
      },
    },
    mobile: {
      breakpoint: '768px',
      layout: 'simplified',
      features: {
        sidebars: 'drawer',
        timeline: 'minimal',
        viewport: 'small',
        '3d-editing': 'limited',
      },
    },
  },
  simplifiedScreens: {
    characterCreator: {
      layout: 'single-column',
      tabs: 'bottom-navigation',
      viewport: 'fullscreen',
      aiPanel: 'modal',
    },
    sceneEditor: {
      layout: 'single-view',
      panels: 'tab-navigation',
      canvas: 'fullscreen',
      properties: 'modal',
    },
  },
  touchGestures: {
    viewport: {
      'pinch-zoom': 'zoom',
      'pan': 'move-camera',
      'rotate': 'rotate-camera',
      'long-press': 'context-menu',
    },
    timeline: {
      'swipe': 'navigate',
      'pinch-zoom': 'zoom-timeline',
      'tap': 'select-clip',
    },
  },
  cloudRendering: {
    enabled: true,
    reason: '모바일 성능 제한',
    flow: {
      action: 'queue-render',
      notification: 'render-complete',
      download: 'download-video',
    },
  },
};
