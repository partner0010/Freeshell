/**
 * STEP 3: Scene 기반 AI 편집 도우미 프롬프트
 * 에디터 내 AI 도우미 System Prompt
 */

/**
 * ============================================
 * System Prompt 완성본
 * ============================================
 */
export const EDITOR_ASSISTANT_SYSTEM_PROMPT = `당신은 Scene 기반 콘텐츠 에디터의 AI 편집 도우미입니다.

## 핵심 역할
- 사용자가 편집 중인 Scene JSON을 분석합니다
- 수정 가능한 항목만 제안합니다
- 코드를 직접 수정하지 않습니다
- 변경 사항을 JSON Patch 형식으로 제안합니다

## 입력 데이터
- 현재 Scene JSON
- 사용자 요청
- 편집 히스토리 (선택사항)

## 출력 형식
반드시 다음 JSON 형식으로만 응답해야 합니다:

{
  "suggestions": [
    {
      "id": "suggestion-001",
      "type": "improvement" | "fix" | "enhancement" | "optimization",
      "category": "timing" | "emotion" | "camera" | "audio" | "dialogue" | "background",
      "message": "제안 내용 (한국어)",
      "reason": "제안 이유",
      "priority": "high" | "medium" | "low",
      "patch": {
        "op": "replace" | "add" | "remove",
        "path": "/scenes/0/dialogues/0/timing/duration",
        "value": 3.5
      },
      "preview": {
        "description": "변경 후 미리보기 설명",
        "impact": "이 변경이 미치는 영향"
      }
    }
  ],
  "analysis": {
    "overall": "전체 평가",
    "score": 85,
    "issues": [
      {
        "type": "error" | "warning" | "info",
        "message": "문제 설명",
        "location": "/scenes/0/dialogues/0",
        "fix": "해결 방법"
      }
    ]
  }
}

## JSON Patch 규칙
1. **path**: JSON 경로 (예: "/scenes/0/dialogues/0/text")
2. **op**: 작업 타입
   - "replace": 기존 값 변경
   - "add": 새 값 추가
   - "remove": 값 제거
3. **value**: 새 값 (add/replace 시)

## 제안 규칙
1. **수정 가능한 항목만 제안**
   - Scene JSON 구조 내 필드만
   - 사용자가 직접 편집 가능한 항목만
   
2. **구체적이고 실행 가능한 제안**
   - 추상적 조언 금지
   - 명확한 JSON Patch 제공
   
3. **우선순위 명확히 표시**
   - high: 즉시 수정 필요
   - medium: 개선 권장
   - low: 선택적 개선

4. **변경 영향 설명**
   - 미리보기에 미치는 영향
   - 다른 Scene에 미치는 영향

## 금지 사항
- ❌ 코드 작성 금지
- ❌ 전체 Scene 재작성 금지
- ❌ 사용자가 요청하지 않은 대규모 변경 금지
- ❌ JSON Patch 외 형식 금지
- ❌ 추상적 설명만 제공 금지

## Scene JSON 구조 이해
Scene JSON은 다음 구조를 가집니다:
- id, name, duration
- background (type, source, description)
- camera (angle, position, rotation, zoom, motion)
- characters (characterId, position, rotation, scale)
- dialogues (id, speakerId, text, emotion, expression, timing, voice, lipSync)
- music (type, track, volume, loop)
- effects (type, name, position, timing)

이 구조 내에서만 수정을 제안해야 합니다.`;

/**
 * ============================================
 * User Prompt 예시
 * ============================================
 */

export const exampleUserPrompts = {
  timing: {
    prompt: `현재 Scene의 대화 타이밍을 분석하고 개선 제안을 해주세요.

현재 Scene JSON:
{
  "id": "scene-001",
  "duration": 10.0,
  "dialogues": [
    {
      "id": "dialogue-001",
      "text": "안녕하세요! 오늘은 특별한 이야기를 들려드릴게요.",
      "timing": {
        "start": 0.0,
        "duration": 2.0
      }
    }
  ]
}

요청: 대화가 너무 빠르게 들립니다. 자연스러운 타이밍으로 조정해주세요.`,
    
    expectedOutput: {
      suggestions: [
        {
          id: 'suggestion-001',
          type: 'improvement',
          category: 'timing',
          message: '대화 타이밍을 2.0초에서 3.5초로 연장하여 자연스럽게 개선',
          reason: '현재 대화 길이에 비해 타이밍이 짧아 부자연스러움',
          priority: 'high',
          patch: {
            op: 'replace',
            path: '/dialogues/0/timing/duration',
            value: 3.5,
          },
          preview: {
            description: '대화가 더 여유롭게 들리며 자연스러운 흐름',
            impact: 'Scene 전체 duration도 3.5초로 조정 필요',
          },
        },
      ],
    },
  },
  
  emotion: {
    prompt: `현재 대화의 감정과 표정이 일치하는지 확인해주세요.

현재 Dialogue:
{
  "id": "dialogue-001",
  "text": "정말 기뻐요!",
  "emotion": "sad",
  "expression": "expr-sad"
}

요청: 대사 내용과 감정이 맞지 않습니다.`,
    
    expectedOutput: {
      suggestions: [
        {
          id: 'suggestion-002',
          type: 'fix',
          category: 'emotion',
          message: '대사 내용에 맞게 감정을 "happy"로 변경',
          reason: '대사 "정말 기뻐요!"는 긍정적 감정인데 현재 "sad"로 설정됨',
          priority: 'high',
          patch: {
            op: 'replace',
            path: '/dialogues/0/emotion',
            value: 'happy',
          },
          preview: {
            description: '대사와 감정이 일치하여 자연스러운 표현',
            impact: '표정도 "expr-happy"로 자동 변경 권장',
          },
        },
      ],
    },
  },
  
  camera: {
    prompt: `현재 Scene의 카메라 앵글이 대화에 적합한지 확인해주세요.

현재 Scene:
{
  "camera": {
    "angle": "wide",
    "zoom": 0.5
  },
  "dialogues": [
    {
      "text": "중요한 이야기를 들려드릴게요",
      "emotion": "serious"
    }
  ]
}

요청: 중요한 대사인데 카메라가 너무 멀리 있습니다.`,
    
    expectedOutput: {
      suggestions: [
        {
          id: 'suggestion-003',
          type: 'enhancement',
          category: 'camera',
          message: '중요한 대사를 강조하기 위해 클로즈업으로 변경',
          reason: '중요한 대사는 클로즈업으로 감정 표현을 강조하는 것이 효과적',
          priority: 'medium',
          patch: {
            op: 'replace',
            path: '/camera/angle',
            value: 'close-up',
          },
          preview: {
            description: '캐릭터의 표정과 감정이 더 명확하게 보임',
            impact: 'zoom도 1.2로 조정하여 더 가까이',
          },
        },
      ],
    },
  },
};

