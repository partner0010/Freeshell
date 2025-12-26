'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { workflowManager, type WorkflowStep } from '@/lib/automation/workflow-manager';

interface WorkflowCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WorkflowCreateModal({ isOpen, onClose, onSuccess }: WorkflowCreateModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      showToast({ type: 'error', message: '워크플로우 이름을 입력하세요.' });
      return;
    }

    if (steps.length === 0) {
      showToast({ type: 'error', message: '최소 하나의 단계를 추가하세요.' });
      return;
    }

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, steps }),
      });

      if (response.ok) {
        showToast({ type: 'success', message: '워크플로우가 생성되었습니다.' });
        setName('');
        setDescription('');
        setSteps([]);
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        showToast({ type: 'error', message: data.error || '워크플로우 생성에 실패했습니다.' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: `워크플로우 생성 실패: ${error.message}` });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">새 워크플로우 생성</h2>
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none min-h-[100px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  단계
                </label>
                <button
                  onClick={handleAddStep}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  단계 추가
                </button>
              </div>

              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">단계 {index + 1}</span>
                      <button
                        onClick={() => handleRemoveStep(step.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <select
                      value={step.type}
                      onChange={(e) => {
                        const newSteps = [...steps];
                        newSteps[index] = { 
                          ...step, 
                          type: e.target.value as any,
                          config: step.config || {},
                        };
                        setSteps(newSteps);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                    >
                      <option value="agent">에이전트</option>
                      <option value="api">API 호출</option>
                      <option value="delay">지연</option>
                      <option value="notification">알림</option>
                      <option value="condition">조건 분기</option>
                    </select>
                    {step.type === 'agent' && (
                      <div className="space-y-2 mt-2">
                        <input
                          type="text"
                          placeholder="에이전트 ID"
                          value={step.config?.agentId || ''}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index] = {
                              ...step,
                              config: { ...step.config, agentId: e.target.value },
                            };
                            setSteps(newSteps);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <textarea
                          placeholder="작업 내용"
                          value={step.config?.task || ''}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index] = {
                              ...step,
                              config: { ...step.config, task: e.target.value },
                            };
                            setSteps(newSteps);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                        />
                      </div>
                    )}
                    {step.type === 'delay' && (
                      <input
                        type="number"
                        placeholder="지연 시간 (ms)"
                        value={step.config?.delay || ''}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index] = {
                            ...step,
                            config: { ...step.config, delay: Number(e.target.value) },
                          };
                          setSteps(newSteps);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mt-2"
                      />
                    )}
                    {step.type === 'notification' && (
                      <div className="space-y-2 mt-2">
                        <select
                          value={step.config?.type || 'info'}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index] = {
                              ...step,
                              config: { ...step.config, type: e.target.value },
                            };
                            setSteps(newSteps);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="info">정보</option>
                          <option value="success">성공</option>
                          <option value="warning">경고</option>
                          <option value="error">오류</option>
                        </select>
                        <textarea
                          placeholder="알림 메시지"
                          value={step.config?.message || ''}
                          onChange={(e) => {
                            const newSteps = [...steps];
                            newSteps[index] = {
                              ...step,
                              config: { ...step.config, message: e.target.value },
                            };
                            setSteps(newSteps);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[60px]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                생성
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

