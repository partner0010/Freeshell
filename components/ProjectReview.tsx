/**
 * 프로젝트 총평 컴포넌트
 * AI 기반 전체 설계, 기능, 구성 평가
 */
'use client';

import { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Zap,
  Shield,
  Palette,
  Code,
  RefreshCw,
  Download
} from 'lucide-react';
import EnhancedButton from './EnhancedButton';
import EnhancedCard from './EnhancedCard';
import ScrollAnimation from './ScrollAnimation';

interface ReviewResult {
  overall: {
    score: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
    summary: string;
  };
  design: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  functionality: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
  performance: {
    score: number;
    metrics: {
      loadTime: number;
      size: number;
      requests: number;
    };
    improvements: string[];
  };
  accessibility: {
    score: number;
    checks: Array<{
      item: string;
      status: 'pass' | 'warning' | 'fail';
      message: string;
    }>;
  };
  security: {
    score: number;
    checks: Array<{
      item: string;
      status: 'pass' | 'warning' | 'fail';
      message: string;
    }>;
  };
  seo: {
    score: number;
    checks: Array<{
      item: string;
      status: 'pass' | 'warning' | 'fail';
      message: string;
    }>;
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    action: string;
  }>;
}

export default function ProjectReview({ files }: { files: Array<{ name: string; type: string; content: string }> }) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<ReviewResult | null>(null);

  const runReview = async () => {
    setIsReviewing(true);
    try {
      const response = await fetch('/api/ai/project-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });

      if (response.ok) {
        const data = await response.json();
        setReviewResult(data.review);
      }
    } catch (error) {
      console.error('리뷰 실행 실패:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'A':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'B+':
      case 'B':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'C+':
      case 'C':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">프로젝트 총평</h2>
          <p className="text-gray-600">AI가 전체 설계, 기능, 구성을 분석하고 평가합니다</p>
        </div>
        <EnhancedButton
          variant="gradient"
          onClick={runReview}
          loading={isReviewing}
          icon={Sparkles}
        >
          총평 실행
        </EnhancedButton>
      </div>

      {reviewResult && (
        <>
          {/* 전체 점수 */}
          <ScrollAnimation direction="down">
            <EnhancedCard className="p-6" glass>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">종합 평가</h3>
                  <p className="text-sm text-gray-600">{reviewResult.overall.summary}</p>
                </div>
                <div className={`px-6 py-4 rounded-xl border-2 ${getGradeColor(reviewResult.overall.grade)}`}>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">{reviewResult.overall.score}/100</div>
                    <div className="text-xl font-semibold">{reviewResult.overall.grade}</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </ScrollAnimation>

          {/* 카테고리별 평가 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 디자인 */}
            <ScrollAnimation direction="up" delay={100}>
              <EnhancedCard title="디자인" icon={Palette}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">점수</span>
                    <span className="text-2xl font-bold text-purple-600">
                      {reviewResult.design.score}/100
                    </span>
                  </div>
                </div>
                {reviewResult.design.strengths.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-green-700 mb-2">강점:</p>
                    <ul className="space-y-1">
                      {reviewResult.design.strengths.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reviewResult.design.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-yellow-700 mb-2">개선사항:</p>
                    <ul className="space-y-1">
                      {reviewResult.design.improvements.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </EnhancedCard>
            </ScrollAnimation>

            {/* 기능성 */}
            <ScrollAnimation direction="up" delay={200}>
              <EnhancedCard title="기능성" icon={Code}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">점수</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {reviewResult.functionality.score}/100
                    </span>
                  </div>
                </div>
                {reviewResult.functionality.strengths.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-green-700 mb-2">강점:</p>
                    <ul className="space-y-1">
                      {reviewResult.functionality.strengths.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {reviewResult.functionality.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-yellow-700 mb-2">개선사항:</p>
                    <ul className="space-y-1">
                      {reviewResult.functionality.improvements.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </EnhancedCard>
            </ScrollAnimation>

            {/* 성능 */}
            <ScrollAnimation direction="up" delay={300}>
              <EnhancedCard title="성능" icon={Zap}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">점수</span>
                    <span className="text-2xl font-bold text-green-600">
                      {reviewResult.performance.score}/100
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>로드 시간:</span>
                      <span className="font-semibold">{reviewResult.performance.metrics.loadTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>크기:</span>
                      <span className="font-semibold">{reviewResult.performance.metrics.size}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>요청:</span>
                      <span className="font-semibold">{reviewResult.performance.metrics.requests}개</span>
                    </div>
                  </div>
                </div>
                {reviewResult.performance.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-yellow-700 mb-2">개선사항:</p>
                    <ul className="space-y-1">
                      {reviewResult.performance.improvements.map((item, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </EnhancedCard>
            </ScrollAnimation>

            {/* 접근성 */}
            <ScrollAnimation direction="up" delay={400}>
              <EnhancedCard title="접근성" icon={Shield}>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">점수</span>
                    <span className="text-2xl font-bold text-indigo-600">
                      {reviewResult.accessibility.score}/100
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {reviewResult.accessibility.checks.map((check, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{check.item}</span>
                        <p className="text-gray-500 mt-0.5">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </EnhancedCard>
            </ScrollAnimation>
          </div>

          {/* 권장사항 */}
          <ScrollAnimation direction="up" delay={500}>
            <EnhancedCard title="권장사항" icon={TrendingUp}>
              <div className="space-y-3">
                {reviewResult.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                            rec.priority === 'high'
                              ? 'bg-red-200 text-red-700'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-200 text-yellow-700'
                              : 'bg-blue-200 text-blue-700'
                          }`}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{rec.category}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-xs text-gray-500">
                      <strong>조치:</strong> {rec.action}
                    </p>
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        </>
      )}
    </div>
  );
}
