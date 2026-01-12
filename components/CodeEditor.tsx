/**
 * 코드 에디터 컴포넌트
 * HTML, CSS, JavaScript 파일 편집
 */
'use client';

import { useState } from 'react';
import { Code, FileCode, Save, Download, Eye, Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  files: Array<{ name: string; type: string; content: string }>;
  onFilesChange: (files: Array<{ name: string; type: string; content: string }>) => void;
  onPreview?: (html: string) => void;
}

export default function CodeEditor({ files, onFilesChange, onPreview }: CodeEditorProps) {
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleFileContentChange = (index: number, content: string) => {
    const newFiles = [...files];
    newFiles[index].content = content;
    onFilesChange(newFiles);
  };

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
          /<link[^>]*href=["']style\.css["'][^>]*>/i,
          `<style>${cssFile.content}</style>`
        );
      }
      if (jsFile) {
        html = html.replace(
          /<script[^>]*src=["']script\.js["'][^>]*><\/script>/i,
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* 파일 탭 */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveFile(index)}
            className={`px-4 py-2 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeFile === index
                ? 'border-blue-600 text-blue-600 bg-white'
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
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="복사"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handlePreview}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="미리보기"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className="flex-1 relative">
        {files[activeFile] && (
          <textarea
            value={files[activeFile].content}
            onChange={(e) => handleFileContentChange(activeFile, e.target.value)}
            className="w-full h-full p-4 font-mono text-sm border-0 focus:outline-none resize-none"
            style={{ tabSize: 2 }}
            spellCheck={false}
            placeholder={`${files[activeFile].name} 파일을 편집하세요...`}
          />
        )}
      </div>

      {/* 상태 바 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>언어: {getLanguage(files[activeFile]?.name || '')}</span>
          <span>줄: {files[activeFile]?.content.split('\n').length || 0}</span>
          <span>문자: {files[activeFile]?.content.length || 0}</span>
        </div>
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4" />
          <span>코드 에디터</span>
        </div>
      </div>
    </div>
  );
}
