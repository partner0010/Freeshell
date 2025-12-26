'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Monitor, Tablet, Smartphone, Maximize2, ExternalLink, Gauge, X } from 'lucide-react';
import { useEditorStore } from '@/store/editor-store';
import { Toolbar, Sidebar, Canvas, ContentEditor } from '@/components/editor';
import { TemplateGallery } from '@/components/editor/TemplateGallery';
import { OnboardingTutorial } from '@/components/editor/OnboardingTutorial';
import { ViewportSize, getViewportWidth } from '@/components/editor/ViewportSelector';
import { KeyboardShortcuts } from '@/components/editor/KeyboardShortcuts';
import { ImageLibrary } from '@/components/editor/ImageLibrary';
import CommandPalette from '@/components/editor/CommandPalette';
import AutoSave from '@/components/editor/AutoSave';
import EditorMinimap from '@/components/editor/EditorMinimap';
import AIChatbot from '@/components/editor/AIChatbot';
import ThemeToggle from '@/components/editor/ThemeToggle';
import FloatingToolbar from '@/components/editor/FloatingToolbar';
import { OrganizedSidebar } from '@/components/editor/OrganizedSidebar';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeToggle as NewThemeToggle } from '@/components/ui/ThemeToggle';
import { UnifiedNotificationCenter } from '@/components/notifications/UnifiedNotificationCenter';
import { HighContrastToggle } from '@/components/accessibility/HighContrastToggle';
import { registerServiceWorker } from '@/lib/pwa/pwa-installer';
import dynamic from 'next/dynamic';
import { EditorFloatingWidgets } from '@/components/editor/EditorFloatingWidgets';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// 동적 임포트로 코드 분할
const VoiceTranslation = dynamic(() => import('@/components/editor/VoiceTranslation').then(mod => ({ default: mod.VoiceTranslation })), {
  ssr: false,
});

const RealTimeCollaboration = dynamic(() => import('@/components/collaboration/RealTimeCollaboration').then(mod => ({ default: mod.RealTimeCollaboration })), {
  ssr: false,
});

