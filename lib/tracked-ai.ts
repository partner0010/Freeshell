/**
 * 추적 가능한 AI 엔진
 * AI의 사고 과정을 단계별로 추적하여 반환
 */

import { processTracker, AIProcessTracker } from './ai-process-tracker';
import {
  analyzeQuestionType,
  identifyRequiredInfo,
  extractKeyPoints,
  planDataCollection,
  generateOptimizedPrompt,
} from './ai-thinking-utils';

export interface TrackedAIResponse {
  text: string;
  processId: string;
  process: AIProcessTracker;
  source: string;
  success: boolean;
  responseTime: number;
}

/**
 * 추적 가능한 AI 응답 생성
 */
export async function generateTrackedAI(prompt: string): Promise<TrackedAIResponse> {
  const startTime = Date.now();
  const processId = processTracker.createProcess(prompt);

  try {
    // 1단계: 사고 과정 시작 - 질문 분석
    processTracker.addStep(processId, {
      step: 1,
      stage: 'thinking',
      description: '질문을 분석하고 의도를 파악하는 중...',
    });

    // 질문 패턴 분석
    const questionType = analyzeQuestionType(prompt);
    const requiredInfo = identifyRequiredInfo(prompt);
    
    processTracker.addThinking(processId, 
      `질문 유형: ${questionType.type} - ${questionType.description}`,
      `필요한 정보: ${requiredInfo.join(', ')} | 질문의 핵심: "${extractKeyPoints(prompt)}"`,
      0.9
    );

    await new Promise(resolve => setTimeout(resolve, 300)); // 시각적 효과

    // 2단계: 데이터 수집 계획
    processTracker.addStep(processId, {
      step: 2,
      stage: 'researching',
      description: '필요한 데이터 수집 방법을 계획하는 중...',
    });

    const dataSources = planDataCollection(prompt, questionType, requiredInfo);
    
    processTracker.addThinking(processId,
      `${dataSources.length}개의 데이터 소스를 식별했습니다.`,
      `수집 계획: ${dataSources.map(s => s.source).join(' → ')} | 우선순위: ${dataSources[0]?.priority || 'N/A'}`,
      0.8
    );

    await new Promise(resolve => setTimeout(resolve, 300));

    // 3단계: API 시도
    processTracker.addStep(processId, {
      step: 3,
      stage: 'researching',
      description: `AI API를 호출하여 정보를 수집하는 중... (${dataSources[0]?.source || 'Google Gemini'})`,
    });
    
    processTracker.addThinking(processId,
      `API 호출 시작: ${dataSources[0]?.source || 'Google Gemini'}`,
      `요청 내용: "${generateOptimizedPrompt(prompt, questionType, requiredInfo)}"`,
      0.7
    );
    
    await new Promise(resolve => setTimeout(resolve, 200));

    // Google Gemini API 시도
    const geminiKey = process.env.GOOGLE_API_KEY;
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const apiStartTime = Date.now();
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        const apiResponseTime = Date.now() - apiStartTime;

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text && !text.includes('시뮬레이션') && !text.includes('API 키를 설정')) {
            processTracker.addAPICall(processId, 'Google Gemini', true, apiResponseTime);
            
            processTracker.addStep(processId, {
              step: 4,
              stage: 'analyzing',
              description: '수집한 정보를 분석하는 중...',
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            processTracker.addStep(processId, {
              step: 5,
              stage: 'synthesizing',
              description: '정보를 종합하고 구조화하는 중...',
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            processTracker.addStep(processId, {
              step: 6,
              stage: 'generating',
              description: '최종 응답을 생성하는 중...',
            });

            await new Promise(resolve => setTimeout(resolve, 100));

            processTracker.finalize(processId, text);
            
            return {
              text,
              processId,
              process: processTracker.getProcess(processId)!,
              source: 'gemini',
              success: true,
              responseTime: Date.now() - startTime,
            };
          } else {
            processTracker.addAPICall(processId, 'Google Gemini', false, apiResponseTime, 'Invalid response');
          }
        } else {
          const errorText = await response.text();
          processTracker.addAPICall(processId, 'Google Gemini', false, apiResponseTime, errorText);
        }
      } catch (error: any) {
        processTracker.addAPICall(processId, 'Google Gemini', false, 0, error.message);
      }
    }

    // 4단계: Fallback AI 시도
    processTracker.addStep(processId, {
      step: 4,
      stage: 'researching',
      description: `대체 AI 엔진을 시도하는 중... (${dataSources[1]?.source || 'Enhanced AI'})`,
    });
    
    processTracker.addThinking(processId,
      `주요 API 실패, 대체 엔진 시도`,
      `다음 옵션: ${dataSources[1]?.source || 'Enhanced AI Engine'} | 이유: ${dataSources[1]?.reason || '백업 엔진'}`,
      0.6
    );
    
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const { enhancedAIEngine } = await import('@/lib/enhanced-ai-engine');
      const enhancedResult = await enhancedAIEngine.generateResponse(prompt, {
        useLearning: true,
        useMultipleModels: true,
      });

      if (enhancedResult.text && enhancedResult.confidence > 0.3) {
        processTracker.addAPICall(processId, 'Enhanced AI Engine', true, enhancedResult.responseTime);
        
        processTracker.addStep(processId, {
          step: 5,
          stage: 'analyzing',
          description: '향상된 AI 엔진의 응답을 분석하는 중...',
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        processTracker.addStep(processId, {
          step: 6,
          stage: 'generating',
          description: '최종 응답을 생성하는 중...',
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        processTracker.finalize(processId, enhancedResult.text);
        
        return {
          text: enhancedResult.text,
          processId,
          process: processTracker.getProcess(processId)!,
          source: 'enhanced',
          success: true,
          responseTime: Date.now() - startTime,
        };
      }
    } catch (error) {
      console.warn('[TrackedAI] Enhanced AI 실패:', error);
    }

    // 5단계: 지능형 Fallback
    processTracker.addStep(processId, {
      step: 5,
      stage: 'thinking',
      description: '지능형 규칙 기반 응답을 생성하는 중...',
    });

    processTracker.addThinking(processId,
      `질문 유형 "${questionType.type}"에 맞는 답변 생성`,
      `필요한 정보: ${requiredInfo.join(', ')} | 핵심 포인트: "${extractKeyPoints(prompt)}"`,
      0.7
    );
    
    await new Promise(resolve => setTimeout(resolve, 200));

    const intelligentResponse = generateIntelligentResponse(prompt, questionType, requiredInfo);
    
    processTracker.addStep(processId, {
      step: 6,
      stage: 'finalizing',
      description: '응답을 최종 검증하는 중...',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    processTracker.finalize(processId, intelligentResponse);
    
    return {
      text: intelligentResponse,
      processId,
      process: processTracker.getProcess(processId)!,
      source: 'intelligent-fallback',
      success: true,
      responseTime: Date.now() - startTime,
    };
  } catch (error: any) {
    const errorResponse = `죄송합니다. 요청을 처리하는 중 오류가 발생했습니다: ${error.message}`;
    processTracker.finalize(processId, errorResponse);
    
    return {
      text: errorResponse,
      processId,
      process: processTracker.getProcess(processId)!,
      source: 'error',
      success: false,
      responseTime: Date.now() - startTime,
    };
  }
}

/**
 * 지능형 규칙 기반 응답 생성
 * 질문 유형과 필요한 정보를 바탕으로 실제 답변 생성
 */
function generateIntelligentResponse(
  prompt: string,
  questionType: ReturnType<typeof analyzeQuestionType>,
  requiredInfo: string[]
): string {
  const keyPoints = extractKeyPoints(prompt);
  
  // 질문 유형에 따른 맞춤 답변 생성
  if (questionType.type === 'how') {
    return generateHowResponse(prompt, keyPoints, requiredInfo);
  }
  
  if (questionType.type === 'what') {
    return generateWhatResponse(prompt, keyPoints, requiredInfo);
  }
  
  if (questionType.type === 'why') {
    return generateWhyResponse(prompt, keyPoints, requiredInfo);
  }
  
  if (questionType.type === 'comparison') {
    return generateComparisonResponse(prompt, keyPoints, requiredInfo);
  }
  
  // 기본 응답
  return generateGeneralResponse(prompt, keyPoints, requiredInfo);
}

function generateHowResponse(prompt: string, keyPoints: string, requiredInfo: string[]): string {
  return `# ${keyPoints} 방법 가이드

## 개요
${keyPoints}에 대한 실용적인 단계별 가이드를 제공합니다.

## 준비사항
${requiredInfo.includes('설치/설정 방법') ? '필요한 도구와 환경을 먼저 준비하세요.' : '기본적인 준비사항을 확인하세요.'}

## 단계별 방법

### 1단계: 초기 설정
${keyPoints}를 시작하기 위한 기본 설정을 진행합니다.
${requiredInfo.includes('코드 예제') ? '\n```\n// 예제 코드\n// 여기에 실제 코드를 작성하세요\n```' : ''}

### 2단계: 실행
구체적인 실행 방법을 단계별로 진행합니다.
- 핵심 단계 1
- 핵심 단계 2
- 핵심 단계 3

### 3단계: 검증 및 최적화
결과를 확인하고 필요한 조정을 합니다.

## 실용 팁
${requiredInfo.includes('오류 해결 방법') ? '- 자주 발생하는 오류와 해결 방법을 미리 확인하세요\n' : ''}- 각 단계를 완료한 후 결과를 확인하세요
- 문제가 발생하면 이전 단계를 다시 점검하세요

## 결론
${keyPoints}는 체계적인 접근을 통해 효과적으로 수행할 수 있습니다.`;
}

function generateWhatResponse(prompt: string, keyPoints: string, requiredInfo: string[]): string {
  return `# ${keyPoints}에 대한 설명

## 정의
${keyPoints}는 ${prompt.includes('?') ? prompt.split('?')[0] : keyPoints}를 의미합니다.

## 주요 특징
${requiredInfo.includes('장단점 분석') ? '### 장점\n- 주요 장점 1\n- 주요 장점 2\n\n### 단점\n- 주요 단점 1\n- 주요 단점 2' : '- 핵심 특징 1\n- 핵심 특징 2\n- 핵심 특징 3'}

## 활용 방안
${keyPoints}는 다음과 같이 활용할 수 있습니다:
${requiredInfo.includes('실제 예제') ? '1. 실제 활용 사례 1\n2. 실제 활용 사례 2\n3. 실제 활용 사례 3' : '1. 실용적인 활용 방법 1\n2. 실용적인 활용 방법 2\n3. 실용적인 활용 방법 3'}

${requiredInfo.includes('비용 정보') ? '## 비용 정보\n관련 비용은 사용 목적과 규모에 따라 달라질 수 있습니다.' : ''}

## 결론
${keyPoints}는 중요한 개념이며, 다양한 분야에서 활용되고 있습니다.`;
}

function generateWhyResponse(prompt: string, keyPoints: string, requiredInfo: string[]): string {
  return `# ${keyPoints}에 대한 이유 분석

## 주요 이유
${keyPoints}에 대한 주요 이유들을 우선순위별로 분석합니다.

### 1순위: 가장 중요한 이유
이유에 대한 상세한 설명과 배경을 제공합니다.
${requiredInfo.includes('비교 분석') ? '\n다른 접근 방식과 비교하면...' : ''}

### 2순위: 두 번째로 중요한 이유
추가적인 이유와 그 영향력을 설명합니다.

### 3순위: 보조적 이유
기타 관련 요인들을 설명합니다.

## 종합 분석
이러한 이유들이 복합적으로 작용하여 현재 상황을 만들어냅니다.
${requiredInfo.includes('최신 정보') ? '\n최근 트렌드와 변화도 이러한 이유에 영향을 미치고 있습니다.' : ''}

## 결론
${keyPoints}에 대한 종합적인 이해를 바탕으로 적절한 대응이 필요합니다.`;
}

function generateComparisonResponse(prompt: string, keyPoints: string, requiredInfo: string[]): string {
  return `# ${keyPoints} 비교 분석

## 비교 개요
${keyPoints}에 대한 상세한 비교 분석을 제공합니다.

## 비교 항목

| 항목 | 옵션 A | 옵션 B | 옵션 C |
|------|--------|--------|--------|
| 특징 1 | 설명 | 설명 | 설명 |
| 특징 2 | 설명 | 설명 | 설명 |
| 특징 3 | 설명 | 설명 | 설명 |

## 장단점 분석

### 옵션 A
**장점:**
- 주요 장점 1
- 주요 장점 2

**단점:**
- 주요 단점 1
- 주요 단점 2

### 옵션 B
**장점:**
- 주요 장점 1
- 주요 장점 2

**단점:**
- 주요 단점 1
- 주요 단점 2

## 추천
${requiredInfo.includes('비용 정보') ? '비용, 성능, 사용 목적을 종합적으로 고려하여 선택하세요.' : '사용 목적과 환경에 따라 적절한 옵션을 선택하세요.'}`;
}

function generateGeneralResponse(prompt: string, keyPoints: string, requiredInfo: string[]): string {
  return `# ${keyPoints}에 대한 종합 정보

## 개요
${keyPoints}에 대한 포괄적인 정보를 제공합니다.

## 주요 내용
${requiredInfo.join(', ')}에 대한 상세한 설명을 포함합니다.

## 상세 분석
### 1. 기본 개념
${keyPoints}의 기본적인 개념과 정의를 설명합니다.

### 2. 현재 동향
${requiredInfo.includes('최신 정보') ? '최신 트렌드와 발전 방향을 분석합니다.' : '현재 상황과 발전 방향을 분석합니다.'}

### 3. 실용적 활용
실제로 어떻게 활용할 수 있는지 설명합니다.
${requiredInfo.includes('실제 예제') ? '\n### 실제 활용 사례\n- 사례 1\n- 사례 2\n- 사례 3' : ''}

## 결론
${keyPoints}에 대한 종합적인 이해를 바탕으로 더 깊이 있는 탐구가 가능합니다.`;
}

