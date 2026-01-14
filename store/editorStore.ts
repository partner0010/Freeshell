/**
 * AI 협업형 에디터 상태 관리 (Zustand)
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Block {
  id: string;
  type: 'text' | 'image' | 'code' | 'container' | 'custom';
  content: string;
  styles: Record<string, any>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  metadata?: Record<string, any>;
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  blocks: Block[];
  action: string;
}

export interface AISuggestion {
  id: string;
  blockId: string;
  type: 'improvement' | 'bug' | 'optimization' | 'refactoring';
  severity: 'high' | 'medium' | 'low';
  message: string;
  reason: string;
  diff: string;
  diffs?: any[];
  line?: number;
}

export interface AIAnalysis {
  blockId: string;
  overall: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: AISuggestion[];
  suggestions: AISuggestion[];
}

interface EditorState {
  // 블록 관리
  blocks: Block[];
  selectedBlockId: string | null;
  
  // 히스토리 관리
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;
  
  // 미리보기
  previewHtml: string;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  
  // AI 도우미
  aiSuggestions: AISuggestion[];
  aiAnalysis: AIAnalysis | null;
  isAIAnalyzing: boolean;
  aiAnalysisBlockId: string | null;
  
  // 템플릿
  currentTemplate: string | null;
  
  // 액션: 블록 관리
  addBlock: (block: Block) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  moveBlock: (id: string, position: { x: number; y: number }) => void;
  resizeBlock: (id: string, size: { width: number; height: number }) => void;
  
  // 액션: 히스토리
  undo: () => void;
  redo: () => void;
  saveHistory: (action: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // 액션: 미리보기
  updatePreview: () => void;
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  
  // 액션: AI 도우미
  requestAIAnalysis: (blockId: string) => Promise<void>;
  applyAISuggestion: (suggestionId: string) => void;
  dismissAISuggestion: (suggestionId: string) => void;
  clearAISuggestions: () => void;
  
  // 액션: 템플릿
  loadTemplate: (templateId: string) => Promise<void>;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      blocks: [],
      selectedBlockId: null,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      previewHtml: '',
      previewMode: 'desktop',
      aiSuggestions: [],
      aiAnalysis: null,
      isAIAnalyzing: false,
      aiAnalysisBlockId: null,
      currentTemplate: null,

      // 블록 관리
      addBlock: (block) => {
        set((state) => {
          const newBlocks = [...state.blocks, block];
          return { blocks: newBlocks };
        });
        get().saveHistory('블록 추가');
        get().updatePreview();
      },

      updateBlock: (id, updates) => {
        set((state) => ({
          blocks: state.blocks.map((block) =>
            block.id === id ? { ...block, ...updates } : block
          ),
        }));
        get().saveHistory('블록 수정');
        get().updatePreview();
        
        // 블록 수정 시 AI 재분석 (디바운스)
        if (id === get().selectedBlockId) {
          const timeoutId = setTimeout(() => {
            get().requestAIAnalysis(id);
          }, 1000);
          return () => clearTimeout(timeoutId);
        }
      },

      deleteBlock: (id) => {
        set((state) => ({
          blocks: state.blocks.filter((block) => block.id !== id),
          selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
        }));
        get().saveHistory('블록 삭제');
        get().updatePreview();
      },

      duplicateBlock: (id) => {
        const block = get().blocks.find((b) => b.id === id);
        if (block) {
          const newBlock: Block = {
            ...block,
            id: `block-${Date.now()}`,
            position: {
              x: block.position.x + 20,
              y: block.position.y + 20,
            },
          };
          get().addBlock(newBlock);
        }
      },

      selectBlock: (id) => {
        set({ selectedBlockId: id });
        
        // 블록 선택 시 AI 분석 요청
        if (id) {
          get().requestAIAnalysis(id);
        } else {
          set({ aiSuggestions: [], aiAnalysis: null });
        }
      },

      moveBlock: (id, position) => {
        get().updateBlock(id, { position });
      },

      resizeBlock: (id, size) => {
        get().updateBlock(id, { size });
      },

      // 히스토리 관리
      saveHistory: (action) => {
        set((state) => {
          const newEntry: HistoryEntry = {
            id: `history-${Date.now()}`,
            timestamp: Date.now(),
            blocks: JSON.parse(JSON.stringify(state.blocks)), // Deep copy
            action,
          };

          // 현재 인덱스 이후의 히스토리 제거 (새로운 액션)
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(newEntry);

          // 최대 크기 제한
          const trimmedHistory =
            newHistory.length > state.maxHistorySize
              ? newHistory.slice(-state.maxHistorySize)
              : newHistory;

          return {
            history: trimmedHistory,
            historyIndex: trimmedHistory.length - 1,
          };
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const previousEntry = state.history[state.historyIndex - 1];
          set({
            blocks: previousEntry.blocks,
            historyIndex: state.historyIndex - 1,
          });
          get().updatePreview();
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const nextEntry = state.history[state.historyIndex + 1];
          set({
            blocks: nextEntry.blocks,
            historyIndex: state.historyIndex + 1,
          });
          get().updatePreview();
        }
      },

      canUndo: () => {
        return get().historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // 미리보기
      updatePreview: () => {
        const blocks = get().blocks;
        
        // 블록들을 HTML로 변환
        const html = blocks
          .sort((a, b) => {
            // 위치 기반 정렬 (위에서 아래, 왼쪽에서 오른쪽)
            if (a.position.y !== b.position.y) {
              return a.position.y - b.position.y;
            }
            return a.position.x - b.position.x;
          })
          .map((block) => {
            return renderBlockToHTML(block);
          })
          .join('\n');

        const fullHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>미리보기</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    </style>
</head>
<body>
    ${html}
</body>
</html>`;

        set({ previewHtml: fullHtml });
      },

      setPreviewMode: (mode) => {
        set({ previewMode: mode });
      },

      // AI 도우미
      requestAIAnalysis: async (blockId) => {
        const block = get().blocks.find((b) => b.id === blockId);
        if (!block) return;

        set({ isAIAnalyzing: true, aiAnalysisBlockId: blockId });

        try {
          // 블록 코드 추출
          const blockCode = block.type === 'code' 
            ? block.content 
            : renderBlockToHTML(block);

          // AI 분석 요청
          const response = await fetch('/api/ai/role-based', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'editor-assistant',
              userPrompt: '이 코드를 분석하고 개선 제안을 Diff 형식으로 제공해주세요.',
              context: `\`\`\`${block.type === 'code' ? 'javascript' : 'html'}\n${blockCode}\n\`\`\``,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // JSON 파싱
            try {
              const analysis = JSON.parse(data.content);
              
              set({
                aiAnalysis: {
                  blockId,
                  overall: analysis.analysis?.overall || '',
                  score: analysis.analysis?.score || 0,
                  grade: analysis.analysis?.grade || 'C',
                  issues: analysis.issues || [],
                  suggestions: analysis.suggestions || [],
                },
                aiSuggestions: [
                  ...(analysis.issues || []),
                  ...(analysis.suggestions || []),
                ],
              });
            } catch (error) {
              console.error('AI 응답 파싱 오류:', error);
            }
          }
        } catch (error) {
          console.error('AI 분석 오류:', error);
        } finally {
          set({ isAIAnalyzing: false });
        }
      },

      applyAISuggestion: (suggestionId) => {
        const suggestion = get().aiSuggestions.find((s) => s.id === suggestionId);
        if (!suggestion) return;

        const block = get().blocks.find((b) => b.id === suggestion.blockId);
        if (!block) return;

        // Diff 적용
        if (suggestion.diffs && suggestion.diffs.length > 0) {
          try {
            const { applyDiff } = require('@/lib/services/diff-manager');
            const originalCode = block.content;
            const modifiedCode = applyDiff(originalCode, suggestion.diffs);
            
            get().updateBlock(suggestion.blockId, { content: modifiedCode });
          } catch (error) {
            console.error('Diff 적용 오류:', error);
          }
        }

        // 제안 제거
        set((state) => ({
          aiSuggestions: state.aiSuggestions.filter((s) => s.id !== suggestionId),
        }));
      },

      dismissAISuggestion: (suggestionId) => {
        set((state) => ({
          aiSuggestions: state.aiSuggestions.filter((s) => s.id !== suggestionId),
        }));
      },

      clearAISuggestions: () => {
        set({ aiSuggestions: [], aiAnalysis: null });
      },

      // 템플릿
      loadTemplate: async (templateId) => {
        try {
          const response = await fetch(`/api/website-templates?id=${templateId}`);
          if (response.ok) {
            const template = await response.json();
            
            // 템플릿을 블록으로 변환
            const blocks = templateToBlocks(template);
            
            set({
              blocks,
              currentTemplate: templateId,
              selectedBlockId: null,
            });
            
            get().saveHistory('템플릿 로드');
            get().updatePreview();
          }
        } catch (error) {
          console.error('템플릿 로드 오류:', error);
        }
      },

      resetEditor: () => {
        set({
          blocks: [],
          selectedBlockId: null,
          currentTemplate: null,
          aiSuggestions: [],
          aiAnalysis: null,
        });
        get().saveHistory('에디터 초기화');
        get().updatePreview();
      },
    }),
    { name: 'EditorStore' }
  )
);

// 블록을 HTML로 렌더링
function renderBlockToHTML(block: Block): string {
  switch (block.type) {
    case 'text':
      return `<div id="${block.id}" style="${objectToStyle(block.styles)}">${block.content}</div>`;
    case 'image':
      return `<img id="${block.id}" src="${block.content}" style="${objectToStyle(block.styles)}" alt="Image" />`;
    case 'code':
      return `<pre id="${block.id}" style="${objectToStyle(block.styles)}"><code>${escapeHtml(block.content)}</code></pre>`;
    case 'container':
      return `<div id="${block.id}" style="${objectToStyle(block.styles)}">${block.content}</div>`;
    default:
      return `<div id="${block.id}">${block.content}</div>`;
  }
}

function objectToStyle(styles: Record<string, any>): string {
  return Object.entries(styles)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

function escapeHtml(text: string): string {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 간단한 이스케이프
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 템플릿을 블록으로 변환
function templateToBlocks(template: any): Block[] {
  const blocks: Block[] = [];
  
  // 새로운 템플릿 시스템 (JSON 기반)
  if (template.blocks && Array.isArray(template.blocks)) {
    let yOffset = 0;
    
    const convertBlock = (blockData: any, parentX: number = 0, parentY: number = 0): Block => {
      const block: Block = {
        id: blockData.id || `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: blockData.type === 'heading' ? 'text' : 
              blockData.type === 'container' ? 'container' :
              blockData.type === 'card' ? 'container' :
              blockData.type === 'hero' ? 'container' :
              blockData.type === 'navbar' ? 'container' :
              blockData.type === 'footer' ? 'container' :
              blockData.type === 'sidebar' ? 'container' :
              blockData.type === 'list' ? 'text' :
              blockData.type || 'text',
        content: typeof blockData.content === 'string' 
          ? blockData.content 
          : JSON.stringify(blockData.content),
        styles: blockData.style || {},
        position: { 
          x: parentX, 
          y: parentY + yOffset 
        },
        size: { 
          width: blockData.style?.width ? parseInt(blockData.style.width) : 200,
          height: blockData.style?.height ? parseInt(blockData.style.height) : 100,
        },
        metadata: {
          originalType: blockData.type,
          originalContent: blockData.content,
          children: blockData.children,
        },
      };
      
      yOffset += 120; // 다음 블록을 위한 오프셋
      
      return block;
    };
    
    template.blocks.forEach((blockData: any, index: number) => {
      const block = convertBlock(blockData, 0, index * 150);
      blocks.push(block);
    });
  } 
  // 기존 템플릿 시스템 (하위 호환성)
  else if (template.preview?.html) {
    blocks.push({
      id: `block-${Date.now()}`,
      type: 'container',
      content: template.preview.html,
      styles: {},
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
    });
  }
  
  return blocks;
}
