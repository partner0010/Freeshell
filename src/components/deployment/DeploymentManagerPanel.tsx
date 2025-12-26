'use client';

import React, { useState } from 'react';
import { Rocket, Plus, Play, Globe, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { deploymentManager, type Deployment, type Domain } from '@/lib/deployment/deployment-manager';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function DeploymentManagerPanel() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [activeTab, setActiveTab] = useState<'deployments' | 'domains'>('deployments');
  const [deployName, setDeployName] = useState('');
  const [branch, setBranch] = useState('main');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'development'>('development');
  const [domainName, setDomainName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setDeployments(deploymentManager.getAllDeployments());
    setDomains(deploymentManager.getAllDomains());
  }, []);

  const environmentOptions = [
    { value: 'production', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'development', label: 'Development' },
  ];

  const handleCreateDeployment = () => {
    if (!deployName.trim()) {
      showToast({ type: 'warning', message: '배포 이름을 입력해주세요' });
      return;
    }

    const deployment = deploymentManager.createDeployment(deployName, branch, environment);
    setDeployments([...deployments, deployment]);
    setDeployName('');
    showToast({ type: 'success', message: '배포가 생성되었습니다' });
  };

  const handleStartDeployment = async (deploymentId: string) => {
    try {
      await deploymentManager.startDeployment(deploymentId);
      setDeployments(deploymentManager.getAllDeployments());
      showToast({ type: 'success', message: '배포가 시작되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '배포 중 오류가 발생했습니다' });
    }
  };

  const handleCreateDomain = () => {
    if (!domainName.trim()) {
      showToast({ type: 'warning', message: '도메인 이름을 입력해주세요' });
      return;
    }

    const domain = deploymentManager.createDomain(domainName);
    setDomains([...domains, domain]);
    setDomainName('');
    showToast({ type: 'success', message: '도메인이 추가되었습니다' });
  };

  const handleEnableSSL = (domainId: string) => {
    deploymentManager.enableSSL(domainId);
    setDomains(deploymentManager.getAllDomains());
    showToast({ type: 'success', message: 'SSL이 활성화되었습니다' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-700';
      case 'building':
      case 'deploying':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'deployments', label: '배포' },
    { id: 'domains', label: '도메인' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <Rocket className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">배포 관리</h2>
            <p className="text-sm text-gray-500">도메인 및 SSL 인증서 관리</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'deployments' ? (
          <>
            {/* 배포 생성 */}
            <Card>
              <CardHeader>
                <CardTitle>새 배포 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={deployName}
                    onChange={(e) => setDeployName(e.target.value)}
                    placeholder="배포 이름"
                  />
                  <Input
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="브랜치"
                  />
                  <Dropdown
                    options={environmentOptions}
                    value={environment}
                    onChange={(val) => setEnvironment(val as typeof environment)}
                  />
                  <Button variant="primary" onClick={handleCreateDeployment} className="w-full">
                    <Plus size={18} className="mr-2" />
                    배포 생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 배포 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>배포 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {deployments.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    배포가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deployments.map((deployment) => (
                      <div key={deployment.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{deployment.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {deployment.branch} · {deployment.environment}
                            </p>
                            {deployment.url && (
                              <a
                                href={deployment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:underline mt-1 block"
                              >
                                {deployment.url}
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getStatusColor(deployment.status)}>
                              {deployment.status}
                            </Badge>
                            {deployment.status === 'pending' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleStartDeployment(deployment.id)}
                              >
                                <Play size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                        {deployment.buildLog && (
                          <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded mt-3 overflow-auto">
                            {deployment.buildLog}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 도메인 추가 */}
            <Card>
              <CardHeader>
                <CardTitle>도메인 추가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    placeholder="example.com"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleCreateDomain}>
                    <Plus size={18} className="mr-2" />
                    추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 도메인 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>도메인 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {domains.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    도메인이 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {domains.map((domain) => (
                      <div key={domain.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Globe size={20} className="text-gray-600" />
                            <h4 className="font-semibold text-gray-800">{domain.name}</h4>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {domain.sslEnabled ? (
                            <Badge variant="success">
                              <Shield size={12} className="mr-1" />
                              SSL 활성화
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEnableSSL(domain.id)}
                            >
                              <Shield size={14} className="mr-1" />
                              SSL 활성화
                            </Button>
                          )}
                          {domain.dnsConfigured && (
                            <Badge variant="success">
                              <CheckCircle size={12} className="mr-1" />
                              DNS 설정됨
                            </Badge>
                          )}
                          {domain.cdnEnabled && (
                            <Badge variant="outline">CDN 활성화</Badge>
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

