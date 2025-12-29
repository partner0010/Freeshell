'use client';

import { useState } from 'react';
import { Brain, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
}

const models: Model[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    description: '가장 강력한 언어 모델',
    icon: '🤖',
  },
  {
    id: 'claude-3',
    name: 'Claude 3',
    provider: 'Anthropic',
    description: '안전하고 정확한 응답',
    icon: '🧠',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    description: '멀티모달 처리 우수',
    icon: '💎',
  },
  {
    id: 'llama-2',
    name: 'Llama 2',
    provider: 'Meta',
    description: '오픈소스 대형 모델',
    icon: '🦙',
  },
  {
    id: 'mixtral',
    name: 'Mixtral 8x7B',
    provider: 'Mistral AI',
    description: '고성능 혼합 전문가 모델',
    icon: '🌟',
  },
];

export default function ModelSelector({ onSelect }: { onSelect?: (model: Model) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(models[0]);

  const handleSelect = (model: Model) => {
    setSelectedModel(model);
    setIsOpen(false);
    onSelect?.(model);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors"
      >
        <Brain className="w-4 h-4" />
        <span className="font-medium">{selectedModel.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20"
            >
              <div className="p-2">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedModel.id === model.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{model.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {model.provider} · {model.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

