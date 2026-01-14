/**
 * 완전 무료 AI 파이프라인
 * 모든 사람이 무료로 사용할 수 있는 AI 솔루션
 * GPT/Gemini 수준의 품질을 무료로 제공
 */

import { generateWithFreeAI, FreeAIResponse } from '@/lib/free-ai-services';

export interface FreeAIPipelineResponse {
  text: string;
  source: string;
  confidence: number;
  responseTime: number;
  isFree: boolean;
  quality: 'high' | 'medium' | 'low';
}

/**
 * 완전 무료 AI 파이프라인
 * Groq > Ollama > Together > OpenRouter > HuggingFace 순서로 시도
 */
export async function generateWithFreeAIPipeline(
  prompt: string,
  options?: {
    maxRetries?: number;
    preferredSource?: string;
  }
): Promise<FreeAIPipelineResponse> {
  const startTime = Date.now();
  const maxRetries = options?.maxRetries || 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result: FreeAIResponse = await generateWithFreeAI(prompt);

      if (result.success && result.text) {
        // 품질 평가
        const quality = evaluateQuality(result.source, result.text);
        const confidence = calculateConfidence(result.source, result.text);

        return {
          text: result.text,
          source: result.source,
          confidence,
          responseTime: result.responseTime || (Date.now() - startTime),
          isFree: true,
          quality,
        };
      }
    } catch (error) {
      console.warn(`[FreeAIPipeline] 시도 ${attempt + 1} 실패:`, error);
      if (attempt < maxRetries - 1) {
        // 잠시 대기 후 재시도
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  // 모든 시도 실패
  return {
    text: generateFallbackResponse(prompt),
    source: 'fallback',
    confidence: 0.5,
    responseTime: Date.now() - startTime,
    isFree: true,
    quality: 'low',
  };
}

/**
 * AI 응답 품질 평가
 */
function evaluateQuality(source: string, text: string): 'high' | 'medium' | 'low' {
  // Groq, Ollama는 고품질
  if (source === 'groq-free' || source === 'ollama') {
    return 'high';
  }
  
  // Together, OpenRouter는 중품질
  if (source === 'together-ai' || source === 'openrouter-free') {
    return 'medium';
  }
  
  // HuggingFace, Fallback은 낮은 품질
  return 'low';
}

/**
 * 신뢰도 계산
 */
function calculateConfidence(source: string, text: string): number {
  let baseConfidence = 0.5;

  // 소스별 기본 신뢰도
  switch (source) {
    case 'groq-free':
      baseConfidence = 0.95;
      break;
    case 'ollama':
      baseConfidence = 0.90;
      break;
    case 'together-ai':
      baseConfidence = 0.85;
      break;
    case 'openrouter-free':
      baseConfidence = 0.80;
      break;
    case 'huggingface-public':
      baseConfidence = 0.70;
      break;
    case 'fallback':
      baseConfidence = 0.50;
      break;
  }

  // 텍스트 길이와 품질로 조정
  if (text.length > 100) baseConfidence += 0.05;
  if (text.length > 500) baseConfidence += 0.05;
  if (!text.includes('기본 AI') && !text.includes('설정하세요')) {
    baseConfidence += 0.05;
  }

  return Math.min(1.0, baseConfidence);
}

/**
 * 폴백 응답 생성
 */
function generateFallbackResponse(prompt: string): string {
  return `# ${prompt}에 대한 응답

## 안내
현재 모든 무료 AI 서비스에 일시적으로 접근할 수 없습니다.

## 권장사항
1. **Groq API 설정** (가장 빠르고 무료)
   - https://console.groq.com/ 에서 무료 API 키 발급
   - 환경 변수에 \`GROQ_API_KEY\` 추가

2. **Ollama 설치** (완전 무료, 로컬 실행)
   - https://ollama.ai/ 에서 다운로드
   - \`ollama pull llama3.1\` 실행
   - 완전 무료로 GPT 수준의 AI 사용 가능

3. **Together AI** (무료 티어)
   - https://together.ai/ 에서 무료 API 키 발급

## 무료 AI 솔루션
Shell은 완전 무료로 사용할 수 있도록 설계되었습니다. 위 서비스 중 하나만 설정해도 GPT/Gemini 수준의 고품질 AI를 무료로 사용할 수 있습니다.

---
*이 메시지는 모든 무료 AI 서비스에 접근할 수 없을 때 표시됩니다.*`;
}
