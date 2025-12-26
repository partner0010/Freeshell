/**
 * 학습 시스템 통합 대시보드
 * Learning Systems Integration Dashboard
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Activity, Zap, Target, BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface LearningSummary {
  totalExperiences: number;
  totalPatterns: number;
  averagePerformance: number;
  crossFeatureTransfers: number;
  reinforcementActions: number;
  adaptiveStrategies: number;
  predictions: number;
  hyperparameterConfigs: number;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  recommendations: string[];
}

export function LearningSystemsDashboard() {
  const [summary, setSummary] = useState<LearningSummary | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [summaryRes, healthRes] = await Promise.all([
        fetch('/api/ai/learning-systems?type=summary'),
        fetch('/api/ai/learning-systems?type=health'),
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data);
      }
    } catch (error) {
      console.error('학습 시스템 데이터 로드 오류:', error);
      showToast({ type: 'error', message: '데이터를 불러올 수 없습니다' });
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return 'text-green-600 bg-green-50';
      case 'good':
        return 'text-blue-600 bg-blue-50';
      case 'fair':
        return 'text-yellow-600 bg-yellow-50';
      case 'poor':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'warning':
        return <AlertCircle className="text-yellow-600" size={20} />;
      case 'critical':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI 학습 시스템 대시보드</h2>
            <p className="text-sm text-gray-500">모든 AI 기능의 학습 상태 및 성능 모니터링</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* 전체 요약 */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">총 경험</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalExperiences.toLocaleString()}</p>
                  </div>
                  <Activity className="text-purple-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">평균 성능</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {(summary.averagePerformance * 100).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">학습 패턴</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalPatterns.toLocaleString()}</p>
                  </div>
                  <Zap className="text-yellow-600" size={24} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">시스템 상태</p>
                    <Badge className={getHealthColor(summary.overallHealth)}>
                      {summary.overallHealth === 'excellent' ? '우수' :
                       summary.overallHealth === 'good' ? '양호' :
                       summary.overallHealth === 'fair' ? '보통' : '개선 필요'}
                    </Badge>
                  </div>
                  <Target className="text-blue-600" size={24} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 학습 시스템별 통계 */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle>학습 시스템 통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">크로스 기능 학습</p>
                  <p className="text-xl font-bold">{summary.crossFeatureTransfers}</p>
                  <p className="text-xs text-gray-500">전이 패턴</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">강화 학습</p>
                  <p className="text-xl font-bold">{summary.reinforcementActions}</p>
                  <p className="text-xs text-gray-500">정책 수</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">적응형 학습</p>
                  <p className="text-xl font-bold">{summary.adaptiveStrategies}</p>
                  <p className="text-xs text-gray-500">전략 수</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">예측적 학습</p>
                  <p className="text-xl font-bold">{summary.predictions}</p>
                  <p className="text-xs text-gray-500">예측 수</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 시스템 건강 상태 */}
        {health && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                시스템 건강 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              {health.issues.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">발견된 문제:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {health.issues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                  {health.recommendations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">권장 사항:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                        {health.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-green-600">모든 시스템이 정상적으로 작동 중입니다.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 성능 차트 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              학습 성능 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              성능 차트 (구현 예정)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

