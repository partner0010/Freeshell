'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Zap,
  Search,
  Accessibility,
  Code2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Play,
  Eye,
  Sparkles,
  FileCode,
  Server,
  Virus,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  auditWebsite,
  generateAIRecommendations,
  simulateChanges,
  type WebsiteAuditResult,
  type Recommendation,
} from '@/lib/audit/comprehensive-auditor';

const categories = [
  { id: 'overall', label: '전체', icon: TrendingUp },
  { id: 'security', label: '보안', icon: Shield },
  { id: 'performance', label: '성능', icon: Zap },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'accessibility', label: '접근성', icon: Accessibility },
  { id: 'codeQuality', label: '코드 품질', icon: Code2 },
  { id: 'bestPractices', label: '베스트 프랙티스', icon: CheckCircle2 },
];

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'high':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

export function WebsiteAuditor() {
  const [url, setUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<WebsiteAuditResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('overall');
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<WebsiteAuditResult | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);

  const handleAudit = async () => {
    if (!url.trim()) {
      alert('URL을 입력하세요');
      return;
    }
    setIsAuditing(true);
    try {
      const result = await auditWebsite(url);
      setAuditResult(result);
      const aiRecs = await generateAIRecommendations(result);
      setAiRecommendations(aiRecs);
    } catch (error) {
      alert(`감사 실패: ${error}`);
    } finally {
      setIsAuditing(false);
    }
  };
  const handleSimulate = (recommendation: Recommendation) => {
    if (!auditResult) return;
    const changes = [
      {
        type: recommendation.category,
        implementation: recommendation.code || recommendation.description,
      },
    ];
    const simulated = simulateChanges(auditResult, changes);
    setSimulatedResult(simulated);
    setShowSimulation(true);
  };
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">웹사이트 종합 감사</h2>
              <p className="text-sm text-gray-500">
                보안, 성능, SEO, 접근성 등 전 영역 검증 및 개선 제안
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            onKeyPress={(e) => e.key === 'Enter' && handleAudit()}
          />
          <button
            onClick={handleAudit}
            disabled={isAuditing || !url.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isAuditing ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                감사 중...
              </>
            ) : (
              <>
                <Play size={20} />
                감사 시작
              </>
            )}
          </button>
        </div>
      </div>

      {auditResult && (
        <div className="flex-1 overflow-auto">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">종합 점수</div>
                <div className="text-4xl font-bold text-gray-800">{auditResult.overallScore}/100</div>
              </div>
              <div className="flex items-center gap-4">
                {Object.entries(auditResult.categories).map(([key, category]) => {
                  const cat = categories.find((c) => c.id === key);
                  const Icon = cat?.icon || CheckCircle2;
                  return (
                    <div key={key} className="text-center">
                      <Icon size={20} className="mx-auto mb-1 text-gray-400" />
                      <div className="text-lg font-bold text-gray-800">{category.score}</div>
                      <div className="text-xs text-gray-500">{cat?.label || key}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-6 border-b">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const score =
                  cat.id === 'overall'
                    ? auditResult.overallScore
                    : auditResult.categories[cat.id as keyof typeof auditResult.categories]?.score || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                    {cat.label}
                    <span className="text-xs opacity-75">({score})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {selectedCategory !== 'overall' && (
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4">발견된 이슈</h3>
                <div className="space-y-3">
                  {auditResult.categories[
                    selectedCategory as keyof typeof auditResult.categories
                  ]?.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-4 border-2 rounded-xl ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-800">{issue.title}</div>
                        <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium">
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                      <div className="bg-white/80 rounded-lg p-3 mt-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1">해결 방법</div>
                        <p className="text-sm text-gray-800">{issue.fix}</p>
                        {issue.autoFixable && issue.fixedCode && (
                          <div className="mt-2">
                            <button className="px-3 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700">
                              자동 적용
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {auditResult.vulnerabilities.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  보안 취약점
                </h3>
                <div className="space-y-3">
                  {auditResult.vulnerabilities.map((vuln) => (
                    <div
                      key={vuln.id}
                      className={`p-4 border-2 rounded-xl ${getSeverityColor(vuln.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-800">{vuln.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {vuln.cwe && `CWE: ${vuln.cwe} • `}
                            {vuln.owasp && `OWASP: ${vuln.owasp} • `}
                            {vuln.cvss && `CVSS: ${vuln.cvss}`}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-white/50 rounded text-xs font-medium">
                          {vuln.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{vuln.description}</p>
                      <div className="bg-white/80 rounded-lg p-3 mt-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1">수정 방법</div>
                        <p className="text-sm text-gray-800">{vuln.remediation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {aiRecommendations.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles size={20} className="text-purple-600" />
                  AI 개선 제안
                </h3>
                <div className="space-y-3">
                  {aiRecommendations.map((rec) => (
                    <div key={rec.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-800">{rec.title}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            우선순위: {rec.priority} • 노력: {rec.effort}
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          AI 제안
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                      <div className="bg-white/80 rounded-lg p-3 mt-3 mb-3">
                        <div className="text-xs font-semibold text-gray-700 mb-1">예상 효과</div>
                        <p className="text-sm text-gray-800">{rec.impact}</p>
                      </div>
                      {rec.code && (
                        <details className="mt-3">
                          <summary className="text-xs text-gray-600 cursor-pointer mb-2">코드 보기</summary>
                          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                            {rec.code}
                          </pre>
                        </details>
                      )}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleSimulate(rec)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
                        >
                          <Eye size={16} />
                          시뮬레이션
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                          적용하기
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {auditResult.malwareScan && (
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Virus size={20} />
                  멀웨어 스캔
                </h3>
                <div
                  className={`p-4 rounded-xl border-2 ${
                    auditResult.malwareScan.clean
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {auditResult.malwareScan.clean ? (
                      <CheckCircle2 className="text-green-600" size={24} />
                    ) : (
                      <AlertTriangle className="text-red-600" size={24} />
                    )}
                    <div>
                      <div className="font-semibold text-gray-800">
                        {auditResult.malwareScan.clean ? '안전합니다' : '위협이 발견되었습니다'}
                      </div>
                      <div className="text-sm text-gray-600">
                        발견된 위협: {auditResult.malwareScan.threats.length}개
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {auditResult.serverSecurity && (
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Server size={20} />
                  서버 보안
                </h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white border rounded-xl">
                    <div className="font-semibold text-gray-800 mb-2">SSL/TLS</div>
                    <div className="text-sm text-gray-600">
                      등급: {auditResult.serverSecurity.ssl.grade || 'N/A'}
                      {auditResult.serverSecurity.ssl.valid ? (
                        <span className="text-green-600 ml-2">✓ 유효</span>
                      ) : (
                        <span className="text-red-600 ml-2">✗ 무효</span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-white border rounded-xl">
                    <div className="font-semibold text-gray-800 mb-2">보안 헤더</div>
                    <div className="space-y-2">
                      {auditResult.serverSecurity.headers.map((header, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{header.header}</span>
                          {header.present ? (
                            <CheckCircle2 className="text-green-600" size={16} />
                          ) : (
                            <X className="text-red-600" size={16} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showSimulation && simulatedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowSimulation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">변경 사항 시뮬레이션</h3>
                <button
                  onClick={() => setShowSimulation(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">현재 점수</h4>
                    <div className="space-y-2">
                      {Object.entries(auditResult!.categories).map(([key, cat]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{key}</span>
                          <span className="font-medium">{cat.score}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t font-bold">
                        전체: {auditResult!.overallScore}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">예상 점수</h4>
                    <div className="space-y-2">
                      {Object.entries(simulatedResult.categories).map(([key, cat]) => {
                        const original = auditResult!.categories[key as keyof typeof auditResult!.categories];
                        const diff = cat.score - original.score;
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{key}</span>
                            <span className="font-medium">
                              {cat.score}
                              {diff > 0 && (
                                <span className="text-green-600 ml-1">+{diff}</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t font-bold">
                        전체: {simulatedResult.overallScore}
                        {simulatedResult.overallScore > auditResult!.overallScore && (
                          <span className="text-green-600 ml-1">
                            +{simulatedResult.overallScore - auditResult!.overallScore}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  onClick={() => setShowSimulation(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
                >
                  닫기
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  변경사항 적용
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!auditResult && !isAuditing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Shield className="text-gray-300 mx-auto mb-4" size={64} />
            <p className="text-gray-500 text-lg mb-2">웹사이트를 감사하세요</p>
            <p className="text-gray-400 text-sm">
              URL을 입력하고 감사를 시작하면 보안, 성능, SEO 등을 종합적으로 검증합니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
