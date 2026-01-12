/**
 * 웹사이트/앱 에디터 컴포넌트
 * 템플릿 선택 후 상세 편집 가능
 */
'use client';

import { useState, useEffect } from 'react';
import { Code, Eye, Save, Download, FileText, Sparkles, RefreshCw, Package, Monitor, Smartphone, Tablet, BookOpen, History, Bug, HelpCircle, FileCheck, X, Users, Cloud, Layout } from 'lucide-react';
import EnhancedCodeEditor from './EnhancedCodeEditor';
import RichTextEditor from './RichTextEditor';
import ComponentLibrary from './ComponentLibrary';
import ResponsivePreview from './ResponsivePreview';
import CodeSnippets from './CodeSnippets';
import VersionHistory from './VersionHistory';
import DebugPanel from './DebugPanel';
import PerformanceMonitor from './PerformanceMonitor';
import EditorHelpPanel from './EditorHelpPanel';
import ProjectReview from './ProjectReview';
import AIRecommendation from './AIRecommendation';
import AutoFeatureAdder from './AutoFeatureAdder';
import Navbar from './Navbar';

interface WebsiteEditorProps {
  initialFiles?: Array<{ name: string; type: string; content: string }>;
  initialTemplateId?: string | null;
  onSave?: (files: Array<{ name: string; type: string; content: string }>) => void;
  onDownload?: (files: Array<{ name: string; type: string; content: string }>) => void;
}

type EditorMode = 'code' | 'visual';

