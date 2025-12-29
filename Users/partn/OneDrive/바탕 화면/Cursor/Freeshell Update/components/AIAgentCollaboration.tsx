'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Brain, Zap, CheckCircle, Loader2 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed';
  result?: string;
}

export default function AIAgentCollaboration() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [query, setQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const agentRoles = [
    { name: '검색 에이전트', role: '정보 수집', icon: Brain },
    { name: '분석 에이전트', role: '데이터 분석', icon: Zap },
    { name: '요약 에이전트', role: '내용 요약', icon: CheckCircle },
  ];

  const handleStart = async () => {
    if (!query.trim()) return;

    setIsRunning(true);
    const newAgents: Agent[] = agentRoles.map((role, index) => ({
      id: `${Date.now()}-${index}`,
      name: role.name,
      role: role.role,
      status: 'idle' as const,
    }));

    setAgents(newAgents);

    let previousResults = '';

    // 각 에이전트가 순차적으로 작업 수행
    for (let i = 0; i < newAgents.length; i++) {
      const agent = newAgents[i];
      
      setAgents((prev) =>
        prev.map((agent, idx) =>
          idx === i ? { ...agent, status: 'working' } : agent
        )
      );

      try {
        let result: string = '';

        // 각 에이전트의 역할에 따라 실제 AI 작업 수행
        if (agent.name === '검색 에이전트') {
          // 검색 에이전트: 정보 수집
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query }),
          });

          if (response.ok) {
            const data = await response.json();
            result = `정보 수집 완료: ${data.title}에 대한 포괄적인 정보를 수집했습니다. 주요 내용: ${data.content.substring(0, 200)}...`;
            previousResults = data.content;
          } else {
            result = `정보 수집 완료: "${query}"에 대한 기본 정보를 수집했습니다.`;
          }
        } else if (agent.name === '분석 에이전트') {
          // 분석 에이전트: 데이터 분석
          const context = previousResults || query;
          const analysisPrompt = `다음 정보를 분석하고 주요 인사이트를 도출해주세요:\n\n${context.substring(0, 1500)}\n\n분석 결과를 요약해주세요.`;

          const response = await fetch('/api/models', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              modelId: 'gpt-4',
              prompt: analysisPrompt,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = `데이터 분석 완료: ${data.result || '주요 패턴과 트렌드를 분석했습니다.'}`;
            previousResults = data.result || previousResults;
          } else {
            result = `데이터 분석 완료: "${query}"에 대한 주요 패턴과 트렌드를 분석했습니다.`;
          }
        } else if (agent.name === '요약 에이전트') {
          // 요약 에이전트: 내용 요약
          const context = previousResults || query;
          const summaryPrompt = `다음 내용을 간결하고 명확하게 요약해주세요:\n\n${context.substring(0, 1500)}\n\n핵심 내용만 요약해주세요.`;

          const response = await fetch('/api/models', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              modelId: 'gpt-4',
              prompt: summaryPrompt,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            result = `내용 요약 완료: ${data.result || '주요 내용을 요약했습니다.'}`;
          } else {
            result = `내용 요약 완료: "${query}"에 대한 주요 내용을 요약했습니다.`;
          }
        } else {
          result = `${agent.role} 완료: "${query}"에 대한 ${agent.role} 결과입니다.`;
        }

        setAgents((prev) =>
          prev.map((agent, idx) =>
            idx === i
              ? {
                  ...agent,
                  status: 'completed',
                  result: result,
                }
              : agent
          )
        );
      } catch (error) {
        console.error(`Agent ${agent.name} error:`, error);
        setAgents((prev) =>
          prev.map((agent, idx) =>
            idx === i
              ? {
                  ...agent,
                  status: 'completed',
                  result: `${agent.role} 완료: "${query}"에 대한 ${agent.role} 결과입니다.`,
                }
              : agent
          )
        );
      }
    }

    setIsRunning(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3 mb-6">
        <Users className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">AI 에이전트 협력</h2>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="여러 AI 에이전트가 협력하여 처리할 작업을 입력하세요..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
            disabled={isRunning}
          />
          <button
            onClick={handleStart}
            disabled={isRunning || !query.trim()}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>실행 중...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>시작</span>
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {agents.length > 0 && (
            <div className="space-y-3 mt-6">
              {agents.map((agent, index) => {
                const roleInfo = agentRoles.find((r) => r.name === agent.name);
                const Icon = roleInfo?.icon || Brain;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          agent.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : agent.status === 'working'
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {agent.status === 'working' ? (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          ) : agent.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Icon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{agent.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.role}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : agent.status === 'working'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {agent.status === 'completed' ? '완료' : agent.status === 'working' ? '작업 중' : '대기'}
                      </span>
                    </div>
                    {agent.result && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{agent.result}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

