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
    // v1 API에서는 gemini-pro 사용, v1beta에서는 gemini-1.5-flash 사용
    this.model = config.model || 'gemini-pro'; // 기본 모델 (v1 API 호환)
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    if (!this.apiKey) {
      return this.simulateResponse(prompt);
    }

    try {
      // v1 API 사용 (gemini-pro는 v1에서 지원)
      // v1beta는 gemini-1.5-flash를 지원하지만, 안정성을 위해 v1 사용
      const apiVersion = this.model.includes('1.5') ? 'v1beta' : 'v1';
      const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${this.model}:generateContent?key=${this.apiKey}`;
      
      console.log('Google Gemini API 호출:', {
        model: this.model,
        hasApiKey: !!this.apiKey,
        apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || 8192,
            temperature: options?.temperature || 0.7,
            topK: 40,
            topP: 0.95,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API 호출 실패 (${response.status}): ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (e) {
          // JSON 파싱 실패 시 원본 텍스트 사용
        }
        
        console.error('Google Gemini API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
        });
        
        // 401/403: 인증 오류
        if (response.status === 401 || response.status === 403) {
          return `❌ API 키 인증 실패: ${errorMessage}\n\nNetlify 환경 변수에서 GOOGLE_API_KEY를 확인하세요.`;
        }
        
        return this.simulateResponse(prompt);
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!generatedText) {
        console.error('Google Gemini API 빈 응답:', data);
        return this.simulateResponse(prompt);
      }
      
      console.log('Google Gemini API 성공:', {
        model: this.model,
        responseLength: generatedText.length,
      });
      
      return generatedText;
    } catch (error: any) {
      console.error('Google Gemini API error:', {
        error: error.message,
        stack: error.stack,
        apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
      });
      return this.simulateResponse(prompt);
    }
  }

  private simulateResponse(prompt: string): string {
    return `# ${prompt}에 대한 AI 생성 응답\n\n이것은 시뮬레이션된 응답입니다. 실제 Google Gemini API 키를 설정하면 실제 AI 응답을 받을 수 있습니다.\n\n## 생성된 내용\n\n${prompt}에 대한 상세한 정보와 분석을 제공합니다.\n\n### 주요 포인트\n- 포괄적인 정보 제공\n- 최신 데이터 기반 분석\n- 실용적인 활용 방법\n\n실제 API를 사용하려면 환경 변수에 GOOGLE_API_KEY를 설정하세요.`;
  }
}

export const gemini = new GeminiClient();

/**
 * 간단한 Gemini 응답 생성 함수
 */
export async function generateGeminiResponse(prompt: string, apiKey?: string): Promise<string> {
  const client = new GeminiClient({ apiKey: apiKey || process.env.GOOGLE_API_KEY });
  return await client.generateText(prompt, {
    maxTokens: 4000,
    temperature: 0.7,
  });
}

