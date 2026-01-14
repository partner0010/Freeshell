/**
 * 강화된 코드 에디터 컴포넌트
 * 자동완성, 문법 검사, 포맷팅, AI 추천 기능 포함
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Code, FileCode, Eye, Copy, Check, Sparkles, Lightbulb, Zap, AlertCircle, CheckCircle2, RefreshCw, Palette, Moon, Sun } from 'lucide-react';
import SyntaxHighlighter from './SyntaxHighlighter';
import CodeAutocomplete from './CodeAutocomplete';

interface CodeEditorProps {
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
  line?: number;
  severity?: 'high' | 'medium' | 'low';
  diffs?: Array<{ type: 'add' | 'remove' | 'replace'; line: number; content: string }>;
}

export default function EnhancedCodeEditor({ files, onFilesChange, onPreview, onCursorChange, onFileChange }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showSyntaxHighlight, setShowSyntaxHighlight] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // 커서 위치 계산
  const updateCursorPosition = useCallback(() => {
    if (textareaRef.current) {
      const text = textareaRef.current.value;
      const cursorPos = textareaRef.current.selectionStart;
      const textBeforeCursor = text.substring(0, cursorPos);
      const lines = textBeforeCursor.split('\n');
      const newPosition = {
        line: lines.length,
        column: lines[lines.length - 1].length + 1,
      };
      setCursorPosition(newPosition);
      if (onCursorChange) {
        onCursorChange(newPosition);
      }
    }
  }, [onCursorChange]);

  useEffect(() => {
    if (onFileChange) {
      onFileChange(activeFile);
    }
  }, [activeFile, onFileChange]);

  const handleFileContentChange = (index: number, content: string) => {
    const newFiles = [...files];
    newFiles[index].content = content;
    onFilesChange(newFiles);
    updateCursorPosition();
  };

  // 코드 포맷팅
  const formatCode = useCallback(() => {
    const file = files[activeFile];
    if (!file) return;

    let formatted = file.content;
    const language = getLanguage(file.name);

    try {
      if (language === 'html') {
        // 간단한 HTML 포맷팅
        formatted = formatted
          .replace(/>\s+</g, '><')
          .replace(/></g, '>\n<')
          .split('\n')
          .map((line, index, arr) => {
            const indent = line.match(/^(\s*)/)?.[1]?.length || 0;
            const isClosing = line.trim().startsWith('</');
            const prevLine = arr[index - 1];
            const prevIsOpening = prevLine?.trim().startsWith('<') && !prevLine?.trim().startsWith('</');
            
            if (isClosing && prevIsOpening) {
              return line;
            }
            return line;
          })
          .join('\n');
      } else if (language === 'css') {
        // CSS 포맷팅
        formatted = formatted
          .replace(/\s*\{\s*/g, ' {\n    ')
          .replace(/\s*\}\s*/g, '\n}\n')
          .replace(/\s*;\s*/g, ';\n    ')
          .replace(/,\s*/g, ', ');
      } else if (language === 'javascript') {
        // JavaScript 기본 포맷팅
        formatted = formatted
          .replace(/\s*\{\s*/g, ' {\n    ')
          .replace(/\s*\}\s*/g, '\n}\n')
          .replace(/\s*;\s*/g, ';\n');
      }

      const newFiles = [...files];
      newFiles[activeFile].content = formatted;
      onFilesChange(newFiles);
    } catch (error) {
      console.error('포맷팅 오류:', error);
    }
  }, [files, activeFile, onFilesChange]);

  // AI 코드 분석 및 제안
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
    // Diff가 있으면 Diff 기반 적용
    if (suggestion.diffs && suggestion.diffs.length > 0) {
      try {
        const { applyDiff } = require('@/lib/services/diff-manager');
        const newFiles = [...files];
        const originalCode = newFiles[activeFile].content;
        const modifiedCode = applyDiff(originalCode, suggestion.diffs);
        newFiles[activeFile].content = modifiedCode;
        onFilesChange(newFiles);
        setSuggestions(suggestions.filter(s => s !== suggestion));
        return;
      } catch (error) {
        console.error('Diff 적용 오류:', error);
      }
    }

    // 기존 방식 (Diff가 없는 경우)
    if (!suggestion.code) return;

    const newFiles = [...files];
    if (suggestion.line) {
      const lines = newFiles[activeFile].content.split('\n');
      lines[suggestion.line - 1] = suggestion.code;
      newFiles[activeFile].content = lines.join('\n');
    } else {
      newFiles[activeFile].content = suggestion.code;
    }
    onFilesChange(newFiles);
    setSuggestions(suggestions.filter(s => s !== suggestion));
  }, [files, activeFile, onFilesChange, suggestions]);

  const handleCopy = async () => {
    if (files[activeFile]) {
      await navigator.clipboard.writeText(files[activeFile].content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePreview = () => {
    const htmlFile = files.find(f => f.name.includes('html') || f.name.includes('index'));
    const cssFile = files.find(f => f.name.includes('css') || f.name.includes('style'));
    const jsFile = files.find(f => f.name.includes('js') || f.name.includes('script'));

    if (htmlFile) {
      let html = htmlFile.content;
      if (cssFile) {
        html = html.replace(
          /<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi,
          `<style>${cssFile.content}</style>`
        );
      }
      if (jsFile) {
        html = html.replace(
          /<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi,
          `<script>${jsFile.content}</script>`
        );
      }
      if (onPreview) {
        onPreview(html);
      }
    }
  };

  const getLanguage = (fileName: string) => {
    if (fileName.includes('html')) return 'html';
    if (fileName.includes('css')) return 'css';
    if (fileName.includes('js')) return 'javascript';
    return 'text';
  };

  // 탭 키 처리 (들여쓰기)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      textarea.value = newValue;
      textarea.setSelectionRange(start + 2, start + 2);
      handleFileContentChange(activeFile, newValue);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      formatCode();
    }
  };

  // 코드 변경 시 자동 분석 (디바운스) - 사용자가 타이핑을 멈춘 후 분석
  useEffect(() => {
    const timer = setTimeout(() => {
      if (files[activeFile]?.content && files[activeFile].content.length > 50) {
        analyzeCode();
      }
    }, 3000); // 3초 후 분석

    return () => clearTimeout(timer);
  }, [files[activeFile]?.content, activeFile, analyzeCode]);

  return (
    <div className={`flex flex-col h-full rounded-lg border-2 overflow-hidden ${
      darkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      {/* 파일 탭 */}
      <div className={`flex items-center border-b overflow-x-auto ${
        darkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveFile(index)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeFile === index
                ? darkMode
                  ? 'border-blue-500 text-blue-400 bg-gray-800'
                  : 'border-blue-600 text-blue-600 bg-white'
                : darkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-200'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span className="text-sm font-medium">{file.name}</span>
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded transition-colors ${
              darkMode
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="다크 모드"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={formatCode}
            className={`p-2 rounded transition-colors ${
              darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="코드 포맷팅 (Ctrl+Enter)"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSyntaxHighlight(!showSyntaxHighlight)}
            className={`p-2 rounded transition-colors ${
              showSyntaxHighlight
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="문법 하이라이팅"
          >
            <Palette className="w-4 h-4" />
          </button>
          <button
            onClick={analyzeCode}
            disabled={isAnalyzing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="AI 코드 분석"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className={`p-2 rounded transition-colors ${
              darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="복사"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePreview}
            className={`p-2 rounded transition-colors ${
              darkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="미리보기"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
      {/* 에디터 영역 */}
      <div className="flex-1 flex flex-col relative">
        {showSyntaxHighlight ? (
          <div className="relative w-full h-full">
            <textarea
              ref={textareaRef}
              value={files[activeFile]?.content || ''}
              onChange={(e) => handleFileContentChange(activeFile, e.target.value)}
              onKeyDown={handleKeyDown}
              onSelect={updateCursorPosition}
              className={`absolute inset-0 w-full h-full p-4 font-mono text-sm border-0 focus:outline-none resize-none bg-transparent z-10 ${
                darkMode ? 'text-transparent caret-white' : 'text-transparent caret-gray-900'
              }`}
              style={{ tabSize: 2 }}
              spellCheck={false}
              placeholder={`${files[activeFile]?.name || '파일'}을 편집하세요...`}
            />
            <div className={`absolute inset-0 p-4 font-mono text-sm overflow-auto pointer-events-none z-0 ${
              darkMode ? 'bg-gray-900' : 'bg-white'
            }`}>
              <SyntaxHighlighter
                code={files[activeFile]?.content || ''}
                language={getLanguage(files[activeFile]?.name || '') as 'html' | 'css' | 'javascript'}
              />
            </div>
            {/* 줄 번호 */}
            <div className={`absolute left-0 top-0 bottom-0 w-12 border-r text-xs font-mono p-4 pointer-events-none z-0 ${
              darkMode 
                ? 'bg-gray-900 border-gray-700 text-gray-500' 
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              {files[activeFile]?.content.split('\n').map((_, i) => (
                <div key={i} className="text-right">{i + 1}</div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={files[activeFile]?.content || ''}
              onChange={(e) => handleFileContentChange(activeFile, e.target.value)}
              onKeyDown={handleKeyDown}
              onSelect={updateCursorPosition}
              className={`w-full h-full p-4 font-mono text-sm border-0 focus:outline-none resize-none ${
                darkMode 
                  ? 'bg-gray-900 text-gray-100' 
                  : 'bg-white text-gray-900'
              }`}
              style={{ tabSize: 2 }}
              spellCheck={false}
              placeholder={`${files[activeFile]?.name || '파일'}을 편집하세요...`}
            />
            {/* 줄 번호 */}
            <div className={`absolute left-0 top-0 bottom-0 w-12 border-r text-xs font-mono p-4 pointer-events-none ${
              darkMode 
                ? 'bg-gray-900 border-gray-700 text-gray-500' 
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              {files[activeFile]?.content.split('\n').map((_, i) => (
                <div key={i} className="text-right">{i + 1}</div>
              ))}
            </div>
          </>
        )}
      </div>

        {/* AI 제안 사이드바 */}
        {showSuggestions && suggestions.length > 0 && (
          <div className={`w-80 border-l overflow-y-auto ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">AI 제안</h3>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {suggestions.length}
                </span>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <span className="text-gray-600">×</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 ${
                    suggestion.severity === 'high'
                      ? 'border-red-200 bg-red-50'
                      : suggestion.severity === 'medium'
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'bug' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : suggestion.type === 'optimization' ? (
                        <Zap className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-xs font-semibold text-gray-700 uppercase">
                        {suggestion.type === 'bug' ? '버그' : 
                         suggestion.type === 'optimization' ? '최적화' : 
                         suggestion.type === 'design' ? '디자인' : '개선'}
                      </span>
                    </div>
                    {suggestion.line && (
                      <span className="text-xs text-gray-500">줄 {suggestion.line}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{suggestion.message}</p>
                  {suggestion.code && (
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      적용하기
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 상태 바 */}
      <div className={`px-4 py-2 border-t flex items-center justify-between text-xs ${
        darkMode
          ? 'bg-gray-800 border-gray-700 text-gray-400'
          : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div className="flex items-center gap-4">
          <span>언어: {getLanguage(files[activeFile]?.name || '')}</span>
          <span>줄: {cursorPosition.line} / {files[activeFile]?.content.split('\n').length || 0}</span>
          <span>열: {cursorPosition.column}</span>
          <span>문자: {files[activeFile]?.content.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          {!showSuggestions && suggestions.length > 0 && (
            <button
              onClick={() => setShowSuggestions(true)}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <Lightbulb className="w-3 h-3" />
              <span>제안 {suggestions.length}개</span>
            </button>
          )}
          <Code className="w-4 h-4" />
          <span>강화된 코드 에디터</span>
        </div>
      </div>
    </div>
  );
}
