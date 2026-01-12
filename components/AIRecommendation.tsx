/**
 * AI 실시간 추천 컴포넌트
 * 사용자가 편집 중 도움이 필요할 때 AI가 추천
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Zap, 
  CheckCircle, 
  X, 
  RefreshCw,
  Wand2,
  TrendingUp
} from 'lucide-react';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';

interface Recommendation {
  id: string;
  type: 'suggestion' | 'feature' | 'improvement' | 'fix';
  title: string;
  description: string;
  code?: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export default function AIRecommendation({ 
  files, 
  currentFile, 
  cursorPosition 
}: { 
  files: Array<{ name: string; type: string; content: string }>;
  currentFile: number;
  cursorPosition: { line: number; column: number };
}) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoRecommend, setAutoRecommend] = useState(true);

  useEffect(() => {
    if (autoRecommend && files.length > 0) {
      const timer = setTimeout(() => {
        analyzeAndRecommend();
      }, 3000); // 3초 후 자동 분석

      return () => clearTimeout(timer);
    }
  }, [files, currentFile, cursorPosition, autoRecommend]);

  const analyzeAndRecommend = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files,
          currentFile: files[currentFile],
          cursorPosition,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('추천 생성 실패:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyRecommendation = async (recommendation: Recommendation) => {
    if (recommendation.code && recommendation.action) {
      // 추천 코드 적용
      const newFiles = [...files];
      const file = newFiles[currentFile];
      
      if (recommendation.action === 'insert') {
        const lines = file.content.split('\n');
        lines.splice(cursorPosition.line, 0, recommendation.code);
        newFiles[currentFile] = {
          ...file,
          content: lines.join('\n'),
        };
      } else if (recommendation.action === 'replace') {
        newFiles[currentFile] = {
          ...file,
          content: recommendation.code,
        };
      }

      // 파일 변경 이벤트 발생 (부모 컴포넌트에서 처리)
      const event = new CustomEvent('files-change', {
        detail: { files: newFiles },
      });
      window.dispatchEvent(event);

      // 적용된 추천 제거
      setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    }
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'feature':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case 'improvement':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'fix':
        return <CheckCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  if (recommendations.length === 0 && !isAnalyzing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-xl border-2 border-purple-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI 추천</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRecommend(!autoRecommend)}
              className={`text-xs px-2 py-1 rounded ${
                autoRecommend
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
              title="자동 추천"
            >
              {autoRecommend ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={analyzeAndRecommend}
              disabled={isAnalyzing}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
            <p>AI가 코드를 분석하고 있습니다...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-3 rounded-lg border-2 ${
                  rec.priority === 'high'
                    ? 'bg-red-50 border-red-200'
                    : rec.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {getTypeIcon(rec.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900">{rec.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{rec.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissRecommendation(rec.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                {rec.code && (
                  <div className="mb-2">
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {rec.code}
                    </pre>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {rec.action && (
                    <EnhancedButton
                      variant="gradient"
                      size="sm"
                      onClick={() => applyRecommendation(rec)}
                      icon={Wand2}
                    >
                      적용하기
                    </EnhancedButton>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      rec.priority === 'high'
                        ? 'bg-red-200 text-red-700'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-200 text-yellow-700'
                        : 'bg-blue-200 text-blue-700'
                    }`}
                  >
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
