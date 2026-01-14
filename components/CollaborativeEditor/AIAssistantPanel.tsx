/**
 * AI 도우미 패널 컴포넌트
 * 블록 분석 및 제안 표시
 */
'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import AISuggestionCard from '../ai/AISuggestionCard';
import DiffViewer from '../DiffViewer';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AIAssistantPanel() {
  const {
    selectedBlockId,
    aiAnalysis,
    aiSuggestions,
    isAIAnalyzing,
    requestAIAnalysis,
    applyAISuggestion,
    dismissAISuggestion,
  } = useEditorStore();

  // 블록 선택 시 자동 분석
  useEffect(() => {
    if (selectedBlockId) {
      requestAIAnalysis(selectedBlockId);
    }
  }, [selectedBlockId, requestAIAnalysis]);

  if (!selectedBlockId) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>블록을 선택하면 AI 분석이 시작됩니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">
            AI 도우미
          </h2>
        </div>
        {aiAnalysis && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">점수:</span>
              <span className="font-semibold">{aiAnalysis.score}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">등급:</span>
              <span className={`font-semibold ${
                aiAnalysis.grade === 'A' ? 'text-green-600' :
                aiAnalysis.grade === 'B' ? 'text-blue-600' :
                aiAnalysis.grade === 'C' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {aiAnalysis.grade}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 분석 중 */}
      {isAIAnalyzing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI 분석 중...
            </p>
          </div>
        </div>
      )}

      {/* 분석 결과 */}
      {!isAIAnalyzing && aiAnalysis && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 전체 평가 */}
          {aiAnalysis.overall && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                전체 평가
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {aiAnalysis.overall}
              </p>
            </div>
          )}

          {/* 문제점 */}
          {aiAnalysis.issues.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                발견된 문제 ({aiAnalysis.issues.length})
              </h3>
              <div className="space-y-3">
                {aiAnalysis.issues.map((issue) => (
                  <AISuggestionCard
                    key={issue.id}
                    suggestion={issue}
                    onApply={() => applyAISuggestion(issue.id)}
                    onDismiss={() => dismissAISuggestion(issue.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 개선 제안 */}
          {aiAnalysis.suggestions.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                개선 제안 ({aiAnalysis.suggestions.length})
              </h3>
              <div className="space-y-3">
                {aiAnalysis.suggestions.map((suggestion) => (
                  <AISuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={() => applyAISuggestion(suggestion.id)}
                    onDismiss={() => dismissAISuggestion(suggestion.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 제안이 없을 때 */}
          {aiAnalysis.issues.length === 0 && aiAnalysis.suggestions.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                발견된 문제나 개선 사항이 없습니다.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 분석 결과 없음 */}
      {!isAIAnalyzing && !aiAnalysis && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>AI 분석 결과가 없습니다.</p>
            <button
              onClick={() => selectedBlockId && requestAIAnalysis(selectedBlockId)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              분석 다시 시도
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