// 전체화면 이벤트 핸들러 컴포넌트
function PreviewFullscreenHandler({ onFullscreenChange }: { onFullscreenChange: (isFullscreen: boolean) => void }) {
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      onFullscreenChange(isFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onFullscreenChange]);

  // F11 키로 전체화면 토글
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        const isCurrentlyFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );

        if (isCurrentlyFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
          } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
          }
        } else {
          const element = document.documentElement;
          if (element.requestFullscreen) {
            element.requestFullscreen();
          } else if ((element as any).webkitRequestFullscreen) {
            (element as any).webkitRequestFullscreen();
          } else if ((element as any).mozRequestFullScreen) {
            (element as any).mozRequestFullScreen();
          } else if ((element as any).msRequestFullscreen) {
            (element as any).msRequestFullscreen();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}

function EditorPageContent() {
  const { initProject, project, isPreviewMode, setPreviewMode } = useEditorStore();
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewLoadTime, setPreviewLoadTime] = useState<number | null>(null);

  useEffect(() => {
    if (!project) {
      initProject('내 웹사이트');
    }

    // PWA Service Worker 등록
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, [project, initProject]);

  // 미리보기 모드 진입 시 성능 측정
  useEffect(() => {
    if (isPreviewMode) {
      const startTime = performance.now();
      requestAnimationFrame(() => {
        const loadTime = Math.round(performance.now() - startTime);
        setPreviewLoadTime(loadTime);
      });
    } else {
      setPreviewLoadTime(null);
    }
  }, [isPreviewMode]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            useEditorStore.getState().undo();
            break;
          case 'y':
            e.preventDefault();
            useEditorStore.getState().redo();
            break;
          case 's':
            e.preventDefault();
            // 저장 로직
            console.log('저장!');
            break;
          case 'p':
            e.preventDefault();
            setPreviewMode(!isPreviewMode);
            break;
          case '/':
            e.preventDefault();
            setShowShortcuts(true);
            break;
        }
      }
      
      // ESC로 선택 해제 및 모달 닫기
      if (e.key === 'Escape') {
        // 미리보기 모드에서는 ESC로 편집 모드로 돌아가기
        if (isPreviewMode) {
          setPreviewMode(false);
        } else {
        useEditorStore.getState().selectBlock(null);
        setShowShortcuts(false);
        setShowImageLibrary(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewMode, setPreviewMode]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">에디터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="h-screen flex flex-col bg-surface-light overflow-hidden">
        {/* 온보딩 튜토리얼 */}
        {showTutorial && (
          <OnboardingTutorial onComplete={() => setShowTutorial(false)} />
        )}

      {/* 템플릿 갤러리 모달 */}
      {showTemplates && (
        <TemplateGallery onClose={() => setShowTemplates(false)} />
      )}

      {/* 키보드 단축키 모달 */}
      {showShortcuts && (
        <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />
      )}

      {/* 이미지 라이브러리 모달 */}
      {showImageLibrary && (
        <ImageLibrary 
          onSelect={(url, alt) => {
            console.log('Selected image:', url, alt);
            setShowImageLibrary(false);
          }}
          onClose={() => setShowImageLibrary(false)} 
        />
      )}

      {/* 툴바 */}
      <Toolbar 
        onOpenTemplates={() => setShowTemplates(true)}
        viewport={viewport}
        onViewportChange={setViewport}
      />

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        {/* 사이드바 - 미리보기 모드에서 숨김, 모바일에서는 드로어 */}
        {!isPreviewMode && (
          <div className="hidden md:flex flex-shrink-0">
            <OrganizedSidebar
              activeTab={(useEditorStore.getState().sidebarTab || 'blocks') as any}
              onTabChange={(tab) => {
                const state = useEditorStore.getState();
                // 모든 탭 지원
                if (['blocks', 'styles', 'ai', 'pages'].includes(tab)) {
                  state.setSidebarTab(tab as 'blocks' | 'styles' | 'ai' | 'pages');
                }
              }}
              currentContext={undefined}
            />
          </div>
        )}

        {/* 캔버스 */}
        <main className={`flex-1 overflow-auto ${isPreviewMode ? 'p-0' : 'p-4 sm:p-6 md:p-8 bg-gray-100'}`}>
          {/* 미리보기 모드 배너 및 컨트롤 */}
          {isPreviewMode && (
            <div className={`fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-2xl transition-all duration-300 ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye className="text-white" size={18} />
                    <span className="text-sm font-medium">미리보기 모드</span>
                  </div>
                  
                  {/* 뷰포트 선택 */}
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                    <button
                      onClick={() => setViewport('desktop')}
                      className={`p-1.5 rounded transition-colors ${viewport === 'desktop' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      title="데스크톱"
                    >
                      <Monitor size={16} />
                    </button>
                    <button
                      onClick={() => setViewport('tablet')}
                      className={`p-1.5 rounded transition-colors ${viewport === 'tablet' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      title="태블릿"
                    >
                      <Tablet size={16} />
                    </button>
                    <button
                      onClick={() => setViewport('mobile')}
                      className={`p-1.5 rounded transition-colors ${viewport === 'mobile' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                      title="모바일"
                    >
                      <Smartphone size={16} />
                    </button>
                  </div>

                  {/* 성능 인디케이터 */}
                  <div className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Gauge size={14} />
                    <div className="flex flex-col">
                      <span className="text-xs leading-tight">
                        {viewport === 'desktop' ? '1920px' : viewport === 'tablet' ? '768px' : '375px'}
                      </span>
                      {previewLoadTime !== null && (
                        <span className="text-[10px] leading-tight text-primary-100">
                          {previewLoadTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 새 탭에서 열기 */}
                  <button
                    onClick={() => {
                      const previewWindow = window.open('', '_blank');
                      if (previewWindow) {
                        const html = `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <title>미리보기 - ${project?.name || '웹사이트'}</title>
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <style>
                                body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
                              </style>
                            </head>
                            <body>
                              <div id="preview-content"></div>
                            </body>
                          </html>
                        `;
                        previewWindow.document.write(html);
                        previewWindow.document.close();
                      }
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    title="새 탭에서 열기"
                  >
                    <ExternalLink size={14} />
                    <span className="hidden sm:inline">새 탭</span>
                  </button>

                  {/* 전체화면 */}
                  <button
                    onClick={async () => {
                      try {
                        if (!isFullscreen) {
                          if (document.documentElement.requestFullscreen) {
                            await document.documentElement.requestFullscreen();
                          }
                          setIsFullscreen(true);
                        } else {
                          if (document.exitFullscreen) {
                            await document.exitFullscreen();
                          }
                          setIsFullscreen(false);
                        }
                      } catch (err) {
                        console.error('Fullscreen error:', err);
                      }
                    }}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    title="전체화면 (F11)"
                  >
                    <Maximize2 size={14} />
                  </button>

                  {/* 편집 모드로 전환 */}
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="px-4 py-1.5 bg-white text-primary-600 hover:bg-white/90 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <X size={14} />
                    <span>편집 모드</span>
                  </button>
                </div>
              </div>

              {/* ESC 안내 */}
              <div className="px-4 pb-2 text-xs text-primary-100">
                ESC 키를 눌러 편집 모드로 돌아가기 • F11 전체화면
              </div>
            </div>
          )}

          {/* 전체화면 이벤트 리스너 */}
          {isPreviewMode && (
            <PreviewFullscreenHandler
              onFullscreenChange={(fullscreen) => setIsFullscreen(fullscreen)}
            />
          )}
          
          <motion.div 
            className={`mx-auto transition-all duration-300 ${isPreviewMode ? 'pt-20' : ''}`}
            style={{ 
              maxWidth: isPreviewMode 
                ? (viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px')
                : getViewportWidth(viewport),
              width: '100%',
              margin: isPreviewMode && viewport !== 'desktop' ? '0 auto' : undefined,
            }}
            animate={{ 
              maxWidth: isPreviewMode 
                ? (viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '768px' : '375px')
                : getViewportWidth(viewport),
            }}
          >
            {/* 뷰포트 인디케이터 */}
            {viewport !== 'desktop' && !isPreviewMode && (
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm text-gray-500 shadow-sm">
                  {viewport === 'tablet' && '태블릿 뷰 (768px)'}
                  {viewport === 'mobile' && '모바일 뷰 (375px)'}
                </span>
              </div>
            )}
            
            {/* 캔버스 프레임 */}
            <div className={`
              ${viewport !== 'desktop' && !isPreviewMode ? 'bg-white rounded-3xl shadow-2xl overflow-hidden' : ''}
              ${isPreviewMode && viewport !== 'desktop' ? 'bg-white shadow-2xl mx-auto' : ''}
              ${isPreviewMode ? 'min-h-screen' : ''}
              ${isPreviewMode && viewport === 'mobile' ? 'border-x-0' : ''}
            `}
            style={isPreviewMode && viewport === 'mobile' ? {
              maxWidth: '375px',
              boxShadow: '0 0 0 2px rgba(0,0,0,0.05)',
            } : {}}
            >
              {viewport !== 'desktop' && !isPreviewMode && (
                <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-block px-4 py-1 bg-gray-700 rounded-full text-xs text-gray-400">
                      {viewport === 'tablet' ? '768 × 1024' : '375 × 812'}
                    </div>
                  </div>
                </div>
              )}
              <Canvas />
            </div>
          </motion.div>
        </main>

        {/* 콘텐츠 에디터 패널 */}
        <ContentEditor />
      </div>

      {/* 하단 상태바 */}
      {!isPreviewMode && (
        <div className="h-10 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex items-center justify-between px-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <CommandPalette />
            <span>페이지: {project.pages.find(p => p.id === useEditorStore.getState().currentPageId)?.name}</span>
            <span>블록: {useEditorStore.getState().getCurrentPage()?.blocks.length || 0}개</span>
          </div>
          <div className="flex items-center gap-4">
            <AutoSave />
            <UnifiedNotificationCenter />
            <HighContrastToggle />
            <NewThemeToggle />
            <span>v0.2.0</span>
          </div>
        </div>
      )}

      {/* 미니맵 */}
      {!isPreviewMode && <EditorMinimap />}

      {/* 플로팅 툴바 */}
      {!isPreviewMode && <FloatingToolbar />}

      {/* AI 챗봇 */}
      <AIChatbot />


      {/* 에디터 플로팅 위젯 통합 (피드백, 스냅샷, 성능, 접근성, PWA) */}
      <EditorFloatingWidgets isPreviewMode={isPreviewMode} />

      {/* 음성 번역 메모 (최소화 가능) */}
      <VoiceTranslation
        onSave={(memos) => {
          // 마이페이지에 저장
          const item = {
            id: `voice-${Date.now()}`,
            type: 'voice-memo' as const,
            title: `음성 메모 ${new Date().toLocaleString()}`,
            description: `${memos.length}개의 음성 메모`,
            createdAt: new Date(),
            data: memos,
          };
          const existing = JSON.parse(localStorage.getItem('grip-saved-items') || '[]');
          localStorage.setItem('grip-saved-items', JSON.stringify([item, ...existing]));
        }}
        defaultMinimized={true}
      />
      </div>
    </ToastProvider>
  );
}

export default function EditorPage() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Editor Error:', error, errorInfo);
        // 에러 리포팅 서비스로 전송
      }}
    >
      <EditorPageContent />
    </ErrorBoundary>
  );
}
