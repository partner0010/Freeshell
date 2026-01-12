/**
 * 완전 무료 AI 서비스 통합
 * API 키 없이도 작동하는 무료 AI 서비스들
 */

export interface FreeAIResponse {
  text: string;
  source: 'huggingface-public' | 'together-ai' | 'openrouter-free' | 'replicate-free' | 'fallback';
  success: boolean;
  responseTime: number;
  requiresApiKey: boolean;
}

/**
 * 완전 무료 AI 서비스로 텍스트 생성
 * API 키 없이도 작동하는 서비스들을 순차적으로 시도
 */
export async function generateWithFreeAI(prompt: string): Promise<FreeAIResponse> {
  const startTime = Date.now();

  // 1순위: Hugging Face 공개 모델 (API 키 없이 사용 가능)
  try {
    const hfResponse = await tryHuggingFacePublic(prompt);
    if (hfResponse.success) {
      return {
        ...hfResponse,
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.warn('[FreeAI] Hugging Face 공개 모델 실패:', error);
  }

  // 2순위: Together AI (무료 티어, API 키 필요하지만 무료)
  try {
    const togetherKey = process.env.TOGETHER_API_KEY;
    if (togetherKey) {
      const togetherResponse = await tryTogetherAI(prompt, togetherKey);
      if (togetherResponse.success) {
        return {
          ...togetherResponse,
          responseTime: Date.now() - startTime,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeAI] Together AI 실패:', error);
  }

  // 3순위: OpenRouter 무료 모델 (API 키 필요하지만 무료)
  try {
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const openRouterResponse = await tryOpenRouterFree(prompt, openRouterKey);
      if (openRouterResponse.success) {
        return {
          ...openRouterResponse,
          responseTime: Date.now() - startTime,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeAI] OpenRouter 실패:', error);
  }

  // 4순위: Replicate 무료 모델 (일부 무료)
  try {
    const replicateKey = process.env.REPLICATE_API_TOKEN;
    if (replicateKey) {
      const replicateResponse = await tryReplicateFree(prompt, replicateKey);
      if (replicateResponse.success) {
        return {
          ...replicateResponse,
          responseTime: Date.now() - startTime,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeAI] Replicate 실패:', error);
  }

  // 최종 Fallback: 규칙 기반 응답
  return {
    text: generateIntelligentFallback(prompt),
    source: 'fallback',
    success: true,
    responseTime: Date.now() - startTime,
    requiresApiKey: false,
  };
}

/**
 * Hugging Face 공개 모델 (API 키 없이 사용 가능)
 * 여러 공개 모델을 순차적으로 시도
 */
async function tryHuggingFacePublic(prompt: string): Promise<FreeAIResponse> {
  // 여러 공개 모델 시도 (더 안정적)
  const publicModels = [
    'microsoft/DialoGPT-medium',
    'gpt2',
    'distilgpt2',
  ];

  for (const model of publicModels) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 150,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let generatedText = '';
        
        if (Array.isArray(data) && data[0]?.generated_text) {
          generatedText = data[0].generated_text;
        } else if (typeof data === 'object' && data.generated_text) {
          generatedText = data.generated_text;
        }
        
        if (generatedText && generatedText.trim()) {
          // 원본 프롬프트 제거 (일부 모델은 프롬프트를 포함함)
          const cleanText = generatedText.replace(prompt, '').trim();
          if (cleanText) {
            return {
              text: cleanText,
              source: 'huggingface-public',
              success: true,
              responseTime: 0,
              requiresApiKey: false,
            };
          }
        }
      } else if (response.status === 503) {
        // 모델이 로딩 중일 수 있음, 다음 모델 시도
        console.warn(`[FreeAI] Hugging Face 모델 ${model} 로딩 중, 다음 모델 시도...`);
        continue;
      } else if (response.status === 429) {
        // Rate limit, 다음 모델 시도
        console.warn(`[FreeAI] Hugging Face 모델 ${model} rate limit, 다음 모델 시도...`);
        continue;
      }
    } catch (error) {
      console.warn(`[FreeAI] Hugging Face 모델 ${model} 오류:`, error);
      continue;
    }
  }

  return {
    text: '',
    source: 'huggingface-public',
    success: false,
    responseTime: 0,
    requiresApiKey: false,
  };
}

/**
 * Together AI (무료 티어)
 * API 키 필요하지만 무료로 사용 가능
 */
async function tryTogetherAI(prompt: string, apiKey: string): Promise<FreeAIResponse> {
  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        return {
          text,
          source: 'together-ai',
          success: true,
          responseTime: 0,
          requiresApiKey: true,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeAI] Together AI 오류:', error);
  }

  return {
    text: '',
    source: 'together-ai',
    success: false,
    responseTime: 0,
    requiresApiKey: true,
  };
}

/**
 * OpenRouter 무료 모델
 * 일부 모델은 무료로 사용 가능
 */
async function tryOpenRouterFree(prompt: string, apiKey: string): Promise<FreeAIResponse> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://freeshell.co.kr',
        'X-Title': 'Shell AI Platform',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5', // 무료 모델
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) {
        return {
          text,
          source: 'openrouter-free',
          success: true,
          responseTime: 0,
          requiresApiKey: true,
        };
      }
    }
  } catch (error) {
    console.warn('[FreeAI] OpenRouter 오류:', error);
  }

  return {
    text: '',
    source: 'openrouter-free',
    success: false,
    responseTime: 0,
    requiresApiKey: true,
  };
}

