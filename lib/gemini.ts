/**
 * Google Gemini API 클라이언트
 * 무료 티어 제공
 */

export interface GeminiConfig {
  apiKey?: string;
  model?: string;
}

export class GeminiClient {
  private apiKey: string;
  private model: string;

  constructor(config: GeminiConfig = {}) {
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY || '';
    this.model = config.model || 'gemini-pro';
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    if (!this.apiKey) {
      return this.simulateResponse(prompt);
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }],
            generationConfig: {
              maxOutputTokens: options?.maxTokens || 2000,
              temperature: options?.temperature || 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Gemini API error:', response.statusText, errorText);
        return this.simulateResponse(prompt);
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || this.simulateResponse(prompt);
    } catch (error) {
      console.error('Google Gemini API error:', error);
      return this.simulateResponse(prompt);
    }
  }

  private simulateResponse(prompt: string): string {
    return `# ${prompt}에 대한 AI 생성 응답\n\n이것은 시뮬레이션된 응답입니다. 실제 Google Gemini API 키를 설정하면 실제 AI 응답을 받을 수 있습니다.\n\n## 생성된 내용\n\n${prompt}에 대한 상세한 정보와 분석을 제공합니다.\n\n### 주요 포인트\n- 포괄적인 정보 제공\n- 최신 데이터 기반 분석\n- 실용적인 활용 방법\n\n실제 API를 사용하려면 환경 변수에 GOOGLE_API_KEY를 설정하세요.`;
  }
}

export const gemini = new GeminiClient();

