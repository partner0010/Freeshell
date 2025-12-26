'use client';

import React, { useState } from 'react';
import { ShieldAlert, Plus, CheckCircle, XCircle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { contentModerator, type ModerationRule, type ModerationAction, type ModerationResult } from '@/lib/content/moderation';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function ModerationPanel() {
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [results, setResults] = useState<ModerationResult[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'test' | 'results'>('rules');
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<'keyword' | 'pattern' | 'ai'>('keyword');
  const [ruleAction, setRuleAction] = useState<ModerationAction>('flag');
  const [ruleSeverity, setRuleSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [keywords, setKeywords] = useState('');
  const [testContent, setTestContent] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setRules(contentModerator.getAllRules());
    setResults(contentModerator.getResults());
  }, []);

  const typeOptions = [
    { value: 'keyword', label: '키워드' },
    { value: 'pattern', label: '패턴 (정규식)' },
    { value: 'ai', label: 'AI 기반' },
  ];

  const actionOptions = [
    { value: 'allow', label: '허용' },
    { value: 'block', label: '차단' },
    { value: 'flag', label: '플래그' },
    { value: 'review', label: '검토 필요' },
  ];

  const severityOptions = [
    { value: 'low', label: '낮음' },
    { value: 'medium', label: '보통' },
    { value: 'high', label: '높음' },
    { value: 'critical', label: '심각' },
  ];

  const handleCreateRule = () => {
    if (!ruleName.trim()) {
      showToast({ type: 'warning', message: '규칙 이름을 입력해주세요' });
      return;
    }

    const keywordList = ruleType === 'keyword' && keywords.trim()
      ? keywords.split(',').map(k => k.trim())
      : undefined;

    contentModerator.createRule(
      ruleName,
      ruleType,
      ruleAction,
      ruleSeverity,
      ruleType === 'pattern' ? keywords : undefined,
      keywordList
    );
    setRules(contentModerator.getAllRules());
    setRuleName('');
    setKeywords('');
    showToast({ type: 'success', message: '모더레이션 규칙이 생성되었습니다' });
  };

  const handleTestModeration = async () => {
    if (!testContent.trim()) {
      showToast({ type: 'warning', message: '테스트할 콘텐츠를 입력해주세요' });
      return;
    }

    const result = await contentModerator.moderate(testContent);
    setResults(contentModerator.getResults());
    showToast({
      type: result.action === 'allow' ? 'success' : 'warning',
      message: `모더레이션 결과: ${result.action === 'allow' ? '허용' : result.action === 'block' ? '차단' : '플래그'}`
    });
  };

  const getSeverityColor = (severity: ModerationRule['severity']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const tabs = [
    { id: 'rules', label: '규칙 관리' },
    { id: 'test', label: '테스트' },
    { id: 'results', label: '결과 기록' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
            <ShieldAlert className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">콘텐츠 모더레이션</h2>
            <p className="text-sm text-gray-500">스팸 감지 및 부적절한 콘텐츠 필터링</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'rules' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>모더레이션 규칙 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="규칙 이름"
                  />
                  <Dropdown
                    options={typeOptions}
                    value={ruleType}
                    onChange={(val) => setRuleType(val as typeof ruleType)}
                    placeholder="규칙 유형"
                  />
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={ruleType === 'keyword' ? '키워드 (쉼표로 구분)' : '정규식 패턴'}
                  />
                  <Dropdown
                    options={actionOptions}
                    value={ruleAction}
                    onChange={(val) => setRuleAction(val as ModerationAction)}
                    placeholder="조치"
                  />
                  <Dropdown
                    options={severityOptions}
                    value={ruleSeverity}
                    onChange={(val) => setRuleSeverity(val as typeof ruleSeverity)}
                    placeholder="심각도"
                  />
                  <Button variant="primary" onClick={handleCreateRule} className="w-full">
                    <Plus size={18} className="mr-2" />
                    규칙 생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>모더레이션 규칙 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {rules.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    규칙이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rules.map((rule) => (
                      <div key={rule.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-800">{rule.name}</h4>
                              <Badge className={getSeverityColor(rule.severity)}>
                                {rule.severity}
                              </Badge>
                              <Badge variant="outline">{rule.type}</Badge>
                              {rule.enabled ? (
                                <CheckCircle className="text-green-500" size={16} />
                              ) : (
                                <XCircle className="text-gray-400" size={16} />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              조치: <span className="font-medium">{rule.action}</span>
                              {rule.keywords && rule.keywords.length > 0 && (
                                <> · 키워드: {rule.keywords.join(', ')}</>
                              )}
                              {rule.pattern && <> · 패턴: {rule.pattern}</>}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : activeTab === 'test' ? (
          <Card>
            <CardHeader>
              <CardTitle>콘텐츠 모더레이션 테스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <textarea
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder="테스트할 콘텐츠를 입력하세요..."
                  className="w-full p-3 border rounded-lg min-h-[200px]"
                />
                <Button variant="primary" onClick={handleTestModeration} className="w-full">
                  <Flag size={18} className="mr-2" />
                  모더레이션 테스트
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>모더레이션 결과 기록</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  결과 기록이 없습니다
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((result) => (
                    <div key={result.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(result.severity)}>
                            {result.severity}
                          </Badge>
                          <Badge variant="outline">{result.action}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{result.content}...</p>
                      <p className="text-xs text-gray-600">사유: {result.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

