// 여러 AI 모델 통합 관리

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKey?: string;
  endpoint?: string;
}

export class AIModelManager {
  private models: Map<string, AIModel> = new Map();

  constructor() {
    // Google Gemini만 등록 (무료 티어 제공)
    // 환경 변수에서 API 키 로드 (서버 사이드에서만 작동)
    const envApiKey = typeof process !== 'undefined' && process.env ? process.env.GOOGLE_API_KEY : '';
    
    this.registerModel({
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      apiKey: envApiKey || '',
      endpoint: 'gemini-pro', // v1 API 호환 모델
    });
    
    // API 키 로드 확인 (디버깅용)
    if (envApiKey) {
      console.log('[AIModelManager] GOOGLE_API_KEY 로드됨:', envApiKey.substring(0, 10) + '...');
    } else {
      console.warn('[AIModelManager] GOOGLE_API_KEY가 설정되지 않았습니다.');
    }
  }

  registerModel(model: AIModel) {
    this.models.set(model.id, model);
  }

  getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  async generateWithModel(modelId: string, prompt: string): Promise<string> {
    const model = this.getModel(modelId);
    if (!model) {
      // 모델을 찾을 수 없어도 폴백 메시지 반환 (throw 하지 않음)
      console.error(`Model ${modelId} not found`);
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `모델 ${modelId}을(를) 찾을 수 없습니다. 프롬프트: ${prompt.substring(0, 200)}...`;
    }

    try {
      // Google Gemini만 사용 (무료)
      if (model.provider === 'Google') {
        return await this.callGoogle(model, prompt);
      }
      // 기본값으로 Google Gemini 사용 시도
      console.error(`Unsupported provider: ${model.provider}, falling back to Google Gemini`);
      const googleModel = this.getModel('gemini-pro');
      if (googleModel) {
        return await this.callGoogle(googleModel, prompt);
      }
      // 모델을 찾을 수 없는 경우 폴백
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `AI 모델을 사용할 수 없습니다. Google Gemini API 키를 설정해주세요. 프롬프트: ${prompt.substring(0, 200)}...`;
    } catch (error) {
      console.error(`Error generating with model ${modelId}:`, error);
      // 오류 발생 시에도 폴백 메시지 반환 (이미 각 call 메서드에서 처리되지만 이중 안전장치)
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `AI 모델 실행 중 오류가 발생했습니다. 프롬프트: ${prompt.substring(0, 200)}...`;
    }
  }


