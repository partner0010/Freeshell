/**
 * AI 비교 분석 시스템 (개선 버전)
 * 여러 AI들을 비교하여 차이점과 강점 분석
 */

export type AIProvider = 'chatgpt' | 'claude' | 'gemini' | 'cursor' | 'our';

export interface AIInfo {
  id: AIProvider;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const AVAILABLE_AIS: AIInfo[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'OpenAI의 대화형 AI',
    color: 'green',
    icon: '🤖',
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Anthropic의 안전한 AI',
    color: 'orange',
    icon: '🧠',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google의 멀티모달 AI',
    color: 'blue',
    icon: '💎',
  },
  {
    id: 'cursor',
    name: 'Cursor AI',
    description: '코드 생성 전문 AI',
    color: 'purple',
    icon: '⚡',
  },
  {
    id: 'our',
    name: '우리 AI',
    description: '자율 학습 AI',
    color: 'indigo',
    icon: '✨',
  },
];

export interface AIResponse {
  provider: AIProvider;
  response: string;
  responseTime: number;
  timestamp: number;
}

export interface MultiAIComparisonResult {
  testPrompt: string;
  selectedAIs: AIProvider[];
  responses: Record<AIProvider, AIResponse>;
  comparison: Record<string, any>;
  strengths: Record<AIProvider, string[]>;
  weaknesses: Record<AIProvider, string[]>;
  uniqueFeatures: Record<AIProvider, string[]>;
  overallWinner: AIProvider;
  score: Record<AIProvider, number>;
  detailedAnalysis: string;
}

// 기존 인터페이스는 하위 호환성을 위해 유지
export interface AIComparisonResult {
  testPrompt: string;
  cursorAIResponse: string;
  ourAIResponse: string;
  comparison: any;
  strengths: { cursor: string[]; our: string[] };
  weaknesses: { cursor: string[]; our: string[] };
  uniqueFeatures: { cursor: string[]; our: string[] };
  overallWinner: 'cursor' | 'our' | 'tie';
  score: { cursor: number; our: number };
  detailedAnalysis: string;
}

