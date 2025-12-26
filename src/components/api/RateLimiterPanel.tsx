'use client';

import React, { useState } from 'react';
import { Gauge, Plus, Activity, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { rateLimiter, type RateLimitRule, type QuotaPlan } from '@/lib/api/rate-limiter';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function RateLimiterPanel() {
  const [rules, setRules] = useState<RateLimitRule[]>([]);
  const [plans, setPlans] = useState<QuotaPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'plans'>('rules');
  const [ruleName, setRuleName] = useState('');
  const [ruleLimit, setRuleLimit] = useState(100);
  const [ruleWindow, setRuleWindow] = useState(60);
  const [planName, setPlanName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setRules(rateLimiter.getAllRules());
    setPlans(rateLimiter.getAllPlans());
  }, []);

  const handleCreateRule = () => {
    if (!ruleName.trim()) {
      showToast({ type: 'warning', message: '규칙 이름을 입력해주세요' });
      return;
    }

    rateLimiter.createRule(ruleName, ruleLimit, ruleWindow);
    setRules(rateLimiter.getAllRules());
    setRuleName('');
    showToast({ type: 'success', message: 'Rate Limit 규칙이 생성되었습니다' });
  };

  const handleCreatePlan = () => {
    if (!planName.trim()) {
      showToast({ type: 'warning', message: '플랜 이름을 입력해주세요' });
      return;
    }

    rateLimiter.createQuotaPlan(planName, {
      requestsPerDay: 10000,
      requestsPerHour: 1000,
      requestsPerMinute: 100,
    });
    setPlans(rateLimiter.getAllPlans());
    setPlanName('');
    showToast({ type: 'success', message: '할당량 플랜이 생성되었습니다' });
  };

  const tabs = [
    { id: 'rules', label: 'Rate Limit 규칙' },
    { id: 'plans', label: '할당량 플랜' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Gauge className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Rate Limiting & 할당량</h2>
            <p className="text-sm text-gray-500">API 속도 제한 및 할당량 관리</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'rules' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Rate Limit 규칙 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="규칙 이름"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        제한 (요청 수)
                      </label>
                      <Input
                        type="number"
                        value={ruleLimit}
                        onChange={(e) => setRuleLimit(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        시간 창 (초)
                      </label>
                      <Input
                        type="number"
                        value={ruleWindow}
                        onChange={(e) => setRuleWindow(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleCreateRule} className="w-full">
                    <Plus size={18} className="mr-2" />
                    규칙 생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limit 규칙 목록</CardTitle>
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
                              {rule.enabled ? (
                                <Badge variant="success">활성화</Badge>
                              ) : (
                                <Badge variant="outline">비활성화</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Activity size={14} />
                                {rule.limit} 요청 / {rule.window}초
                              </span>
                              {rule.endpoint && (
                                <span>{rule.method || 'ALL'} {rule.endpoint}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>할당량 플랜 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="플랜 이름 (예: Basic, Pro, Enterprise)"
                  />
                  <Button variant="primary" onClick={handleCreatePlan} className="w-full">
                    <Plus size={18} className="mr-2" />
                    플랜 생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>할당량 플랜 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {plans.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    플랜이 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div key={plan.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Package size={20} className="text-gray-600" />
                            <h4 className="font-semibold text-gray-800">{plan.name}</h4>
                          </div>
                          {plan.price && (
                            <Badge variant="outline">${plan.price}/월</Badge>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {plan.limits.requestsPerDay && (
                            <div>
                              <span className="text-gray-600">일일 요청: </span>
                              <span className="font-medium">{plan.limits.requestsPerDay.toLocaleString()}</span>
                            </div>
                          )}
                          {plan.limits.requestsPerHour && (
                            <div>
                              <span className="text-gray-600">시간당 요청: </span>
                              <span className="font-medium">{plan.limits.requestsPerHour.toLocaleString()}</span>
                            </div>
                          )}
                          {plan.limits.storage && (
                            <div>
                              <span className="text-gray-600">스토리지: </span>
                              <span className="font-medium">{plan.limits.storage} MB</span>
                            </div>
                          )}
                          {plan.limits.dataTransfer && (
                            <div>
                              <span className="text-gray-600">데이터 전송: </span>
                              <span className="font-medium">{plan.limits.dataTransfer} MB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

