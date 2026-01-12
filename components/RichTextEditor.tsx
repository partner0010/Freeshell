/**
 * 리치 텍스트 에디터 컴포넌트
 * ZeroONE 프로젝트 참고
 */
'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  FileText,
  Link as LinkIcon,
  Image,
  Code,
  ArrowLeft,
  ArrowRight,
  X,
  Layout,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  height = 400,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // 에디터 내용 업데이트
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // 에디터 내용 변경 감지
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // 명령 실행
  const executeCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  // 링크 삽입
  const handleInsertLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setLinkText('');
    } else {
      setLinkText(selection.toString());
    }
    setShowLinkDialog(true);
  };

  const confirmLink = () => {
    if (linkUrl) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText || linkUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        range.deleteContents();
        range.insertNode(link);
        handleInput();
      }
    }
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  // 이미지 삽입
  const handleInsertImage = () => {
    setShowImageDialog(true);
  };

  const confirmImage = () => {
    if (imageUrl) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        range.insertNode(img);
        handleInput();
      }
    }
    setShowImageDialog(false);
    setImageUrl('');
  };

  // 테이블 삽입
  const handleInsertTable = () => {
    setShowTableDialog(true);
  };

  const confirmTable = () => {
    const table = document.createElement('table');
    table.className = 'border-collapse border border-gray-300 w-full';
    table.style.marginTop = '10px';
    table.style.marginBottom = '10px';

    for (let i = 0; i < tableRows; i++) {
      const row = document.createElement('tr');
      for (let j = 0; j < tableCols; j++) {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        cell.className = 'border border-gray-300 p-2';
        cell.textContent = i === 0 ? `헤더 ${j + 1}` : '';
        row.appendChild(cell);
      }
      table.appendChild(row);
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(table);
      handleInput();
    }

    setShowTableDialog(false);
    setTableRows(3);
    setTableCols(3);
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`rich-text-editor ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* 툴바 */}
      <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex flex-wrap items-center gap-1">
        {/* 텍스트 스타일 */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => executeCommand('bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="굵게"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="기울임"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('underline')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="밑줄"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* 정렬 */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => executeCommand('justifyLeft')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyCenter')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('justifyRight')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* 리스트 */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={() => executeCommand('insertUnorderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="순서 없는 목록"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('insertOrderedList')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="순서 있는 목록"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* 링크 및 미디어 */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="링크 삽입"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="이미지 삽입"
          >
            <Image className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertTable}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="테이블 삽입"
          >
            <Layout className="w-4 h-4" />
          </button>
        </div>

        {/* 기타 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => executeCommand('undo')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="실행 취소"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => executeCommand('redo')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="다시 실행"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title={isFullscreen ? '전체화면 종료' : '전체화면'}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <span className="text-xs font-bold">⛶</span>}
          </button>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="w-full border border-t-0 border-gray-300 rounded-b-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          height: `${height}px`,
          minHeight: '200px',
          overflowY: 'auto',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* 링크 삽입 다이얼로그 */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">링크 삽입</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">링크 텍스트</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="링크 텍스트"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 삽입 다이얼로그 */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">이미지 삽입</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowImageDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 테이블 삽입 다이얼로그 */}
      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">테이블 삽입</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">행 수</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">열 수</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmTable}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 플레이스홀더 스타일 */}
      <style jsx>{`
        .rich-text-editor [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
