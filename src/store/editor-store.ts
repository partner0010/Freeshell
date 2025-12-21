import { create } from 'zustand';
import { Block, Page, Project, GlobalStyles } from '@/types';
import { uuidv4 } from '@/utils/uuid';

interface EditorState {
  // 프로젝트 상태
  project: Project | null;
  currentPageId: string | null;
  
  // 선택 상태
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  
  // UI 상태
  isDragging: boolean;
  isPreviewMode: boolean;
  sidebarTab: 'blocks' | 'styles' | 'ai' | 'pages' | 'theme' | 'collab';
  
  // 히스토리 (Undo/Redo)
  history: Block[][];
  historyIndex: number;
  
  // AI 채팅 기록
  aiMessages: { role: 'user' | 'assistant'; content: string }[];
  isAiLoading: boolean;
  
  // 액션들
  initProject: (name: string) => void;
  setCurrentPage: (pageId: string) => void;
  selectBlock: (blockId: string | null) => void;
  hoverBlock: (blockId: string | null) => void;
  
  // 블록 조작
  addBlock: (block: Block, index?: number) => void;
  updateBlock: (blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (blockId: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  duplicateBlock: (blockId: string) => void;
  
  // 페이지 조작
  addPage: (name: string) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  deletePage: (pageId: string) => void;
  
  // 스타일
  updateGlobalStyles: (styles: Partial<GlobalStyles>) => void;
  
  // UI
  setDragging: (isDragging: boolean) => void;
  setPreviewMode: (isPreview: boolean) => void;
  setSidebarTab: (tab: 'blocks' | 'styles' | 'ai' | 'pages' | 'theme' | 'collab') => void;
  
  // 히스토리
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // AI
  addAiMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  setAiLoading: (loading: boolean) => void;
  
  // 헬퍼
  getCurrentPage: () => Page | null;
  getBlockById: (blockId: string) => Block | null;
}

const defaultGlobalStyles: GlobalStyles = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#D4EDE1',
  fontFamily: 'Pretendard',
  borderRadius: '16px',
};

const createDefaultPage = (): Page => ({
  id: uuidv4(),
  name: '홈',
  slug: 'home',
  blocks: [],
  settings: {
    title: '나의 웹사이트',
    description: 'AI와 함께 만든 웹사이트',
  },
});

export const useEditorStore = create<EditorState>((set, get) => ({
  // 초기 상태
  project: null,
  currentPageId: null,
  selectedBlockId: null,
  hoveredBlockId: null,
  isDragging: false,
  isPreviewMode: false,
  sidebarTab: 'blocks',
  history: [],
  historyIndex: -1,
  aiMessages: [],
  isAiLoading: false,

  // 프로젝트 초기화
  initProject: (name: string) => {
    const defaultPage = createDefaultPage();
    const project: Project = {
      id: uuidv4(),
      name,
      pages: [defaultPage],
      globalStyles: defaultGlobalStyles,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ project, currentPageId: defaultPage.id, history: [], historyIndex: -1 });
  },

  setCurrentPage: (pageId: string) => {
    set({ currentPageId: pageId, selectedBlockId: null });
  },

  selectBlock: (blockId: string | null) => {
    set({ selectedBlockId: blockId });
  },

  hoverBlock: (blockId: string | null) => {
    set({ hoveredBlockId: blockId });
  },

  // 블록 추가
  addBlock: (block: Block, index?: number) => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project) return;

    state.saveToHistory();

    const newBlocks = [...currentPage.blocks];
    if (index !== undefined) {
      newBlocks.splice(index, 0, block);
    } else {
      newBlocks.push(block);
    }

    const updatedPages = state.project.pages.map(page =>
      page.id === currentPage.id ? { ...page, blocks: newBlocks } : page
    );

    set({
      project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
      selectedBlockId: block.id,
    });
  },

