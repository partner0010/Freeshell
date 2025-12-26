'use client';

import React, { useState } from 'react';
import { GitBranch, Plus, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { workflowBuilder, type Workflow } from '@/lib/workflow/workflow-builder';
import { useToast } from '@/components/ui/Toast';

export function WorkflowBuilderPanel() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setWorkflows(workflowBuilder.getAllWorkflows());
  }, []);

  const handleCreateWorkflow = () => {
    if (!workflowName.trim()) {
      showToast({ type: 'warning', message: '워크플로우 이름을 입력하세요' });
      return;
    }

    const workflow = workflowBuilder.createWorkflow(workflowName);
    setWorkflows([...workflows, workflow]);
    setSelectedWorkflow(workflow);
    setWorkflowName('');
    showToast({ type: 'success', message: '워크플로우가 생성되었습니다' });
  };

  const handleExecute = async () => {
    if (!selectedWorkflow) return;

    try {
      await workflowBuilder.executeWorkflow(selectedWorkflow.id);
      showToast({ type: 'success', message: '워크플로우가 실행되었습니다' });
    } catch (error) {
      showToast({ type: 'error', message: '워크플로우 실행 중 오류가 발생했습니다' });
    }
  };

  const handleDelete = (id: string) => {
    workflowBuilder.deleteWorkflow(id);
    setWorkflows(workflows.filter((w) => w.id !== id));
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(null);
    }
    showToast({ type: 'success', message: '워크플로우가 삭제되었습니다' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <GitBranch className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">워크플로우 빌더</h2>
            <p className="text-sm text-gray-500">자동화 워크플로우 생성 및 관리</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 워크플로우 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 워크플로우 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder="워크플로우 이름"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleCreateWorkflow}>
                <Plus size={18} className="mr-2" />
                생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 워크플로우 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>워크플로우 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {workflows.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                워크플로우가 없습니다. 새로 생성해보세요.
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedWorkflow?.id === workflow.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{workflow.name}</h4>
                        {workflow.description && (
                          <p className="text-sm text-gray-500">{workflow.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          노드: {workflow.nodes.length}개
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute();
                          }}
                        >
                          <Play size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(workflow.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 선택된 워크플로우 상세 */}
        {selectedWorkflow && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedWorkflow.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {selectedWorkflow.enabled ? (
                      <span className="text-green-600">활성화</span>
                    ) : (
                      <span className="text-gray-400">비활성화</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    노드 구성
                  </label>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <GitBranch className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-sm text-gray-500">
                        시각적 워크플로우 에디터 (구현 필요)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        노드: {selectedWorkflow.nodes.length}개
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

