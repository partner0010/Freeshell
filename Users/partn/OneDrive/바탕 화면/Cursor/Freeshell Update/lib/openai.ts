// OpenAI API 통합 유틸리티
// 실제 사용 시 환경 변수에 OPENAI_API_KEY를 설정해야 합니다.

export interface OpenAIConfig {
  apiKey?: string;
  model?: string;
}

export class OpenAIClient {
  private apiKey: string;
  private model: string;

  constructor(config: OpenAIConfig = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || '';
    this.model = config.model || 'gpt-4-turbo-preview';
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    if (!this.apiKey) {
      // 개발 환경에서는 시뮬레이션된 응답 반환
      return this.simulateResponse(prompt);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: options?.maxTokens || 2000,
          temperature: options?.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.simulateResponse(prompt);
    }
  }

  private simulateResponse(prompt: string): string {
    // 개발 환경 시뮬레이션
    return `# ${prompt}에 대한 AI 생성 응답

이것은 시뮬레이션된 응답입니다. 실제 OpenAI API 키를 설정하면 실제 AI 응답을 받을 수 있습니다.

## 생성된 내용

${prompt}에 대한 상세한 정보와 분석을 제공합니다.

### 주요 포인트
- 포괄적인 정보 제공
- 최신 데이터 기반 분석
- 실용적인 활용 방법

실제 API를 사용하려면 환경 변수에 OPENAI_API_KEY를 설정하세요.`;
  }

  async generateImage(prompt: string): Promise<string> {
    if (!this.apiKey) {
      return `https://via.placeholder.com/512?text=${encodeURIComponent(prompt)}`;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0]?.url || '';
    } catch (error) {
      console.error('OpenAI Image API error:', error);
      return `https://via.placeholder.com/512?text=${encodeURIComponent(prompt)}`;
    }
  }
}

export const openai = new OpenAIClient();

