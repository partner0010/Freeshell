# AI 협업형 웹/앱 에디터 시스템 아키텍처

## 🏗️ 전체 시스템 흐름도

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 인터페이스                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 템플릿   │  │ 블록     │  │ 미리보기  │  │ AI 도우미 │  │
│  │ 선택     │  │ 편집기   │  │ 패널     │  │ 패널     │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Editor State Manager (Zustand)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - blocks: Block[]                                    │  │
│  │ - history: HistoryState[]                          │  │
│  │ - selectedBlock: string | null                      │  │
│  │ - previewHtml: string                               │  │
│  │ - aiSuggestions: AISuggestion[]                      │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌───▼──────┐ ┌─────▼──────┐
│ Block        │ │ History  │ │ AI         │
│ Manager      │ │ Manager  │ │ Assistant  │
└──────────────┘ └───────────┘ └────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    AI Service Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - analyzeBlock(block) → AISuggestion[]              │  │
│  │ - suggestImprovement(block) → Diff[]                 │  │
│  │ - explainCode(block) → string                        │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              API: /api/ai/role-based                          │
│              (editor-assistant 역할)                          │
└──────────────────────────────────────────────────────────────┘
```

## 📁 컴포넌트 구조

```
components/
├── CollaborativeEditor/
│   ├── CollaborativeEditor.tsx          # 메인 에디터 컴포넌트
│   ├── TemplateSelector.tsx             # 템플릿 선택
│   ├── BlockEditor.tsx                  # 블록 편집기
│   ├── BlockCanvas.tsx                  # 블록 캔버스 (드래그 앤 드롭)
│   ├── PreviewPanel.tsx                 # 실시간 미리보기
│   ├── AIAssistantPanel.tsx             # AI 도우미 패널
│   ├── HistoryControls.tsx              # 실행 취소/복구
│   └── BlockToolbar.tsx                 # 블록 툴바
│
├── blocks/
│   ├── Block.tsx                        # 블록 기본 컴포넌트
│   ├── TextBlock.tsx                    # 텍스트 블록
│   ├── ImageBlock.tsx                   # 이미지 블록
│   ├── CodeBlock.tsx                    # 코드 블록
│   ├── ContainerBlock.tsx               # 컨테이너 블록
│   └── CustomBlock.tsx                 # 커스텀 블록
│
└── ai/
    ├── AISuggestionCard.tsx             # AI 제안 카드
    ├── DiffViewer.tsx                   # Diff 뷰어
    └── AIAnalysisPanel.tsx              # AI 분석 패널
```

## 🔄 상태 관리 구조 (Zustand)

```typescript
interface EditorState {
  // 블록 관리
  blocks: Block[];
  selectedBlockId: string | null;
  
  // 히스토리 관리
  history: HistoryEntry[];
  historyIndex: number;
  
  // 미리보기
  previewHtml: string;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  
  // AI 도우미
  aiSuggestions: AISuggestion[];
  aiAnalysis: AIAnalysis | null;
  isAIAnalyzing: boolean;
  
  // 액션
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  
  // 히스토리
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  
  // 미리보기
  updatePreview: () => void;
  
  // AI
  requestAIAnalysis: (blockId: string) => Promise<void>;
  applyAISuggestion: (suggestionId: string) => void;
  dismissAISuggestion: (suggestionId: string) => void;
}
```

## 🤖 AI 도우미 호출 흐름

```
사용자 액션
    │
    ├─→ 블록 선택
    │       │
    │       └─→ AI 분석 요청 (자동)
    │               │
    │               ├─→ /api/ai/role-based
    │               │   role: 'editor-assistant'
    │               │   context: 선택된 블록 코드
    │               │
    │               └─→ AISuggestion[] 반환
    │                       │
    │                       └─→ AI 도우미 패널에 표시
    │
    ├─→ 코드 수정
    │       │
    │       └─→ AI 재분석 (디바운스)
    │
    └─→ AI 제안 적용
            │
            └─→ Diff 기반 수정
                    │
                    └─→ 히스토리에 저장
```

## 🎯 핵심 설계 원칙

1. **AI는 제안만 제공**: 코드를 직접 수정하지 않음
2. **사용자 승인 필수**: 모든 변경은 사용자가 승인해야 함
3. **Diff 기반 수정**: 변경 사항을 명확히 보여줌
4. **블록 단위 작업**: 개별 블록에만 AI 적용
5. **실시간 피드백**: 수정 시 즉시 AI 재분석
