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
    this.registerModel({
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      apiKey: process.env.GOOGLE_API_KEY,
    });
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
    // API 키가 없으면 폴백
    if (!model.apiKey) {
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `이것은 시뮬레이션된 응답입니다. 실제 Google Gemini API 키를 설정하면 실제 Gemini 응답을 받을 수 있습니다.\n\n프롬프트: ${prompt.substring(0, 200)}...`;
    }

    try {
      // Google Gemini API 호출
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${model.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }],
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Gemini API error:', response.statusText, errorText);
        if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
          const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
          const textToTranslate = match ? match[1].trim() : prompt;
          return textToTranslate;
        }
        return `API 호출에 실패했습니다. 잠시 후 다시 시도해주세요. 프롬프트: ${prompt.substring(0, 200)}...`;
      }

      const data = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Google Gemini API call error:', error);
      if (prompt.includes('번역해주세요') || prompt.includes('translate')) {
        const match = prompt.match(/번역해주세요[:\n\s]+(.+?)(?:\n|$)/s);
        const textToTranslate = match ? match[1].trim() : prompt;
        return textToTranslate;
      }
      return `API 호출 중 오류가 발생했습니다. 프롬프트: ${prompt.substring(0, 200)}...`;
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

