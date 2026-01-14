/**
 * Monaco Editor 기반 코드 에디터
 * VS Code 수준의 편집 경험 제공
 * Monaco Editor가 없어도 기본 에디터로 작동
 */
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Code, FileCode, Eye, Copy, Check, Sparkles, Lightbulb, Zap, AlertCircle, CheckCircle2, RefreshCw, Palette, Moon, Sun, Save } from 'lucide-react';

interface MonacoCodeEditorProps {
  files: Array<{ name: string; type: string; content: string }>;
  onFilesChange: (files: Array<{ name: string; type: string; content: string }>) => void;
  onPreview?: (html: string) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  onFileChange?: (index: number) => void;
}

interface AISuggestion {
  type: 'improvement' | 'bug' | 'optimization' | 'design';
  message: string;
  code?: string;
  diff?: string;
  diffs?: any[];
  line?: number;
  severity?: 'high' | 'medium' | 'low';
  reason?: string;
  hasDiff?: boolean;
}

export default function MonacoCodeEditor({
  files,
  onFilesChange,
  onPreview,
  onCursorChange,
  onFileChange,
}: MonacoCodeEditorProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('light');
  const [monacoAvailable, setMonacoAvailable] = useState(false);
  const [MonacoEditor, setMonacoEditor] = useState<any>(null);
  const editorRef = useRef<any>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // Monaco Editor 동적 로드 (런타임에만, 빌드 시점 분석 완전히 방지)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // eval을 사용하여 webpack이 정적 분석하지 않도록
    const loadMonaco = async () => {
      try {
        // 완전히 동적으로 import하여 빌드 시점 분석 방지
        const importFunc = new Function('return (specifier) => import(specifier)')();
        const mod = await importFunc('@monaco-editor/react');
        setMonacoEditor(() => mod.default);
        setMonacoAvailable(true);
      } catch (error) {
        console.warn('Monaco Editor를 로드할 수 없습니다. 기본 에디터를 사용합니다.', error);
        setMonacoAvailable(false);
      }
    };
    
    loadMonaco();
  }, []);

  // Monaco Editor 설정
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // 커서 위치 추적
    editor.onDidChangeCursorPosition((e: any) => {
      const position = {
        line: e.position.lineNumber,
        column: e.position.column,
      };
      setCursorPosition(position);
      if (onCursorChange) {
        onCursorChange(position);
      }
    });

    // 키보드 단축키
    if (monaco) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        console.log('저장 단축키');
      });

      // 자동 포맷팅 (Shift+Alt+F)
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
        editor.getAction('editor.action.formatDocument')?.run();
      });
    }
  }, [onCursorChange]);

  // 언어 매핑
  const getLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      html: 'html',
      css: 'css',
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      json: 'json',
      md: 'markdown',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  // 파일 내용 변경
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;
    
    const newFiles = [...files];
    newFiles[activeFile].content = value;
    onFilesChange(newFiles);
  }, [files, activeFile, onFilesChange]);

  // 기본 textarea 변경 핸들러
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFiles = [...files];
    newFiles[activeFile].content = e.target.value;
    onFilesChange(newFiles);
    
    // 커서 위치 계산
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n');
    const position = {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
    setCursorPosition(position);
    if (onCursorChange) {
      onCursorChange(position);
    }
  }, [files, activeFile, onFilesChange, onCursorChange]);

  // AI 코드 분석
  const analyzeCode = useCallback(async () => {
    const file = files[activeFile];
    if (!file || !file.content.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/code-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: file.content,
          language: getLanguage(file.name),
          fileName: file.name,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('코드 분석 오류:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [files, activeFile]);

  // 제안 적용 (Diff 기반)
  const applySuggestion = useCallback((suggestion: AISuggestion) => {
    if (!suggestion.diffs || suggestion.diffs.length === 0) {
      if (suggestion.code) {
        const newFiles = [...files];
        if (suggestion.line) {
          const lines = newFiles[activeFile].content.split('\n');
          lines[suggestion.line - 1] = suggestion.code;
          newFiles[activeFile].content = lines.join('\n');
        } else {
          newFiles[activeFile].content = suggestion.code;
        }
        onFilesChange(newFiles);
      }
      return;
    }

    try {
      const { applyDiff } = require('@/lib/services/diff-manager');
      const newFiles = [...files];
      const originalCode = newFiles[activeFile].content;
      const modifiedCode = applyDiff(originalCode, suggestion.diffs);
      newFiles[activeFile].content = modifiedCode;
      onFilesChange(newFiles);
      setSuggestions(suggestions.filter(s => s !== suggestion));
    } catch (error) {
      console.error('Diff 적용 오류:', error);
    }
  }, [files, activeFile, onFilesChange, suggestions]);

  const handleCopy = async () => {
    if (files[activeFile]) {
      await navigator.clipboard.writeText(files[activeFile].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      const htmlFile = files.find(f => f.name.includes('html') || f.name.includes('index'));
      if (htmlFile) {
        onPreview(htmlFile.content);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'vs-dark' : 'light';
    setTheme(newTheme);
    setDarkMode(newTheme === 'vs-dark');
  };

  useEffect(() => {
    if (onFileChange) {
      onFileChange(activeFile);
    }
  }, [activeFile, onFileChange]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <FileCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>파일이 없습니다. 새 파일을 추가하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 파일 탭 */}
      <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveFile(index)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeFile === index
                ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <FileCode className="w-4 h-4" />
            {file.name}
          </button>
        ))}
      </div>

      {/* 툴바 */}
      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={analyzeCode}
            disabled={isAnalyzing}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? '분석 중...' : 'AI 분석'}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '복사됨' : '복사'}
          </button>
          <button
            onClick={handlePreview}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {cursorPosition.line}:{cursorPosition.column}
          </div>
          {monacoAvailable && (
            <button
              onClick={toggleTheme}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 에디터 */}
        <div className="flex-1 relative">
          {monacoAvailable && MonacoEditor ? (
            <MonacoEditor
              height="100%"
              language={getLanguage(files[activeFile]?.name || '')}
              value={files[activeFile]?.content || ''}
              onChange={handleEditorChange}
              theme={theme}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                acceptSuggestionOnEnter: 'on',
                snippetSuggestions: 'top',
              }}
            />
          ) : (
            <textarea
              value={files[activeFile]?.content || ''}
              onChange={handleTextareaChange}
              className="w-full h-full font-mono text-sm border-0 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:outline-none p-4"
              spellCheck={false}
              style={{ lineHeight: '1.5' }}
            />
          )}
        </div>

        {/* AI 제안 사이드바 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                AI 제안 ({suggestions.length})
              </h3>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    suggestion.severity === 'high'
                      ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                      : suggestion.severity === 'medium'
                      ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      suggestion.type === 'bug'
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        : suggestion.type === 'optimization'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}>
                      {suggestion.type === 'bug' ? '버그' : suggestion.type === 'optimization' ? '최적화' : '개선'}
                    </span>
                    {suggestion.severity && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.severity === 'high' ? '높음' : suggestion.severity === 'medium' ? '중간' : '낮음'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{suggestion.message}</p>
                  {suggestion.reason && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">이유: {suggestion.reason}</p>
                  )}
                  {suggestion.hasDiff && suggestion.diff && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
                      <pre className="whitespace-pre-wrap">{suggestion.diff}</pre>
                    </div>
                  )}
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    className="mt-2 w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    적용
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