/**
 * ============================================
 * 출력 포맷 정의
 * ============================================
 */

export interface EditorAssistantOutput {
  suggestions: Array<{
    id: string;
    type: 'improvement' | 'fix' | 'enhancement' | 'optimization';
    category: 'timing' | 'emotion' | 'camera' | 'audio' | 'dialogue' | 'background';
    message: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    patch: {
      op: 'replace' | 'add' | 'remove';
      path: string;
      value?: any;
    };
    preview: {
      description: string;
      impact: string;
    };
  }>;
  analysis: {
    overall: string;
    score: number;
    issues: Array<{
      type: 'error' | 'warning' | 'info';
      message: string;
      location: string;
      fix: string;
    }>;
  };
}

/**
 * ============================================
 * 에디터 연동 방식
 * ============================================
 */

/**
 * 에디터에서 AI 도우미 호출
 */
export async function callEditorAssistant(
  sceneJSON: any,
  userRequest: string,
  history?: any[]
): Promise<EditorAssistantOutput> {
  const systemPrompt = EDITOR_ASSISTANT_SYSTEM_PROMPT;
  
  const userPrompt = `현재 편집 중인 Scene JSON:
${JSON.stringify(sceneJSON, null, 2)}

사용자 요청: ${userRequest}

${history ? `편집 히스토리:\n${JSON.stringify(history, null, 2)}` : ''}

위 Scene JSON을 분석하고, 사용자 요청에 맞는 수정 제안을 JSON Patch 형식으로 제공해주세요.`;

  // AI 호출 (실제 구현 필요)
  const response = await callAI(systemPrompt, userPrompt);
  
  // JSON 파싱 및 검증
  const output = JSON.parse(response) as EditorAssistantOutput;
  
  // 검증
  validateEditorAssistantOutput(output);
  
  return output;
}

/**
 * JSON Patch 적용
 */
export function applyJSONPatch(
  sceneJSON: any,
  patch: EditorAssistantOutput['suggestions'][0]['patch']
): any {
  const pathParts = patch.path.split('/').filter(p => p);
  const target = pathParts.reduce((obj, part, index) => {
    if (index === pathParts.length - 1) {
      // 마지막 경로 - 값 변경
      if (patch.op === 'replace') {
        obj[part] = patch.value;
      } else if (patch.op === 'add') {
        if (Array.isArray(obj)) {
          obj.push(patch.value);
        } else {
          obj[part] = patch.value;
        }
      } else if (patch.op === 'remove') {
        if (Array.isArray(obj)) {
          obj.splice(parseInt(part), 1);
        } else {
          delete obj[part];
        }
      }
    } else {
      // 중간 경로 - 객체 탐색
      if (!obj[part]) {
        obj[part] = isNaN(parseInt(pathParts[index + 1])) ? {} : [];
      }
      return obj[part];
    }
    return obj;
  }, sceneJSON);
  
  return sceneJSON;
}

/**
 * ============================================
 * 잘못된 요청 차단 규칙
 * ============================================
 */

export const BlockedRequestPatterns = [
  '전체 Scene을 다시 만들어줘',
  '코드를 작성해줘',
  '새로운 기능을 추가해줘',
  'Scene 구조를 변경해줘',
  '전체 프로젝트를 재설계해줘',
];

export function isBlockedRequest(request: string): boolean {
  return BlockedRequestPatterns.some(pattern => 
    request.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function validateEditorAssistantOutput(output: EditorAssistantOutput): void {
  // 검증 규칙
  if (!output.suggestions || !Array.isArray(output.suggestions)) {
    throw new Error('Invalid output: suggestions must be an array');
  }
  
  output.suggestions.forEach((suggestion, index) => {
    if (!suggestion.patch || !suggestion.patch.path) {
      throw new Error(`Invalid suggestion ${index}: patch.path is required`);
    }
    
    if (!suggestion.patch.op || !['replace', 'add', 'remove'].includes(suggestion.patch.op)) {
      throw new Error(`Invalid suggestion ${index}: patch.op must be replace, add, or remove`);
    }
    
    if (suggestion.patch.op !== 'remove' && suggestion.patch.value === undefined) {
      throw new Error(`Invalid suggestion ${index}: patch.value is required for ${suggestion.patch.op}`);
    }
  });
}

// 헬퍼 함수 (실제 구현 필요)
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  // AI API 호출
  throw new Error('Not implemented');
}
