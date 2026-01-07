/**
 * 향상된 AI 엔진
 * 실제 AI 모델 통합 및 자율 학습 메커니즘
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execPromise = promisify(exec);

interface LearningData {
  prompt: string;
  response: string;
  feedback?: 'positive' | 'negative' | 'neutral';
  timestamp: number;
  context?: any;
}

interface ModelStats {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  averageResponseTime: number;
  lastUsed: number;
  performance: number; // 0-100
}

export class EnhancedAIEngine {
  private learningDatabase: Map<string, LearningData[]> = new Map();
  private modelStats: Map<string, ModelStats> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private improvementHistory: any[] = [];
  private learningRate: number = 0.1;
  private confidence: number = 0.5;

  constructor() {
    console.log('[EnhancedAIEngine] 향상된 AI 엔진 초기화');
    // 비동기 초기화는 별도로 처리 (생성자에서 await 불가)
    this.initializeModels().catch(err => {
      console.warn('[EnhancedAIEngine] 모델 초기화 실패:', err);
    });
    this.loadLearningData().catch(err => {
      console.warn('[EnhancedAIEngine] 학습 데이터 로드 실패:', err);
    });
  }

  /**
   * 실제 AI 모델 통합
   */
  private async initializeModels() {
    // 1. Ollama 모델 확인
    try {
      const { stdout } = await execPromise('ollama list');
      const models = stdout.split('\n').filter(line => line.trim() && !line.includes('NAME'));
      console.log('[EnhancedAIEngine] Ollama 모델:', models);
      
      for (const modelLine of models) {
        const modelName = modelLine.split(/\s+/)[0];
        if (modelName) {
          this.modelStats.set(modelName, {
            name: modelName,
            totalRequests: 0,
            successfulRequests: 0,
            averageResponseTime: 0,
            lastUsed: 0,
            performance: 50,
          });
        }
      }
    } catch (error) {
      console.warn('[EnhancedAIEngine] Ollama가 설치되지 않았거나 사용할 수 없습니다.');
    }

    // 2. Hugging Face 모델 준비
    this.modelStats.set('huggingface-gpt2', {
      name: 'huggingface-gpt2',
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      lastUsed: 0,
      performance: 50,
    });

    // 3. Google Gemini (API)
    this.modelStats.set('gemini-pro', {
      name: 'gemini-pro',
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      lastUsed: 0,
      performance: 50,
    });

    // 4. Groq (API)
    this.modelStats.set('groq-llama', {
      name: 'groq-llama',
      totalRequests: 0,
      successfulRequests: 0,
      averageResponseTime: 0,
      lastUsed: 0,
      performance: 50,
    });
  }

  /**
   * 실제 AI 응답 생성 (다중 모델 시도)
   */
  async generateResponse(prompt: string, options?: {
    useLearning?: boolean;
    useMultipleModels?: boolean;
    preferredModel?: string;
  }): Promise<{
    text: string;
    source: string;
    confidence: number;
    responseTime: number;
    modelsTried: string[];
    learningApplied: boolean;
  }> {
    const startTime = Date.now();
    const modelsTried: string[] = [];
    let learningApplied = false;

    // 1. 학습 데이터에서 유사한 응답 찾기
    if (options?.useLearning !== false) {
      const learnedResponse = this.findLearnedResponse(prompt);
      if (learnedResponse && learnedResponse.confidence > 0.7) {
        learningApplied = true;
        return {
          text: learnedResponse.response,
          source: 'learning',
          confidence: learnedResponse.confidence,
          responseTime: Date.now() - startTime,
          modelsTried: ['learning'],
          learningApplied: true,
        };
      }
    }

    // 2. 다중 모델 시도 (성능 순서대로)
    const models = this.getModelsByPerformance();
    if (options?.preferredModel) {
      models.unshift(options.preferredModel);
    }

    for (const modelName of models) {
      if (modelsTried.length >= 3) break; // 최대 3개 모델 시도

      try {
        const response = await this.callModel(modelName, prompt);
        if (response) {
          modelsTried.push(modelName);
          
          // 학습 데이터 저장
          this.saveLearningData(prompt, response, modelName);
          
          // 모델 성능 업데이트
          this.updateModelPerformance(modelName, Date.now() - startTime, true);

          return {
            text: response,
            source: modelName,
            confidence: this.calculateConfidence(response, prompt),
            responseTime: Date.now() - startTime,
            modelsTried,
            learningApplied,
          };
        }
      } catch (error) {
        console.warn(`[EnhancedAIEngine] ${modelName} 실패:`, error);
        this.updateModelPerformance(modelName, Date.now() - startTime, false);
        modelsTried.push(`${modelName} (failed)`);
      }
    }

    // 3. Fallback: 규칙 기반 지능형 응답
    const fallbackResponse = this.generateIntelligentFallback(prompt);
    this.saveLearningData(prompt, fallbackResponse, 'fallback');

    return {
      text: fallbackResponse,
      source: 'fallback',
      confidence: 0.5,
      responseTime: Date.now() - startTime,
      modelsTried,
      learningApplied,
    };
  }

  /**
   * 모델 호출
   */
  private async callModel(modelName: string, prompt: string): Promise<string | null> {
    if (modelName.startsWith('ollama-') || this.modelStats.has(modelName)) {
      // Ollama 모델
      try {
        const actualModelName = modelName.replace('ollama-', '') || 'llama2';
        const { stdout } = await execPromise(`ollama run ${actualModelName} "${prompt}"`);
        return stdout.trim();
      } catch (error) {
        return null;
      }
    }

    if (modelName === 'huggingface-gpt2') {
      // Hugging Face API
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/gpt2',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: prompt, max_length: 200 }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          return data[0]?.generated_text || null;
        }
      } catch (error) {
        return null;
      }
    }

    if (modelName === 'gemini-pro') {
      // Google Gemini API
      const apiKey = process.env.GOOGLE_API_KEY;
      if (apiKey) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 2048,
                },
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
          }
        } catch (error) {
          return null;
        }
      }
    }

    if (modelName === 'groq-llama') {
      // Groq API
      const apiKey = process.env.GROQ_API_KEY;
      if (apiKey) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.1-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 2000,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            return data.choices?.[0]?.message?.content || null;
          }
        } catch (error) {
          return null;
        }
      }
    }

    return null;
  }

  /**
   * 학습 데이터에서 유사한 응답 찾기
   */
  private findLearnedResponse(prompt: string): { response: string; confidence: number } | null {
    const promptKey = this.normalizePrompt(prompt);
    const learnedData = this.learningDatabase.get(promptKey);

    if (learnedData && learnedData.length > 0) {
      // 가장 최근의 긍정적 피드백 응답 찾기
      const positiveResponses = learnedData.filter(d => d.feedback === 'positive');
      if (positiveResponses.length > 0) {
        const bestResponse = positiveResponses[positiveResponses.length - 1];
        return {
          response: bestResponse.response,
          confidence: 0.8,
        };
      }

      // 최근 응답 사용
      const recentResponse = learnedData[learnedData.length - 1];
      return {
        response: recentResponse.response,
        confidence: 0.6,
      };
    }

    // 유사한 프롬프트 찾기
    for (const [key, data] of this.learningDatabase.entries()) {
      if (this.calculateSimilarity(prompt, key) > 0.7) {
        const bestResponse = data[data.length - 1];
        return {
          response: bestResponse.response,
          confidence: this.calculateSimilarity(prompt, key),
        };
      }
    }

    return null;
  }

  /**
   * 학습 데이터 저장
   */
  private saveLearningData(prompt: string, response: string, source: string) {
    const promptKey = this.normalizePrompt(prompt);
    
    if (!this.learningDatabase.has(promptKey)) {
      this.learningDatabase.set(promptKey, []);
    }

    const data: LearningData = {
      prompt,
      response,
      timestamp: Date.now(),
      context: { source },
    };

    this.learningDatabase.get(promptKey)!.push(data);
    this.persistLearningData();
  }

  /**
   * 학습 데이터 영구 저장
   */
  private async persistLearningData() {
    try {
      const dataDir = path.join(process.cwd(), '.ai-learning');
      await fs.mkdir(dataDir, { recursive: true });

      const data = Array.from(this.learningDatabase.entries()).map(([key, values]) => ({
        prompt: key,
        data: values,
      }));

      await fs.writeFile(
        path.join(dataDir, 'learning-data.json'),
        JSON.stringify(data, null, 2)
      );
    } catch (error) {
      console.warn('[EnhancedAIEngine] 학습 데이터 저장 실패:', error);
    }
  }

  /**
   * 학습 데이터 로드
   */
  private async loadLearningData() {
    try {
      const dataFile = path.join(process.cwd(), '.ai-learning', 'learning-data.json');
      const data = await fs.readFile(dataFile, 'utf-8');
      const parsed = JSON.parse(data);

      for (const item of parsed) {
        this.learningDatabase.set(item.prompt, item.data);
      }

      console.log(`[EnhancedAIEngine] ${this.learningDatabase.size}개의 학습 데이터 로드됨`);
    } catch (error) {
      console.log('[EnhancedAIEngine] 학습 데이터 없음, 새로 시작');
    }
  }

  /**
   * 프롬프트 정규화
   */
  private normalizePrompt(prompt: string): string {
    return prompt.toLowerCase().trim().substring(0, 200);
  }

  /**
   * 유사도 계산
   */
  private calculateSimilarity(prompt1: string, prompt2: string): number {
    const words1 = new Set(prompt1.toLowerCase().split(/\s+/));
    const words2 = new Set(prompt2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * 신뢰도 계산
   */
  private calculateConfidence(response: string, prompt: string): number {
    let confidence = 0.5;

    // 응답 길이
    if (response.length > 100) confidence += 0.1;
    if (response.length > 500) confidence += 0.1;

    // 프롬프트와의 관련성
    const promptWords = prompt.toLowerCase().split(/\s+/);
    const responseLower = response.toLowerCase();
    const matchedWords = promptWords.filter(word => 
      word.length > 2 && responseLower.includes(word)
    ).length;
    confidence += (matchedWords / promptWords.length) * 0.2;

    // 구조적 완성도
    if (response.includes('\n') || response.includes('.')) confidence += 0.1;

    return Math.min(1.0, confidence);
  }

  /**
   * 모델 성능 업데이트
   */
  private updateModelPerformance(modelName: string, responseTime: number, success: boolean) {
    const stats = this.modelStats.get(modelName);
    if (!stats) return;

    stats.totalRequests++;
    if (success) stats.successfulRequests++;
    
    // 평균 응답 시간 업데이트
    stats.averageResponseTime = 
      (stats.averageResponseTime * (stats.totalRequests - 1) + responseTime) / stats.totalRequests;
    
    stats.lastUsed = Date.now();
    
    // 성능 점수 계산
    const successRate = stats.successfulRequests / stats.totalRequests;
    const speedScore = Math.max(0, 100 - (stats.averageResponseTime / 10)); // 빠를수록 높음
    stats.performance = (successRate * 60 + speedScore * 0.4);

    this.modelStats.set(modelName, stats);
  }

  /**
   * 성능 순서대로 모델 가져오기
   */
  private getModelsByPerformance(): string[] {
    const models = Array.from(this.modelStats.entries())
      .sort((a, b) => b[1].performance - a[1].performance)
      .map(([name]) => name);
    
    return models;
  }

  /**
   * 지능형 Fallback 응답
   */
  private generateIntelligentFallback(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes('?') || lowerPrompt.includes('무엇') || lowerPrompt.includes('어떻게')) {
      return this.generateQuestionResponse(prompt);
    }

    if (lowerPrompt.includes('번역') || lowerPrompt.includes('translate')) {
      return this.generateTranslationResponse(prompt);
    }

    if (lowerPrompt.includes('코드') || lowerPrompt.includes('code')) {
      return this.generateCodeResponse(prompt);
    }

    return this.generateDefaultResponse(prompt);
  }

  private generateQuestionResponse(prompt: string): string {
    return `# ${prompt}에 대한 답변

## 개요
${prompt}에 대해 분석한 결과입니다.

## 주요 내용
이 주제는 여러 측면에서 접근할 수 있으며, 현재 최신 정보와 전문가 의견을 종합하면 다음과 같이 설명할 수 있습니다.

## 상세 설명
1. 핵심 개념
2. 주요 특징
3. 실용적 활용
4. 최신 동향

## 결론
${prompt}에 대한 포괄적인 답변을 제공했습니다.`;
  }

  private generateTranslationResponse(prompt: string): string {
    const match = prompt.match(/(?:번역|translate)[:\s]+(.+)/i);
    const text = match ? match[1].trim() : prompt;
    return `번역 결과: ${text}\n\n(더 정확한 번역을 원하시면 AI 모델을 설정해주세요.)`;
  }

  private generateCodeResponse(prompt: string): string {
    return `# 코드 예제

\`\`\`javascript
// ${prompt}에 대한 코드 예제
function example() {
  // 구현 코드
  return "result";
}
\`\`\`

## 설명
이 코드는 ${prompt}를 구현한 예제입니다.`;
  }

  private generateDefaultResponse(prompt: string): string {
    return `# ${prompt}에 대한 응답

## 개요
${prompt}에 대한 정보를 제공합니다.

## 주요 내용
이 주제에 대한 상세한 설명과 분석입니다.

## 결론
${prompt}에 대한 포괄적인 정보를 제공했습니다.`;
  }

  /**
   * 피드백 수집 및 학습
   */
  async provideFeedback(prompt: string, feedback: 'positive' | 'negative' | 'neutral') {
    const promptKey = this.normalizePrompt(prompt);
    const data = this.learningDatabase.get(promptKey);

    if (data && data.length > 0) {
      const lastResponse = data[data.length - 1];
      lastResponse.feedback = feedback;

      // 학습률 조정
      if (feedback === 'positive') {
        this.learningRate = Math.min(0.5, this.learningRate * 1.1);
        this.confidence = Math.min(1.0, this.confidence + 0.05);
      } else if (feedback === 'negative') {
        this.learningRate = Math.max(0.01, this.learningRate * 0.9);
        this.confidence = Math.max(0.1, this.confidence - 0.05);
      }

      this.persistLearningData();
    }
  }

  /**
   * 통계 가져오기
   */
  getStats() {
    return {
      learningDatabaseSize: this.learningDatabase.size,
      modelStats: Array.from(this.modelStats.values()),
      learningRate: this.learningRate,
      confidence: this.confidence,
      improvementHistory: this.improvementHistory.length,
    };
  }
}

export const enhancedAIEngine = new EnhancedAIEngine();