export default function WebsiteEditor({ initialFiles = [], initialTemplateId, onSave, onDownload }: WebsiteEditorProps) {
  const [files, setFiles] = useState<Array<{ name: string; type: string; content: string }>>(initialFiles);
  const [editorMode, setEditorMode] = useState<EditorMode>('code');
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showProjectReview, setShowProjectReview] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showCloudStorage, setShowCloudStorage] = useState(false);
  const [showCommunitySnippets, setShowCommunitySnippets] = useState(false);
  const [showBlockEditor, setShowBlockEditor] = useState(false);
  const [roomId] = useState(`room_${Date.now()}`);
  const [userId] = useState(`user_${Date.now()}`);
  const [userName] = useState('User');

  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles(initialFiles);
      // updatePreview는 files가 변경된 후에 호출되어야 함
      setTimeout(() => updatePreview(), 100);
    } else if (initialTemplateId) {
      // 템플릿 ID로 템플릿 로드
      loadTemplate(initialTemplateId);
    } else {
      // 빈 에디터인 경우 로컬 스토리지에서 복구
      const saved = localStorage.getItem('editor-autosave');
      if (saved) {
        try {
          const savedFiles = JSON.parse(saved);
          if (savedFiles.length > 0) {
            setFiles(savedFiles);
            setTimeout(() => updatePreview(), 100);
          }
        } catch (error) {
          console.error('자동 저장 복구 실패:', error);
        }
      }
    }
  }, [initialFiles, initialTemplateId]);

  // files가 변경될 때마다 미리보기 업데이트
  useEffect(() => {
    if (files.length > 0) {
      updatePreview();
    }
  }, [files]);

  // 자동 저장
  useEffect(() => {
    if (!autoSaveEnabled || files.length === 0) return;

    const autoSaveTimer = setTimeout(() => {
      localStorage.setItem('editor-autosave', JSON.stringify(files));
      localStorage.setItem('editor-autosave-time', new Date().toISOString());
      setLastSaved(new Date());
    }, 2000); // 2초 후 자동 저장

    return () => clearTimeout(autoSaveTimer);
  }, [files, autoSaveEnabled]);

  const loadTemplate = async (templateId: string) => {
    try {
      // 방법 1: ID로 직접 검색
      const directResponse = await fetch(`/api/website-templates?id=${encodeURIComponent(templateId)}`);
      if (directResponse.ok) {
        const directData = await directResponse.json();
        if (directData.template && directData.template.files && directData.template.files.length > 0) {
          setFiles(directData.template.files);
          updatePreview();
          return;
        }
      }

      // 방법 2: 검색어로 검색
      const searchResponse = await fetch(`/api/website-templates?search=${encodeURIComponent(templateId)}&limit=1000`);
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const template = searchData.templates?.find((t: any) => t.id === templateId);
        
        if (template && template.files && template.files.length > 0) {
          setFiles(template.files);
          updatePreview();
          return;
        }
      }
      
      // 방법 3: 전체 템플릿에서 검색
      const allResponse = await fetch('/api/website-templates?limit=10000');
      if (allResponse.ok) {
        const allData = await allResponse.json();
        const template = allData.templates?.find((t: any) => t.id === templateId);
        
        if (template && template.files && template.files.length > 0) {
          setFiles(template.files);
          updatePreview();
          return;
        }
      }

      // 방법 4: 기본 템플릿으로 폴백
      console.warn('템플릿을 찾을 수 없어 기본 템플릿을 로드합니다:', templateId);
      loadDefaultTemplate();
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      // 네트워크 오류 시에도 기본 템플릿 로드
      loadDefaultTemplate();
    }
  };

  const loadDefaultTemplate = () => {
    // 기본 빈 템플릿 제공
    const defaultFiles = [
      {
        name: 'index.html',
        type: 'html',
        content: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새 웹사이트</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>새 웹사이트</h1>
        <p>여기에 내용을 추가하세요</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: 'style.css',
        type: 'css',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    color: #6366f1;
    margin-bottom: 1rem;
}`,
      },
      {
        name: 'script.js',
        type: 'javascript',
        content: `// JavaScript 코드를 여기에 작성하세요
console.log('웹사이트가 로드되었습니다!');`,
      },
    ];
    setFiles(defaultFiles);
    updatePreview();
  };

  const updatePreview = () => {
    const htmlFile = files.find(f => f.name.includes('html') || f.name.includes('index'));
    const cssFile = files.find(f => f.name.includes('css') || f.name.includes('style'));
    const jsFile = files.find(f => f.name.includes('js') || f.name.includes('script'));

    if (htmlFile) {
      let html = htmlFile.content;
      
      // CSS 파일이 있으면 <style> 태그로 삽입
      if (cssFile) {
        // 기존 <link> 태그 제거
        html = html.replace(/<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi, '');
        // <head> 태그 안에 <style> 추가, 없으면 </head> 앞에 추가
        if (html.includes('</head>')) {
          html = html.replace('</head>', `<style>${cssFile.content}</style></head>`);
        } else if (html.includes('<head>')) {
          html = html.replace('<head>', `<head><style>${cssFile.content}</style>`);
        } else {
          html = `<style>${cssFile.content}</style>${html}`;
        }
      }
      
      // JS 파일이 있으면 <script> 태그로 삽입
      if (jsFile) {
        // 기존 <script src> 태그 제거
        html = html.replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi, '');
        // </body> 태그 앞에 <script> 추가, 없으면 끝에 추가
        if (html.includes('</body>')) {
          html = html.replace('</body>', `<script>${jsFile.content}</script></body>`);
        } else {
          html = `${html}<script>${jsFile.content}</script>`;
        }
      }
      
      setPreviewHtml(html);
    } else {
      // HTML 파일이 없으면 기본 HTML 생성
      const defaultHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>미리보기</title>
    ${cssFile ? `<style>${cssFile.content}</style>` : ''}
</head>
<body>
    <div class="container">
        <h1>미리보기</h1>
        <p>HTML 파일을 추가하세요</p>
    </div>
    ${jsFile ? `<script>${jsFile.content}</script>` : ''}
</body>
</html>`;
      setPreviewHtml(defaultHtml);
    }
  };

  const handleFilesChange = (newFiles: Array<{ name: string; type: string; content: string }>) => {
    setFiles(newFiles);
    updatePreview();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(files);
      } else {
        // 기본 저장 로직 (로컬 스토리지)
        localStorage.setItem('website-editor-files', JSON.stringify(files));
        localStorage.setItem('editor-autosave', JSON.stringify(files));
        localStorage.setItem('editor-autosave-time', new Date().toISOString());
      }
      setLastSaved(new Date());
      
      // 성공 메시지 (토스트)
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          message: '저장되었습니다!',
          duration: 2000,
        },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('저장 실패:', error);
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          message: '저장에 실패했습니다.',
          duration: 3000,
        },
      });
      window.dispatchEvent(event);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(files);
    } else {
      // 기본 다운로드 로직
      const zipContent = files
        .map((file) => `=== ${file.name} ===\n${file.content}\n\n`)
        .join('\n');

      const blob = new Blob([zipContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website-files.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePreview = (html: string) => {
    setPreviewHtml(html);
    setShowPreview(true);
  };

  // 기본 파일이 없으면 생성
  if (files.length === 0) {
    const defaultFiles = [
      {
        name: 'index.html',
        type: 'html',
        content: `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새 웹사이트</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>안녕하세요!</h1>
        <p>이것은 새 웹사이트입니다.</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: 'style.css',
        type: 'css',
        content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f9fafb;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

h1 {
    color: #3b82f6;
    margin-bottom: 1rem;
}`,
      },
      {
        name: 'script.js',
        type: 'javascript',
        content: `document.addEventListener('DOMContentLoaded', function() {
    console.log('웹사이트가 로드되었습니다!');
});`,
      },
    ];
    setFiles(defaultFiles);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 네비게이션 바 */}
      <Navbar />
      
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between mt-16">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">웹사이트 에디터</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditorMode('code')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              코드 편집
            </button>
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editorMode === 'visual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              시각적 편집
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComponentLibrary(!showComponentLibrary)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showComponentLibrary
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>컴포넌트</span>
          </button>
          <button
            onClick={() => setShowSnippets(!showSnippets)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showSnippets
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>스니펫</span>
          </button>
          <button
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showVersionHistory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>버전</span>
          </button>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showDebugPanel
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span>디버그</span>
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>미리보기</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? '저장 중...' : '저장'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>다운로드</span>
          </button>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* 컴포넌트 라이브러리 */}
        {showComponentLibrary && (
          <ComponentLibrary
            onInsert={(component) => {
              const htmlFile = files.find(f => f.name.includes('html'));
              const cssFile = files.find(f => f.name.includes('css'));
              if (htmlFile && cssFile) {
                const newFiles = files.map(f => {
                  if (f.name === htmlFile.name) {
                    return {
                      ...f,
                      content: f.content.replace('</body>', `    ${component.code.html}\n</body>`),
                    };
                  }
                  if (f.name === cssFile.name) {
                    return {
                      ...f,
                      content: f.content + '\n\n' + component.code.css,
                    };
                  }
                  return f;
                });
                handleFilesChange(newFiles);
              }
            }}
          />
        )}

        {/* 코드 스니펫 */}
        {showSnippets && (
          <CodeSnippets
            onInsert={(code) => {
              const activeFile = files.find(f => f.name.includes('html') || f.name.includes('index'));
              if (activeFile) {
                const newFiles = files.map(f => {
                  if (f.name === activeFile.name) {
                    return {
                      ...f,
                      content: f.content + '\n' + code,
                    };
                  }
                  return f;
                });
                handleFilesChange(newFiles);
              }
            }}
          />
        )}

        {/* 버전 이력 */}
        {showVersionHistory && (
          <VersionHistory
            currentFiles={files}
            onRestore={(restoredFiles) => {
              setFiles(restoredFiles);
              updatePreview();
            }}
          />
        )}

        {/* 에디터 영역 */}
        <div className={`flex-1 ${showPreview ? 'w-1/2' : 'w-full'} transition-all`}>
          {editorMode === 'code' ? (
            <EnhancedCodeEditor
              files={files}
              onFilesChange={handleFilesChange}
              onPreview={handlePreview}
              onCursorChange={setCursorPosition}
              onFileChange={setCurrentFileIndex}
            />
          ) : (
            <div className="h-full bg-white rounded-lg border-2 border-gray-200 p-4">
              <RichTextEditor
                value={files.find(f => f.name.includes('html'))?.content || ''}
                onChange={(value) => {
                  const htmlFile = files.find(f => f.name.includes('html'));
                  if (htmlFile) {
                    const newFiles = files.map(f =>
                      f.name === htmlFile.name ? { ...f, content: value } : f
                    );
                    handleFilesChange(newFiles);
                  }
                }}
                placeholder="시각적으로 편집하세요..."
                height={600}
              />
            </div>
          )}
        </div>

        {/* 미리보기 영역 */}
        {showPreview && (
          <div className="w-1/2">
            <ResponsivePreview html={previewHtml} />
          </div>
        )}

        {/* 디버깅 패널 */}
        {showDebugPanel && <DebugPanel />}

        {/* 도움말 패널 */}
        {showHelpPanel && <EditorHelpPanel />}
      </div>

      {/* 프로젝트 총평 모달 */}
      {showProjectReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">프로젝트 총평</h2>
              <button
                onClick={() => setShowProjectReview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ProjectReview files={files} />
            </div>
          </div>
        </div>
      )}

      {/* AI 추천 */}
      <AIRecommendation
        files={files}
        currentFile={currentFileIndex}
        cursorPosition={cursorPosition}
      />

      {/* 자동 기능 추가 */}
      <AutoFeatureAdder
        files={files}
        onFilesChange={handleFilesChange}
      />

      {/* 성능 모니터 */}
      <PerformanceMonitor />
    </div>
  );
}
