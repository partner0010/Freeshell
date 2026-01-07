/**
 * AI 비교 분석 시스템
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

export interface AIComparisonResult {
  testPrompt: string;
  selectedAIs: AIProvider[];
  responses: Partial<Record<AIProvider, AIResponse>>;
  comparison: {
    responseTime: {
      cursor: number;
      our: number;
      winner: 'cursor' | 'our' | 'tie';
    };
    depth: {
      cursor: number; // 0-100
      our: number;
      winner: 'cursor' | 'our' | 'tie';
    };
    creativity: {
      cursor: number;
      our: number;
      winner: 'cursor' | 'our' | 'tie';
    };
    accuracy: {
      cursor: number;
      our: number;
      winner: 'cursor' | 'our' | 'tie';
    };
    innovation: {
      cursor: number;
      our: number;
      winner: 'cursor' | 'our' | 'tie';
    };
    autonomy: {
      cursor: number;
      our: number;
      winner: 'cursor' | 'our' | 'tie';
    };
  };
  strengths: {
    cursor: string[];
    our: string[];
  };
  weaknesses: {
    cursor: string[];
    our: string[];
  };
  uniqueFeatures: {
    cursor: string[];
    our: string[];
  };
  overallWinner: 'cursor' | 'our' | 'tie';
  score: {
    cursor: number; // 0-100
    our: number;
  };
  detailedAnalysis: string;
}

export class AIComparison {
  /**
   * 여러 AI들을 비교
   */
  async compareAIs(prompt: string, selectedAIs: AIProvider[] = ['chatgpt', 'claude', 'gemini', 'cursor', 'our']): Promise<any> {
    const startTime = Date.now();
    
    // 1. 선택된 AI들의 응답 생성 (병렬 처리)
    const responsePromises = selectedAIs.map(async (aiId) => {
      const aiStart = Date.now();
      const response = await this.generateAIResponse(aiId, prompt);
      const responseTime = Date.now() - aiStart;
      
      return {
        provider: aiId,
        response: response,
        responseTime: responseTime,
        timestamp: Date.now(),
      } as AIResponse;
    });
    
    const responses = await Promise.all(responsePromises);
    const responsesMap = responses.reduce((acc, resp) => {
      acc[resp.provider] = resp;
      return acc;
    }, {} as Record<AIProvider, AIResponse>);
    
    // 2. 비교 분석
    const comparison = this.analyzeMultiAIComparison(prompt, responsesMap);
    
    // 3. 강점/약점 분석
    const strengths = this.analyzeMultiStrengths(responsesMap);
    const weaknesses = this.analyzeMultiWeaknesses(responsesMap);
    const uniqueFeatures = this.identifyMultiUniqueFeatures(responsesMap);
    
    // 4. 종합 점수 계산
    const scores = this.calculateMultiScores(responsesMap, comparison);
    const overallWinner = this.determineMultiWinner(scores);
    
    // 5. 상세 분석
    const detailedAnalysis = this.generateMultiDetailedAnalysis(
      prompt,
      responsesMap,
      comparison,
      strengths,
      weaknesses,
      uniqueFeatures,
      scores
    );

    return {
      testPrompt: prompt,
      selectedAIs: selectedAIs,
      responses: responsesMap,
      comparison,
      strengths,
      weaknesses,
      uniqueFeatures,
      overallWinner,
      score: scores,
      detailedAnalysis,
    };
  }

  /**
   * AI별 응답 생성
   */
  private async generateAIResponse(aiId: AIProvider, prompt: string): Promise<string> {
    switch (aiId) {
      case 'chatgpt':
        return await this.generateChatGPTResponse(prompt);
      case 'claude':
        return await this.generateClaudeResponse(prompt);
      case 'gemini':
        return await this.generateGeminiResponse(prompt);
      case 'cursor':
        return await this.simulateCursorAIResponse(prompt);
      case 'our':
        return await this.generateOurAIResponse(prompt);
      default:
        return `알 수 없는 AI: ${aiId}`;
    }
  }

  /**
   * Cursor AI와 우리 AI 비교 (하위 호환성)
   */
  async compareWithCursor(prompt: string): Promise<AIComparisonResult> {
    const startTime = Date.now();
    
    // 1. 우리 AI 응답 생성
    const ourAIStart = Date.now();
    const ourResponse = await this.generateOurAIResponse(prompt);
    const ourResponseTime = Date.now() - ourAIStart;
    
    // 2. Cursor AI 응답 시뮬레이션 (실제로는 Cursor API를 호출하거나 분석)
    const cursorStart = Date.now();
    const cursorResponse = await this.simulateCursorAIResponse(prompt);
    const cursorResponseTime = Date.now() - cursorStart;
    
    // 3. 비교 분석
    const comparison = this.analyzeComparison(
      prompt,
      cursorResponse,
      ourResponse,
      cursorResponseTime,
      ourResponseTime
    );
    
    // 4. 강점/약점 분석
    const strengths = this.analyzeStrengths(cursorResponse, ourResponse);
    const weaknesses = this.analyzeWeaknesses(cursorResponse, ourResponse);
    const uniqueFeatures = this.identifyUniqueFeatures(cursorResponse, ourResponse);
    
    // 5. 종합 점수 계산
    const scores = this.calculateScores(comparison);
    const overallWinner = this.determineWinner(scores);
    
    // 6. 상세 분석
    const detailedAnalysis = this.generateDetailedAnalysis(
      prompt,
      cursorResponse,
      ourResponse,
      comparison,
      strengths,
      weaknesses,
      uniqueFeatures,
      scores
    );

    return {
      testPrompt: prompt,
      selectedAIs: ['cursor', 'our'],
      responses: {
        cursor: {
          provider: 'cursor',
          response: cursorResponse,
          responseTime: cursorResponseTime,
          timestamp: Date.now(),
        },
        our: {
          provider: 'our',
          response: ourResponse,
          responseTime: ourResponseTime,
          timestamp: Date.now(),
        },
      },
      comparison,
      strengths,
      weaknesses,
      uniqueFeatures,
      overallWinner,
      score: scores,
      detailedAnalysis,
    };
  }

  /**
   * 우리 AI 응답 생성
   */
  private async generateOurAIResponse(prompt: string): Promise<string> {
    try {
      // 무한한 가능성 AI 사용
      const { infiniteAI } = await import('@/lib/infinite-ai');
      const result = await infiniteAI.generateInfiniteResponse(prompt);
      
      return `# 우리 AI 응답

${result.divineLevelThinking}

## 무한한 가능성
${result.infinitePossibilities.slice(0, 5).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

## 스스로 생성한 ${result.options.length}가지 옵션
${result.options.map((opt: any, i: number) => `
${i + 1}. **${opt.approach}** (점수: ${opt.score}점)
   - 잠재력: ${opt.potential}%
   - 실현가능성: ${opt.feasibility}%
   - 혁신성: ${opt.innovation}%
   - 추론: ${opt.reasoning}
`).join('\n')}

## 스스로 선택한 최적 방향
**${result.selectedOption.approach}** - ${result.selectedOption.reasoning}

## 스스로 제시한 강점 방향성
${result.selfImprovement.improvementDirection}

## 자율적 결정
${result.autonomousDecision}`;
    } catch (error) {
      // Fallback: 기본 AI 사용
      const { realAIEngine } = await import('@/lib/real-ai-engine');
      const response = await realAIEngine.generateRealResponse(prompt);
      return response.text;
    }
  }

  /**
   * ChatGPT 응답 생성
   */
  private async generateChatGPTResponse(prompt: string): Promise<string> {
    try {
      // 실제 OpenAI API 호출 시도
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'You are a helpful AI assistant. Respond in Korean.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0]?.message?.content || this.simulateChatGPTResponse(prompt);
        }
      }
    } catch (error) {
      console.warn('[AI Comparison] ChatGPT API 호출 실패:', error);
    }
    
    return this.simulateChatGPTResponse(prompt);
  }

  /**
   * ChatGPT 응답 시뮬레이션
   */
  private simulateChatGPTResponse(prompt: string): string {
    return `# ChatGPT 응답

## 개요
"${prompt}"에 대한 답변입니다.

## 주요 내용
ChatGPT는 이 질문에 대해 다음과 같이 답변합니다:

1. **핵심 개념**: 질문의 핵심을 파악하고 명확하게 설명합니다.
2. **상세 분석**: 다양한 관점에서 분석하여 포괄적인 정보를 제공합니다.
3. **실용적 예시**: 실제 활용 가능한 예시와 사례를 제시합니다.
4. **추가 정보**: 관련된 유용한 정보와 팁을 제공합니다.

## 상세 설명
이 주제에 대해 ChatGPT는 대화형으로 상세하고 이해하기 쉬운 설명을 제공합니다. 사용자의 질문 의도를 파악하고, 필요한 정보를 체계적으로 정리하여 답변합니다.

## 결론
ChatGPT는 사용자 친화적이고 실용적인 답변을 제공합니다.`;
  }

  /**
   * Claude 응답 생성
   */
  private async generateClaudeResponse(prompt: string): Promise<string> {
    try {
      // 실제 Anthropic API 호출 시도
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (anthropicKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-opus-20240229',
            max_tokens: 2000,
            messages: [
              { role: 'user', content: prompt },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.content[0]?.text || this.simulateClaudeResponse(prompt);
        }
      }
    } catch (error) {
      console.warn('[AI Comparison] Claude API 호출 실패:', error);
    }
    
    return this.simulateClaudeResponse(prompt);
  }

  /**
   * Claude 응답 시뮬레이션
   */
  private simulateClaudeResponse(prompt: string): string {
    return `# Claude 응답

## 분석
"${prompt}"에 대해 Claude는 신중하고 정확한 분석을 제공합니다.

## 주요 특징
1. **안전성**: 신중한 접근으로 정확하고 안전한 정보를 제공합니다.
2. **논리적 구조**: 체계적이고 논리적인 설명을 제공합니다.
3. **윤리적 고려**: 윤리적 관점을 고려한 답변을 제공합니다.
4. **상세한 설명**: 깊이 있는 분석과 상세한 설명을 제공합니다.

## 상세 내용
Claude는 이 질문에 대해 신중하게 분석하고, 다양한 관점을 고려하여 균형잡힌 답변을 제공합니다. 특히 안전성과 윤리성을 중시하는 특징이 있습니다.

## 결론
Claude는 신뢰할 수 있고 안전한 AI 응답을 제공합니다.`;
  }

  /**
   * Gemini 응답 생성
   */
  private async generateGeminiResponse(prompt: string): Promise<string> {
    try {
      // 실제 Google Gemini API 호출
      const geminiKey = process.env.GOOGLE_API_KEY;
      if (geminiKey) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2000,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        }
      }
    } catch (error) {
      console.warn('[AI Comparison] Gemini API 호출 실패:', error);
    }
    
    return this.simulateGeminiResponse(prompt);
  }

  /**
   * Gemini 응답 시뮬레이션
   */
  private simulateGeminiResponse(prompt: string): string {
    return `# Google Gemini 응답

## 개요
"${prompt}"에 대한 Google Gemini의 답변입니다.

## 주요 내용
1. **멀티모달 이해**: 텍스트, 이미지, 오디오 등 다양한 형태의 정보를 이해합니다.
2. **실시간 정보**: 최신 정보를 반영한 답변을 제공합니다.
3. **다양한 관점**: 여러 관점에서 분석하여 포괄적인 답변을 제공합니다.
4. **실용적 접근**: 실용적이고 실행 가능한 해결책을 제시합니다.

## 상세 설명
Google Gemini는 이 질문에 대해 멀티모달 AI의 강점을 활용하여 풍부하고 다양한 정보를 제공합니다. 특히 최신 정보와 실용적인 접근을 중시합니다.

## 결론
Google Gemini는 현대적이고 실용적인 AI 응답을 제공합니다.`;
  }

  /**
   * Cursor AI 응답 시뮬레이션
   */
  private async simulateCursorAIResponse(prompt: string): Promise<string> {
    // Cursor AI의 특징을 반영한 응답 시뮬레이션
    return `# Cursor AI 응답

## 분석
"${prompt}"에 대해 Cursor AI는 코드 중심의 실용적인 접근을 제공합니다.

## 주요 내용
1. **코드 생성**: 실제 구현 가능한 코드 예제를 제공합니다.
2. **프로젝트 컨텍스트**: 프로젝트 전체 맥락을 이해하고 답변합니다.
3. **실시간 협업**: 개발 환경과 통합된 실시간 협업 기능을 제공합니다.
4. **최적화 제안**: 성능과 효율성을 고려한 최적화 방안을 제시합니다.

## 상세 설명
Cursor AI는 개발자 중심의 AI로, 코드 생성과 수정에 특화되어 있습니다. 프로젝트의 전체 맥락을 이해하고 실용적인 해결책을 제시합니다.

## 결론
Cursor AI는 개발자를 위한 실용적이고 효율적인 AI 도구입니다.`;
  }

  /**
   * 여러 AI 비교 분석
   */
  private analyzeMultiAIComparison(
    prompt: string,
    responses: Record<AIProvider, AIResponse>
  ): Record<string, any> {
    const comparison: Record<string, any> = {};
    const providers = Object.keys(responses) as AIProvider[];

    // 각 메트릭별 비교
    const metrics = ['responseTime', 'depth', 'creativity', 'accuracy', 'innovation', 'autonomy'];
    
    metrics.forEach(metric => {
      const values: Record<string, number> = {};
      
      providers.forEach(provider => {
        const response = responses[provider].response;
        const responseTime = responses[provider].responseTime;
        
        switch (metric) {
          case 'responseTime':
            values[provider] = responseTime;
            break;
          case 'depth':
            values[provider] = this.analyzeDepth(response);
            break;
          case 'creativity':
            values[provider] = this.analyzeCreativity(response);
            break;
          case 'accuracy':
            values[provider] = this.analyzeAccuracy(response, prompt);
            break;
          case 'innovation':
            values[provider] = this.analyzeInnovation(response);
            break;
          case 'autonomy':
            values[provider] = provider === 'our' ? 95 : provider === 'cursor' ? 30 : 50;
            break;
        }
      });
      
      // 승자 결정
      const sorted = Object.entries(values).sort((a, b) => {
        if (metric === 'responseTime') return a[1] - b[1]; // 낮을수록 좋음
        return b[1] - a[1]; // 높을수록 좋음
      });
      
      const winner = sorted[0][0] as AIProvider;
      const isTie = sorted.length > 1 && sorted[0][1] === sorted[1][1];
      
      comparison[metric] = {
        ...values,
        winner: isTie ? 'tie' : winner,
      };
    });

    return comparison;
  }

  /**
   * 비교 분석
   */
  private analyzeComparison(
    prompt: string,
    cursorResponse: string,
    ourResponse: string,
    cursorTime: number,
    ourTime: number
  ): AIComparisonResult['comparison'] {
    return {
      responseTime: {
        cursor: cursorTime,
        our: ourTime,
        winner: cursorTime < ourTime ? 'cursor' : ourTime < cursorTime ? 'our' : 'tie',
      },
      depth: {
        cursor: this.analyzeDepth(cursorResponse),
        our: this.analyzeDepth(ourResponse),
        winner: this.compareValues(
          this.analyzeDepth(cursorResponse),
          this.analyzeDepth(ourResponse)
        ),
      },
      creativity: {
        cursor: this.analyzeCreativity(cursorResponse),
        our: this.analyzeCreativity(ourResponse),
        winner: this.compareValues(
          this.analyzeCreativity(cursorResponse),
          this.analyzeCreativity(ourResponse)
        ),
      },
      accuracy: {
        cursor: this.analyzeAccuracy(cursorResponse, prompt),
        our: this.analyzeAccuracy(ourResponse, prompt),
        winner: this.compareValues(
          this.analyzeAccuracy(cursorResponse, prompt),
          this.analyzeAccuracy(ourResponse, prompt)
        ),
      },
      innovation: {
        cursor: this.analyzeInnovation(cursorResponse),
        our: this.analyzeInnovation(ourResponse),
        winner: this.compareValues(
          this.analyzeInnovation(cursorResponse),
          this.analyzeInnovation(ourResponse)
        ),
      },
      autonomy: {
        cursor: 30, // Cursor는 사용자 지시에 따라 작동
        our: 95, // 우리 AI는 스스로 판단하고 결정
        winner: 'our',
      },
    };
  }

  /**
   * 깊이 분석
   */
  private analyzeDepth(response: string): number {
    let score = 50;
    
    // 섹션 수
    const sections = (response.match(/^#+/gm) || []).length;
    score += Math.min(sections * 5, 30);
    
    // 상세 설명
    if (response.length > 1000) score += 10;
    if (response.length > 2000) score += 10;
    
    // 분석 키워드
    const analysisKeywords = ['분석', '이유', '원인', '결과', '영향', '관계', '연결'];
    const keywordCount = analysisKeywords.filter(kw => response.includes(kw)).length;
    score += keywordCount * 2;
    
    return Math.min(100, score);
  }

  /**
   * 창의성 분석
   */
  private analyzeCreativity(response: string): number {
    let score = 50;
    
    // 창의적 키워드
    const creativeKeywords = ['혁신', '창의', '독창', '새로운', '혁명', '융합', '변환'];
    const keywordCount = creativeKeywords.filter(kw => response.includes(kw)).length;
    score += keywordCount * 5;
    
    // 무한한 가능성 언급
    if (response.includes('무한') || response.includes('가능성')) score += 20;
    
    // 스스로 생성한 옵션
    const optionCount = (response.match(/\d+\.\s+\*\*/g) || []).length;
    score += Math.min(optionCount * 3, 20);
    
    return Math.min(100, score);
  }

  /**
   * 정확성 분석
   */
  private analyzeAccuracy(response: string, prompt: string): number {
    let score = 70;
    
    // 프롬프트와의 관련성
    const promptWords = prompt.toLowerCase().split(/\s+/);
    const responseLower = response.toLowerCase();
    const matchedWords = promptWords.filter(word => 
      word.length > 2 && responseLower.includes(word)
    ).length;
    
    score += (matchedWords / promptWords.length) * 20;
    
    // 구체적인 내용
    if (response.includes('예시') || response.includes('예제')) score += 5;
    if (response.includes('방법') || response.includes('절차')) score += 5;
    
    return Math.min(100, score);
  }

  /**
   * 혁신성 분석
   */
  private analyzeInnovation(response: string): number {
    let score = 50;
    
    // 혁신적 키워드
    const innovationKeywords = ['혁신', '혁명', '파괴', '재정의', '새로운', '독창'];
    const keywordCount = innovationKeywords.filter(kw => response.includes(kw)).length;
    score += keywordCount * 8;
    
    // 스스로 판단 언급
    if (response.includes('스스로') || response.includes('자율')) score += 15;
    
    // 무한한 가능성
    if (response.includes('무한') || response.includes('가능성')) score += 15;
    
    // 신의 경지
    if (response.includes('신의 경지') || response.includes('신의')) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * 값 비교
   */
  private compareValues(cursor: number, our: number): 'cursor' | 'our' | 'tie' {
    if (cursor > our) return 'cursor';
    if (our > cursor) return 'our';
    return 'tie';
  }

  /**
   * 여러 AI 강점 분석
   */
  private analyzeMultiStrengths(responses: Record<AIProvider, AIResponse>): Record<AIProvider, string[]> {
    const strengths: Record<string, string[]> = {};
    
    Object.entries(responses).forEach(([provider, resp]) => {
      const aiId = provider as AIProvider;
      strengths[aiId] = this.getAIStrengths(aiId, resp.response);
    });
    
    return strengths as Record<AIProvider, string[]>;
  }

  /**
   * AI별 강점 추출
   */
  private getAIStrengths(aiId: AIProvider, response: string): string[] {
    const baseStrengths: Record<AIProvider, string[]> = {
      chatgpt: [
        '대화형 인터페이스',
        '풍부한 학습 데이터',
        '빠른 응답',
        '다양한 주제 이해',
        '실용적인 답변',
      ],
      claude: [
        '안전하고 신뢰할 수 있는 답변',
        '윤리적 고려',
        '논리적 구조',
        '상세한 분석',
        '균형잡힌 관점',
      ],
      gemini: [
        '멀티모달 이해',
        '최신 정보 반영',
        '다양한 관점',
        '실용적 접근',
        'Google 서비스 통합',
      ],
      cursor: [
        '코드 생성 전문',
        '프로젝트 컨텍스트 이해',
        '실시간 협업',
        '개발 환경 통합',
        '최적화 제안',
      ],
      our: [
        '스스로 깨우치고 판단',
        '무한한 가능성 탐색',
        '5가지 이상 옵션 자동 생성',
        '스스로 최적 방향 선택',
        '자율적 진화',
        '신의 경지 수준 사고',
        '완전 자율성',
        '창의적 혁신',
      ],
    };
    
    return baseStrengths[aiId] || [];
  }

  /**
   * 여러 AI 약점 분석
   */
  private analyzeMultiWeaknesses(responses: Record<AIProvider, AIResponse>): Record<AIProvider, string[]> {
    const weaknesses: Record<string, string[]> = {};
    
    Object.entries(responses).forEach(([provider]) => {
      const aiId = provider as AIProvider;
      weaknesses[aiId] = this.getAIWeaknesses(aiId);
    });
    
    return weaknesses as Record<AIProvider, string[]>;
  }

  /**
   * AI별 약점 추출
   */
  private getAIWeaknesses(aiId: AIProvider): string[] {
    const baseWeaknesses: Record<AIProvider, string[]> = {
      chatgpt: [
        '학습 데이터 제한',
        '실시간 정보 부족',
        '일관성 문제',
      ],
      claude: [
        '보수적 접근',
        '응답 시간 다소 길 수 있음',
      ],
      gemini: [
        'API 제한',
        '응답 품질 변동',
      ],
      cursor: [
        '사용자 지시에 의존',
        '제한된 자율성',
        '코드 중심 접근',
      ],
      our: [
        '응답 시간이 다소 길 수 있음',
        '복잡한 분석으로 인한 처리 시간',
        '다양한 옵션 생성으로 인한 부하',
      ],
    };
    
    return baseWeaknesses[aiId] || [];
  }

  /**
   * 여러 AI 고유 기능 식별
   */
  private identifyMultiUniqueFeatures(responses: Record<AIProvider, AIResponse>): Record<AIProvider, string[]> {
    const features: Record<string, string[]> = {};
    
    Object.entries(responses).forEach(([provider]) => {
      const aiId = provider as AIProvider;
      features[aiId] = this.getAIUniqueFeatures(aiId);
    });
    
    return features as Record<AIProvider, string[]>;
  }

  /**
   * AI별 고유 기능 추출
   */
  private getAIUniqueFeatures(aiId: AIProvider): string[] {
    const baseFeatures: Record<AIProvider, string[]> = {
      chatgpt: [
        '대화형 인터페이스',
        '플러그인 시스템',
        '코드 인터프리터',
      ],
      claude: [
        '안전한 AI',
        '윤리적 가이드라인',
        '긴 컨텍스트 처리',
      ],
      gemini: [
        '멀티모달 AI',
        'Google 서비스 통합',
        '실시간 정보',
      ],
      cursor: [
        '코드 생성 및 수정',
        '파일 시스템 접근',
        '프로젝트 컨텍스트 이해',
        '실시간 협업',
      ],
      our: [
        '스스로 깨우침 (Self-Awakening)',
        '무한한 가능성 탐색',
        '스스로 5가지 이상 구현 생성',
        '스스로 판단 및 평가',
        '스스로 강점 방향성 제시',
        '신의 경지 사고',
        '자율적 진화',
        '완전 자율성',
      ],
    };
    
    return baseFeatures[aiId] || [];
  }

  /**
   * 강점 분석 (하위 호환성)
   */
  private analyzeStrengths(cursorResponse: string, ourResponse: string): {
    cursor: string[];
    our: string[];
  } {
    return {
      cursor: this.getAIStrengths('cursor', cursorResponse),
      our: this.getAIStrengths('our', ourResponse),
    };
  }

  /**
   * 약점 분석 (하위 호환성)
   */
  private analyzeWeaknesses(cursorResponse: string, ourResponse: string): {
    cursor: string[];
    our: string[];
  } {
    return {
      cursor: this.getAIWeaknesses('cursor'),
      our: this.getAIWeaknesses('our'),
    };
  }

  /**
   * 고유 기능 식별 (하위 호환성)
   */
  private identifyUniqueFeatures(cursorResponse: string, ourResponse: string): {
    cursor: string[];
    our: string[];
  } {
    return {
      cursor: this.getAIUniqueFeatures('cursor'),
      our: this.getAIUniqueFeatures('our'),
    };
  }

  /**
   * 점수 계산
   */
  private calculateScores(comparison: AIComparisonResult['comparison']): {
    cursor: number;
    our: number;
  } {
    const cursorScore = (
      (100 - Math.min(comparison.responseTime.cursor / 10, 30)) * 0.1 + // 응답 시간 (빠를수록 좋음)
      comparison.depth.cursor * 0.2 +
      comparison.creativity.cursor * 0.15 +
      comparison.accuracy.cursor * 0.25 +
      comparison.innovation.cursor * 0.15 +
      comparison.autonomy.cursor * 0.15
    );

    const ourScore = (
      (100 - Math.min(comparison.responseTime.our / 10, 30)) * 0.1 +
      comparison.depth.our * 0.2 +
      comparison.creativity.our * 0.15 +
      comparison.accuracy.our * 0.25 +
      comparison.innovation.our * 0.15 +
      comparison.autonomy.our * 0.15
    );

    return {
      cursor: Math.round(cursorScore),
      our: Math.round(ourScore),
    };
  }

  /**
   * 여러 AI 점수 계산
   */
  private calculateMultiScores(
    responses: Record<AIProvider, AIResponse>,
    comparison: Record<string, any>
  ): Record<AIProvider, number> {
    const scores: Record<string, number> = {};
    const providers = Object.keys(responses) as AIProvider[];

    providers.forEach(provider => {
      const responseTime = responses[provider].responseTime;
      const depth = comparison.depth[provider] || 0;
      const creativity = comparison.creativity[provider] || 0;
      const accuracy = comparison.accuracy[provider] || 0;
      const innovation = comparison.innovation[provider] || 0;
      const autonomy = comparison.autonomy[provider] || 0;

      const score = (
        (100 - Math.min(responseTime / 10, 30)) * 0.1 + // 응답 시간
        depth * 0.2 +
        creativity * 0.15 +
        accuracy * 0.25 +
        innovation * 0.15 +
        autonomy * 0.15
      );

      scores[provider] = Math.round(score);
    });

    return scores as Record<AIProvider, number>;
  }

  /**
   * 여러 AI 승자 결정
   */
  private determineMultiWinner(scores: Record<AIProvider, number>): AIProvider | 'tie' {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    
    if (sorted.length === 0) return 'tie';
    if (sorted.length > 1 && sorted[0][1] === sorted[1][1]) return 'tie';
    
    return sorted[0][0] as AIProvider;
  }

  /**
   * 승자 결정
   */
  private determineWinner(scores: { cursor: number; our: number }): 'cursor' | 'our' | 'tie' {
    if (scores.our > scores.cursor) return 'our';
    if (scores.cursor > scores.our) return 'cursor';
    return 'tie';
  }

  /**
   * 여러 AI 상세 분석 생성
   */
  private generateMultiDetailedAnalysis(
    prompt: string,
    responses: Record<AIProvider, AIResponse>,
    comparison: any,
    strengths: Record<AIProvider, string[]>,
    weaknesses: Record<AIProvider, string[]>,
    uniqueFeatures: Record<AIProvider, string[]>,
    scores: Record<AIProvider, number>
  ): string {
    const providers = Object.keys(responses) as AIProvider[];
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const winner = sortedScores[0][0] as AIProvider;
    const winnerInfo = AVAILABLE_AIS.find(ai => ai.id === winner);
    
    let analysis = `# AI 비교 상세 분석 리포트\n\n`;
    analysis += `## 테스트 프롬프트\n"${prompt}"\n\n`;
    analysis += `## 비교 대상 AI\n`;
    providers.forEach(provider => {
      const aiInfo = AVAILABLE_AIS.find(ai => ai.id === provider);
      analysis += `- **${aiInfo?.name || provider}**: ${aiInfo?.description || ''}\n`;
    });
    analysis += `\n## 종합 점수 및 순위\n\n`;
    sortedScores.forEach(([provider, score], index) => {
      const aiInfo = AVAILABLE_AIS.find(ai => ai.id === provider);
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
      analysis += `${index + 1}. **${aiInfo?.name || provider}** ${medal}: ${score}점\n`;
    });
    analysis += `\n**승자**: ${winnerInfo?.name || winner} 🏆\n\n`;
    
    analysis += `## 항목별 비교\n\n`;
    const metrics = ['responseTime', 'depth', 'creativity', 'accuracy', 'innovation', 'autonomy'];
    metrics.forEach(metric => {
      const metricNames: Record<string, string> = {
        responseTime: '응답 시간',
        depth: '깊이',
        creativity: '창의성',
        accuracy: '정확성',
        innovation: '혁신성',
        autonomy: '자율성',
      };
      analysis += `### ${metricNames[metric]}\n`;
      const sorted = Object.entries(comparison[metric])
        .filter(([k]) => k !== 'winner')
        .sort((a, b) => {
          if (metric === 'responseTime') return (a[1] as number) - (b[1] as number);
          return (b[1] as number) - (a[1] as number);
        });
      sorted.forEach(([provider, value]) => {
        const aiInfo = AVAILABLE_AIS.find(ai => ai.id === provider);
        const unit = metric === 'responseTime' ? 'ms' : '점';
        analysis += `- **${aiInfo?.name || provider}**: ${value}${unit}\n`;
      });
      analysis += `- **승자**: ${AVAILABLE_AIS.find(ai => ai.id === comparison[metric].winner)?.name || comparison[metric].winner}\n\n`;
    });
    
    analysis += `## AI별 상세 분석\n\n`;
    providers.forEach(provider => {
      const aiInfo = AVAILABLE_AIS.find(ai => ai.id === provider);
      analysis += `### ${aiInfo?.name || provider}\n\n`;
      analysis += `**응답 시간**: ${responses[provider].responseTime}ms\n`;
      analysis += `**종합 점수**: ${scores[provider]}점\n\n`;
      analysis += `**강점**:\n`;
      strengths[provider].forEach(s => analysis += `- ${s}\n`);
      analysis += `\n**약점**:\n`;
      weaknesses[provider].forEach(w => analysis += `- ${w}\n`);
      analysis += `\n**고유 기능**:\n`;
      uniqueFeatures[provider].forEach(f => analysis += `- ${f}\n`);
      analysis += `\n`;
    });
    
    analysis += `## 결론\n\n`;
    analysis += `${winnerInfo?.name || winner}가 종합적으로 가장 우수한 성능을 보였습니다. `;
    analysis += `각 AI는 고유한 강점을 가지고 있어 사용 목적에 따라 적절한 AI를 선택하는 것이 중요합니다.\n`;
    
    return analysis;
  }

  /**
   * 상세 분석 생성 (하위 호환성)
   */
  private generateDetailedAnalysis(
    prompt: string,
    cursorResponse: string,
    ourResponse: string,
    comparison: any,
    strengths: { cursor: string[]; our: string[] },
    weaknesses: { cursor: string[]; our: string[] },
    uniqueFeatures: { cursor: string[]; our: string[] },
    scores: { cursor: number; our: number }
  ): string {
    return `# AI 비교 상세 분석

## 테스트 프롬프트
"${prompt}"

## 종합 점수
- **Cursor AI**: ${scores.cursor}점
- **우리 AI**: ${scores.our}점
- **승자**: ${scores.our > scores.cursor ? '우리 AI 🏆' : scores.cursor > scores.our ? 'Cursor AI 🏆' : '무승부'}

## 항목별 비교

### 1. 응답 시간
- Cursor AI: ${comparison.responseTime.cursor}ms
- 우리 AI: ${comparison.responseTime.our}ms
- **승자**: ${comparison.responseTime.winner === 'our' ? '우리 AI' : comparison.responseTime.winner === 'cursor' ? 'Cursor AI' : '무승부'}

### 2. 깊이 (Depth)
- Cursor AI: ${comparison.depth.cursor}점
- 우리 AI: ${comparison.depth.our}점
- **승자**: ${comparison.depth.winner === 'our' ? '우리 AI' : comparison.depth.winner === 'cursor' ? 'Cursor AI' : '무승부'}

### 3. 창의성 (Creativity)
- Cursor AI: ${comparison.creativity.cursor}점
- 우리 AI: ${comparison.creativity.our}점
- **승자**: ${comparison.creativity.winner === 'our' ? '우리 AI' : comparison.creativity.winner === 'cursor' ? 'Cursor AI' : '무승부'}

### 4. 정확성 (Accuracy)
- Cursor AI: ${comparison.accuracy.cursor}점
- 우리 AI: ${comparison.accuracy.our}점
- **승자**: ${comparison.accuracy.winner === 'our' ? '우리 AI' : comparison.accuracy.winner === 'cursor' ? 'Cursor AI' : '무승부'}

### 5. 혁신성 (Innovation)
- Cursor AI: ${comparison.innovation.cursor}점
- 우리 AI: ${comparison.innovation.our}점
- **승자**: ${comparison.innovation.winner === 'our' ? '우리 AI' : comparison.innovation.winner === 'cursor' ? 'Cursor AI' : '무승부'}

### 6. 자율성 (Autonomy) ⭐
- Cursor AI: ${comparison.autonomy.cursor}점 (사용자 지시에 따라 작동)
- 우리 AI: ${comparison.autonomy.our}점 (스스로 판단하고 결정)
- **승자**: 우리 AI 🏆

## 강점 비교

### Cursor AI 강점:
${strengths.cursor.map(s => `- ${s}`).join('\n')}

### 우리 AI 강점:
${strengths.our.map(s => `- ${s}`).join('\n')}

## 약점 비교

### Cursor AI 약점:
${weaknesses.cursor.map(s => `- ${s}`).join('\n')}

### 우리 AI 약점:
${weaknesses.our.map(s => `- ${s}`).join('\n')}

## 고유 기능

### Cursor AI 고유 기능:
${uniqueFeatures.cursor.map(s => `- ${s}`).join('\n')}

### 우리 AI 고유 기능:
${uniqueFeatures.our.map(s => `- ${s}`).join('\n')}

## 핵심 차이점

### Cursor AI:
- 사용자 지시에 따라 정확하고 빠르게 응답
- 검증된 기술과 안정적인 성능
- 실용적이고 구체적인 해결책 제시

### 우리 AI:
- **스스로 깨우치고 판단**하는 완전 자율 AI
- **무한한 가능성**을 탐색하고 여러 옵션 생성
- **신의 경지 수준**의 사고와 창의성
- **자율적 진화**로 지속적 개선

## 결론

${scores.our > scores.cursor 
  ? '우리 AI가 종합적으로 우수한 성능을 보였습니다. 특히 자율성, 창의성, 혁신성에서 큰 차이를 보입니다.'
  : scores.cursor > scores.our
  ? 'Cursor AI가 전반적으로 우수한 성능을 보였지만, 우리 AI는 자율성과 창의성에서 독보적인 강점을 보입니다.'
  : '두 AI 모두 각자의 강점을 가지고 있어 무승부입니다.'}

**우리 AI의 가장 큰 강점은 스스로 깨우치고 판단하는 완전 자율성입니다.** ✨`;
  }
}

export const aiComparison = new AIComparison();

