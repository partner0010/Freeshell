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
    // 환경 변수에서 API 키 로드 (서버 사이드에서만 작동)
    const envApiKey = typeof process !== 'undefined' && process.env ? process.env.GOOGLE_API_KEY : '';
    this.apiKey = config.apiKey || envApiKey || '';
    // v1 API에서는 gemini-pro 사용, v1beta에서는 gemini-1.5-flash 사용
    this.model = config.model || 'gemini-pro'; // 기본 모델 (v1 API 호환)
    
    // API 키 로드 확인 (디버깅용)
    if (this.apiKey) {
      console.log('[GeminiClient] API 키 로드됨:', this.apiKey.substring(0, 10) + '...');
    } else {
      console.warn('[GeminiClient] API 키가 설정되지 않았습니다. process.env.GOOGLE_API_KEY:', !!envApiKey);
    }
  }

  async generateText(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    // 🆓 무료 우선 전략: Google API 키가 없어도 완전 무료 AI 서비스 사용
    if (!this.apiKey || this.apiKey.trim() === '') {
      console.log('[GeminiClient] 🆓 무료 AI 우선 모드: 완전 무료 AI 서비스를 사용합니다.');
      
      try {
        // 1순위: 완전 무료 AI 서비스 (Groq > Ollama > Together > OpenRouter > HuggingFace)
        const { generateWithFreeAI } = await import('@/lib/free-ai-services');
        const freeAIResult = await generateWithFreeAI(prompt);
        
        if (freeAIResult.success && freeAIResult.text && !freeAIResult.text.includes('기본 AI')) {
          console.log('[GeminiClient] ✅ 완전 무료 AI 서비스 성공:', {
            source: freeAIResult.source,
            requiresApiKey: freeAIResult.requiresApiKey,
            responseTime: freeAIResult.responseTime,
          });
          return freeAIResult.text;
        }
      } catch (error) {
        console.warn('[GeminiClient] 완전 무료 AI 서비스 실패:', error);
      }
      
      try {
        // 2순위: 자체 AI 엔진 사용
        const { generateLocalAI } = await import('@/lib/local-ai');
        const result = await generateLocalAI(prompt);
        
        if (result.success) {
          console.log('[GeminiClient] 자체 AI 엔진 성공:', {
            source: result.source,
            responseTime: result.responseTime,
          });
          return result.text;
        }
      } catch (error) {
        console.error('[GeminiClient] 자체 AI 엔진 오류:', error);
      }
      
      // 모두 실패하면 시뮬레이션 반환
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
        
        console.error('[GeminiClient] API 오류:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
          hasApiKey: !!this.apiKey,
        });
        
        // 401/403: 인증 오류 - 실제 에러 반환
        if (response.status === 401 || response.status === 403) {
          throw new Error(`API 키 인증 실패: ${errorMessage}`);
        }
        
        // 다른 오류도 실제 에러로 처리 (시뮬레이션 반환하지 않음)
        throw new Error(`Google Gemini API 오류: ${errorMessage}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!generatedText) {
        console.error('[GeminiClient] API 빈 응답:', data);
        throw new Error('Google Gemini API가 빈 응답을 반환했습니다.');
      }
      
      console.log('[GeminiClient] API 성공:', {
        model: this.model,
        responseLength: generatedText.length,
        apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
      });
      
      return generatedText;
    } catch (error: any) {
      console.error('[GeminiClient] API 오류:', {
        error: error.message,
        stack: error.stack,
        apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
        hasApiKey: !!this.apiKey,
      });
      
      // API 키가 있는데도 실패한 경우 자체 AI 엔진으로 fallback 시도
      if (this.apiKey && this.apiKey.trim() !== '') {
        console.warn('[GeminiClient] Google Gemini 실패, 자체 AI 엔진으로 fallback 시도');
        try {
          const { generateLocalAI } = await import('@/lib/local-ai');
          const result = await generateLocalAI(prompt);
          if (result.success) {
            console.log('[GeminiClient] 자체 AI 엔진 fallback 성공:', {
              source: result.source,
              responseTime: result.responseTime,
            });
            return result.text;
          }
        } catch (fallbackError) {
          console.error('[GeminiClient] 자체 AI 엔진 fallback도 실패:', fallbackError);
        }
        // 자체 AI도 실패하면 실제 에러 throw
        throw error;
      }
      
      // API 키가 없을 때는 이미 위에서 자체 AI 엔진 사용했으므로 여기서는 시뮬레이션 반환
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

