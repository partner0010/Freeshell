'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { type WorkflowStep, type Workflow } from '@/lib/automation/workflow-manager';

interface WorkflowEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workflow: Workflow | null;
}

export function WorkflowEditModal({ isOpen, onClose, onSuccess, workflow }: WorkflowEditModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      setSteps(workflow.steps || []);
    }
  }, [workflow]);

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        id: `step-${Date.now()}`,
        type: 'agent',
        config: { agentId: '', task: '' },
      },
    ]);
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId));
  };

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const handleSubmit = async () => {
    if (!workflow) return;

    if (!name.trim()) {
      showToast({ type: 'error', message: '워크플로우 이름을 입력하세요.' });
      return;
    }

    if (steps.length === 0) {
      showToast({ type: 'error', message: '최소 하나의 단계를 추가하세요.' });
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflow.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, steps }),
      });

      if (response.ok) {
        showToast({ type: 'success', message: '워크플로우가 수정되었습니다.' });
        setName('');
        setDescription('');
        setSteps([]);
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        showToast({ type: 'error', message: data.error || '워크플로우 수정에 실패했습니다.' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: `워크플로우 수정 실패: ${error.message}` });
    }
  };

  if (!isOpen || !workflow) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">워크플로우 수정</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                워크플로우 이름
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 일일 리포트 생성"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="워크플로우에 대한 설명을 입력하세요"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-700">
                  단계
                </label>
                <button
                  onClick={handleAddStep}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  단계 추가
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        단계 {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={step.type}
                          onChange={(e) => handleUpdateStep(step.id, {
                            type: e.target.value as any,
                            config: step.config,
                          })}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="agent">에이전트</option>
                          <option value="api">API 호출</option>
                          <option value="delay">지연</option>
                          <option value="notification">알림</option>
                          <option value="condition">조건</option>
                        </select>
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {step.type === 'agent' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={step.config.agentId || ''}
                          onChange={(e) => handleUpdateStep(step.id, {
                            config: { ...step.config, agentId: e.target.value },
                          })}
                          placeholder="에이전트 ID"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={step.config.task || ''}
                          onChange={(e) => handleUpdateStep(step.id, {
                            config: { ...step.config, task: e.target.value },
                          })}
                          placeholder="작업 내용"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}

                    {step.type === 'delay' && (
                      <input
                        type="number"
                        value={step.config.delay || ''}
                        onChange={(e) => handleUpdateStep(step.id, {
                          config: { ...step.config, delay: parseInt(e.target.value) || 1000 },
                        })}
                        placeholder="지연 시간 (ms)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}

                    {step.type === 'notification' && (
                      <div className="space-y-2">
                        <select
                          value={step.config.type || 'info'}
                          onChange={(e) => handleUpdateStep(step.id, {
                            config: { ...step.config, type: e.target.value },
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="info">정보</option>
                          <option value="success">성공</option>
                          <option value="warning">경고</option>
                          <option value="error">오류</option>
                        </select>
                        <input
                          type="text"
                          value={step.config.message || ''}
                          onChange={(e) => handleUpdateStep(step.id, {
                            config: { ...step.config, message: e.target.value },
                          })}
                          placeholder="알림 메시지"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    )}

                    {step.type === 'api' && (
                      <div className="space-y-2">
                        <select
                          value={step.config.method || 'POST'}
                          onChange={(e) => handleUpdateStep(step.id, {
                            config: { ...step.config, method: e.target.value },
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="PUT">PUT</option>
                          <option value="DELETE">DELETE</option>
                        </select>
                        <input
                          type="text"
                          value={step.config.endpoint || ''}
                          onChange={(e) => handleUpdateStep(step.id, {
                            config: { ...step.config, endpoint: e.target.value },
                          })}
                          placeholder="API 엔드포인트"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <textarea
                          value={step.config.body ? JSON.stringify(step.config.body, null, 2) : ''}
                          onChange={(e) => {
                            try {
                              const body = e.target.value ? JSON.parse(e.target.value) : {};
                              handleUpdateStep(step.id, {
                                config: { ...step.config, body },
                              });
                            } catch (error) {
                              // JSON 파싱 오류는 무시
                            }
                          }}
                          placeholder="요청 본문 (JSON)"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              수정
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