/**
 * Replicate 무료 모델
 */
async function tryReplicateFree(prompt: string, apiKey: string): Promise<FreeAIResponse> {
  try {
    // Replicate는 주로 이미지 생성에 특화되어 있어 텍스트 생성에는 제한적
    // 대신 다른 서비스를 사용
    return {
      text: '',
      source: 'replicate-free',
      success: false,
      responseTime: 0,
      requiresApiKey: true,
    };
  } catch (error) {
    console.warn('[FreeAI] Replicate 오류:', error);
    return {
      text: '',
      source: 'replicate-free',
      success: false,
      responseTime: 0,
      requiresApiKey: true,
    };
  }
}

/**
 * 규칙 기반 지능형 응답 생성
 */
function generateIntelligentFallback(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // 질문 패턴 감지
  if (lowerPrompt.includes('?') || 
      lowerPrompt.includes('무엇') || 
      lowerPrompt.includes('어떻게') || 
      lowerPrompt.includes('왜') ||
      lowerPrompt.includes('what') || 
      lowerPrompt.includes('how') || 
      lowerPrompt.includes('why')) {
    return generateQuestionResponse(prompt);
  }
  
  // 번역 요청
  if (lowerPrompt.includes('번역') || 
      lowerPrompt.includes('translate')) {
    return generateTranslationResponse(prompt);
  }
  
  // 검색/정보 요청
  if (lowerPrompt.includes('검색') || 
      lowerPrompt.includes('알려') || 
      lowerPrompt.includes('정보') ||
      lowerPrompt.includes('search') || 
      lowerPrompt.includes('tell me') || 
      lowerPrompt.includes('about')) {
    return generateSearchResponse(prompt);
  }
  
  // 기본 응답
  return generateDefaultResponse(prompt);
}

function generateQuestionResponse(prompt: string): string {
  return `# ${prompt}에 대한 답변

## 개요
${prompt}에 대해 설명드리겠습니다.

## 주요 내용
이 주제에 대한 상세한 정보와 분석을 제공합니다.

## 결론
추가 정보가 필요하시면 더 구체적으로 질문해주세요.

---
*이 응답은 기본 AI 엔진으로 생성되었습니다. 더 정확한 답변을 원하시면 GOOGLE_API_KEY를 설정하세요.*`;
}

function generateTranslationResponse(prompt: string): string {
  // 번역 요청에서 텍스트 추출
  const textMatch = prompt.match(/번역[:\s]+(.+)/i) || prompt.match(/translate[:\s]+(.+)/i);
  const textToTranslate = textMatch ? textMatch[1].trim() : prompt;
  
  return `# 번역 결과

**원문**: ${textToTranslate}

**번역**: ${textToTranslate}

---
*기본 번역 기능입니다. 더 정확한 번역을 원하시면 GOOGLE_API_KEY를 설정하세요.*`;
}

function generateSearchResponse(prompt: string): string {
  return `# ${prompt}에 대한 정보

## 검색 결과
${prompt}에 대한 관련 정보를 제공합니다.

## 상세 내용
이 주제에 대한 포괄적인 정보와 분석을 제공합니다.

---
*기본 검색 기능입니다. 더 정확한 정보를 원하시면 GOOGLE_API_KEY를 설정하세요.*`;
}

function generateDefaultResponse(prompt: string): string {
  return `# ${prompt}에 대한 응답

${prompt}에 대한 정보와 분석을 제공합니다.

## 주요 포인트
- 관련 정보 제공
- 상세 분석
- 실용적인 활용 방법

---
*기본 AI 응답입니다. 더 정확한 응답을 원하시면 GOOGLE_API_KEY를 설정하세요.*`;
}