  private async callGoogle(model: AIModel, prompt: string): Promise<string> {
    // 🆓 무료 우선 전략: Google API 키가 없어도 완전 무료 AI 서비스 사용
    // 모든 사람이 무료로 사용할 수 있도록 최적화
    if (!model.apiKey || model.apiKey.trim() === '') {
      console.log('[AIModelManager] 🆓 무료 AI 우선 모드: 완전 무료 AI 서비스를 사용합니다.');
      
      // 1순위: 완전 무료 AI 서비스 (Groq > Ollama > Together > OpenRouter > HuggingFace)
      try {
        const { generateWithFreeAI } = await import('@/lib/free-ai-services');
        const freeAIResult = await generateWithFreeAI(prompt);
        
        if (freeAIResult.success && freeAIResult.text && !freeAIResult.text.includes('기본 AI')) {
          console.log('[AIModelManager] ✅ 완전 무료 AI 서비스 성공:', {
            source: freeAIResult.source,
            requiresApiKey: freeAIResult.requiresApiKey,
            responseTime: freeAIResult.responseTime,
          });
          return freeAIResult.text;
        }
      } catch (error) {
        console.warn('[AIModelManager] 완전 무료 AI 서비스 실패:', error);
      }
      
      // 2순위: 자체 AI 엔진 사용
      try {
        const { generateLocalAI } = await import('@/lib/local-ai');
        const result = await generateLocalAI(prompt);
        
        if (result.success) {
          console.log('[AIModelManager] 자체 AI 엔진 성공:', {
            source: result.source,
            responseTime: result.responseTime,
          });
          return result.text;
        }
      } catch (error) {
        console.error('[AIModelManager] 자체 AI 엔진 오류:', error);
      }
      
      // 모두 실패하면 기본 응답
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `🆓 이것은 완전 무료 AI 서비스 응답입니다. Groq API나 Ollama를 설정하면 GPT/Gemini 수준의 고품질 응답을 받을 수 있습니다.\n\n프롬프트: ${prompt.substring(0, 200)}...`;
    }

    // 모델 이름 결정 (endpoint가 있으면 사용, 없으면 기본값)
    // v1 API에서 gemini-pro 사용 (안정적이고 무료 티어 지원)
    const modelName = model.endpoint || 'gemini-pro';
    const apiVersion = 'v1'; // v1 API 사용 (더 안정적)
    
    try {
      // Google Gemini API 호출 (v1beta API 사용 - gemini-1.5-flash 지원)
      const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${model.apiKey}`;
      
      console.log('Google Gemini API 호출:', {
        model: modelName,
        hasApiKey: !!model.apiKey,
        apiKeyPrefix: model.apiKey?.substring(0, 10) + '...',
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
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
        
        console.error('[AIModelManager] Google Gemini API 오류:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          apiKeyPrefix: model.apiKey?.substring(0, 10) + '...',
          hasApiKey: !!model.apiKey,
          apiKeyLength: model.apiKey?.length,
        });
        
        // 모든 오류를 실제 에러로 처리 (시뮬레이션 반환하지 않음)
        throw new Error(`Google Gemini API 오류 (${response.status}): ${errorMessage}`);
      }

      const data = await response.json();
      
      // 응답 구조 확인
      if (!data.candidates || !data.candidates[0]) {
        console.error('Google Gemini API 응답 구조 오류:', data);
        return `API 응답 형식이 올바르지 않습니다.`;
      }
      
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      
      if (!generatedText) {
        console.error('[AIModelManager] Google Gemini API 빈 응답:', data);
        throw new Error('Google Gemini API가 빈 응답을 반환했습니다.');
      }
      
      console.log('[AIModelManager] Google Gemini API 성공:', {
        model: modelName,
        responseLength: generatedText.length,
        apiKeyPrefix: model.apiKey?.substring(0, 10) + '...',
        hasApiKey: !!model.apiKey,
      });
      
      return generatedText;
    } catch (error: any) {
      console.error('[AIModelManager] Google Gemini API 오류:', {
        error: error.message,
        stack: error.stack,
        apiKeyPrefix: model.apiKey?.substring(0, 10) + '...',
        hasApiKey: !!model.apiKey,
        apiKeyLength: model.apiKey?.length,
      });
      
      // API 키가 있는데도 실패한 경우 실제 에러를 throw (시뮬레이션 반환하지 않음)
      if (model.apiKey && model.apiKey.trim() !== '') {
        throw error; // 실제 에러를 상위로 전달
      }
      
      // API 키가 없을 때만 시뮬레이션 반환
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `이것은 시뮬레이션된 응답입니다. 실제 Google Gemini API 키를 설정하면 실제 Gemini 응답을 받을 수 있습니다.\n\n프롬프트: ${prompt.substring(0, 200)}...`;
    }
  }

  // 여러 모델을 동시에 사용하여 결과 비교
  async generateWithMultipleModels(prompt: string, modelIds: string[]): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    await Promise.all(
      modelIds.map(async (modelId) => {
        try {
          results[modelId] = await this.generateWithModel(modelId, prompt);
        } catch (error) {
          console.error(`Error with model ${modelId}:`, error);
          results[modelId] = 'Error generating response';
        }
      })
    );

    return results;
  }
}

export const aiModelManager = new AIModelManager();

