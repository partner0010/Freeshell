'use client';

import React, { useState } from 'react';
import { Flag, Plus, ToggleLeft, ToggleRight, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { featureFlagsManager, type FeatureFlag, type RolloutStrategy } from '@/lib/features/feature-flags';
import { useToast } from '@/components/ui/Toast';

export function FeatureFlagsPanel() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [flagName, setFlagName] = useState('');
  const [flagDescription, setFlagDescription] = useState('');
  const [strategy, setStrategy] = useState<RolloutStrategy>('all');
  const [percentage, setPercentage] = useState(50);
  const { showToast } = useToast();

  React.useEffect(() => {
    setFlags(featureFlagsManager.getAllFlags());
  }, []);

  const strategyOptions = [
    { value: 'all', label: '전체 활성화' },
    { value: 'percentage', label: '퍼센트 롤아웃' },
    { value: 'canary', label: '카나리 배포' },
    { value: 'custom', label: '커스텀' },
  ];

  const handleCreateFlag = () => {
    if (!flagName.trim()) {
      showToast({ type: 'warning', message: 'Flag 이름을 입력해주세요' });
      return;
    }

    const flag = featureFlagsManager.createFlag(flagName, flagDescription);
    setFlags([...flags, flag]);
    setSelectedFlag(flag);
    setFlagName('');
    setFlagDescription('');
    showToast({ type: 'success', message: 'Feature Flag가 생성되었습니다' });
  };

  const handleToggleFlag = (id: string, enabled: boolean) => {
    featureFlagsManager.toggleFlag(id, enabled);
    setFlags(featureFlagsManager.getAllFlags());
    if (selectedFlag?.id === id) {
      setSelectedFlag(featureFlagsManager.getFlag(id) || null);
    }
    showToast({ type: 'success', message: enabled ? 'Flag가 활성화되었습니다' : 'Flag가 비활성화되었습니다' });
  };

  const handleUpdateStrategy = () => {
    if (!selectedFlag) return;

    featureFlagsManager.updateStrategy(
      selectedFlag.id,
      strategy,
      strategy === 'percentage' ? percentage : undefined
    );
    setFlags(featureFlagsManager.getAllFlags());
    setSelectedFlag(featureFlagsManager.getFlag(selectedFlag.id) || null);
    showToast({ type: 'success', message: '전략이 업데이트되었습니다' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Flag className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Feature Flags</h2>
            <p className="text-sm text-gray-500">기능 토글 및 점진적 롤아웃 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* Flag 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 Feature Flag 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={flagName}
                onChange={(e) => setFlagName(e.target.value)}
                placeholder="Flag 이름"
              />
              <Input
                value={flagDescription}
                onChange={(e) => setFlagDescription(e.target.value)}
                placeholder="설명 (선택사항)"
              />
              <Button variant="primary" onClick={handleCreateFlag} className="w-full">
                <Plus size={18} className="mr-2" />
                Flag 생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Flag 목록 */}
        {flags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Feature Flag 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {flags.map((flag) => (
                  <div
                    key={flag.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFlag?.id === flag.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedFlag(flag)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{flag.name}</h4>
                          {flag.enabled ? (
                            <Badge variant="success">활성화</Badge>
                          ) : (
                            <Badge variant="outline">비활성화</Badge>
                          )}
                          <Badge variant="outline" size="sm">{flag.strategy}</Badge>
                        </div>
                        {flag.description && (
                          <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{flag.environment}</span>
                          {flag.strategy === 'percentage' && flag.percentage !== undefined && (
                            <span>{flag.percentage}% 롤아웃</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFlag(flag.id, !flag.enabled);
                        }}
                      >
                        {flag.enabled ? (
                          <ToggleRight className="text-green-500" size={18} />
                        ) : (
                          <ToggleLeft className="text-gray-400" size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 선택된 Flag 상세 */}
        {selectedFlag && (
          <Card>
            <CardHeader>
              <CardTitle>Flag 설정: {selectedFlag.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Rollout 전략
                  </label>
                  <Dropdown
                    options={strategyOptions}
                    value={strategy}
                    onChange={(val) => setStrategy(val as RolloutStrategy)}
                    placeholder="전략 선택"
                  />
                </div>
                {strategy === 'percentage' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      롤아웃 퍼센트
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => setPercentage(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium w-12">{percentage}%</span>
                    </div>
                  </div>
                )}
                <Button variant="primary" onClick={handleUpdateStrategy} className="w-full">
                  <Target size={18} className="mr-2" />
                  전략 업데이트
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