  // 블록 업데이트
  updateBlock: (blockId: string, updates: Partial<Block>) => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project) return;

    state.saveToHistory();

    const newBlocks = currentPage.blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    const updatedPages = state.project.pages.map(page =>
      page.id === currentPage.id ? { ...page, blocks: newBlocks } : page
    );

    set({
      project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
    });
  },

  // 블록 삭제
  deleteBlock: (blockId: string) => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project) return;

    state.saveToHistory();

    const newBlocks = currentPage.blocks.filter(block => block.id !== blockId);

    const updatedPages = state.project.pages.map(page =>
      page.id === currentPage.id ? { ...page, blocks: newBlocks } : page
    );

    set({
      project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
      selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId,
    });
  },

  // 블록 이동
  moveBlock: (fromIndex: number, toIndex: number) => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project) return;

    state.saveToHistory();

    const newBlocks = [...currentPage.blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);

    const updatedPages = state.project.pages.map(page =>
      page.id === currentPage.id ? { ...page, blocks: newBlocks } : page
    );

    set({
      project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
    });
  },

  // 블록 복제
  duplicateBlock: (blockId: string) => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project) return;

    const blockIndex = currentPage.blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const originalBlock = currentPage.blocks[blockIndex];
    const duplicatedBlock: Block = {
      ...JSON.parse(JSON.stringify(originalBlock)),
      id: uuidv4(),
    };

    state.addBlock(duplicatedBlock, blockIndex + 1);
  },

  // 페이지 추가
  addPage: (name: string) => {
    const state = get();
    if (!state.project) return;

    const newPage: Page = {
      id: uuidv4(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      blocks: [],
      settings: {
        title: name,
        description: '',
      },
    };

    set({
      project: {
        ...state.project,
        pages: [...state.project.pages, newPage],
        updatedAt: new Date(),
      },
      currentPageId: newPage.id,
    });
  },

  updatePage: (pageId: string, updates: Partial<Page>) => {
    const state = get();
    if (!state.project) return;

    const updatedPages = state.project.pages.map(page =>
      page.id === pageId ? { ...page, ...updates } : page
    );

    set({
      project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
    });
  },

  deletePage: (pageId: string) => {
    const state = get();
    if (!state.project || state.project.pages.length <= 1) return;

    const updatedPages = state.project.pages.filter(page => page.id !== pageId);
    const newCurrentPageId = state.currentPageId === pageId
      ? updatedPages[0].id
      : state.currentPageId;

    set({
      project: { ...state.project, pages: updatedPages, updatedAt: new Date() },
      currentPageId: newCurrentPageId,
    });
  },

  updateGlobalStyles: (styles: Partial<GlobalStyles>) => {
    const state = get();
    if (!state.project) return;

    set({
      project: {
        ...state.project,
        globalStyles: { ...state.project.globalStyles, ...styles },
        updatedAt: new Date(),
      },
    });
  },

  setDragging: (isDragging: boolean) => set({ isDragging }),
  setPreviewMode: (isPreview: boolean) => set({ isPreviewMode: isPreview }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  // 히스토리 관리
  saveToHistory: () => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage) return;

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(currentPage.blocks)));

    set({
      history: newHistory.slice(-50), // 최대 50개 히스토리
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project || state.historyIndex <= 0) return;

    const newIndex = state.historyIndex - 1;
    const previousBlocks = state.history[newIndex];

    const updatedPages = state.project.pages.map(page =>
      page.id === currentPage.id ? { ...page, blocks: previousBlocks } : page
    );

    set({
      project: { ...state.project, pages: updatedPages },
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const state = get();
    const currentPage = state.getCurrentPage();
    if (!currentPage || !state.project || state.historyIndex >= state.history.length - 1) return;

    const newIndex = state.historyIndex + 1;
    const nextBlocks = state.history[newIndex];

    const updatedPages = state.project.pages.map(page =>
      page.id === currentPage.id ? { ...page, blocks: nextBlocks } : page
    );

    set({
      project: { ...state.project, pages: updatedPages },
      historyIndex: newIndex,
    });
  },

  addAiMessage: (message) => {
    set(state => ({
      aiMessages: [...state.aiMessages, message],
    }));
  },

  setAiLoading: (loading: boolean) => set({ isAiLoading: loading }),

  // 헬퍼 함수들
  getCurrentPage: () => {
    const state = get();
    if (!state.project || !state.currentPageId) return null;
    return state.project.pages.find(page => page.id === state.currentPageId) || null;
  },

  getBlockById: (blockId: string) => {
    const currentPage = get().getCurrentPage();
    if (!currentPage) return null;
    return currentPage.blocks.find(block => block.id === blockId) || null;
  },
}));

