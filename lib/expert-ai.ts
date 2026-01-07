/**
 * 전문가 AI 시스템
 * 역할별로 최적화된 AI 응답 생성
 */

export type ExpertMode = 
  | 'developer'      // 개발자 (Cursor처럼)
  | 'writer'         // 작가
  | 'designer'        // 디자이너
  | 'video-creator'   // 영상 제작자
  | 'image-creator'   // 이미지 제작자
  | 'teacher'         // 교사
  | 'researcher'      // 연구원
  | 'general';        // 일반

export interface ExpertConfig {
  mode: ExpertMode;
  context?: string;
  preferences?: Record<string, any>;
}

export class ExpertAI {
  /**
   * 전문가 모드별 프롬프트 생성
   */
  generateExpertPrompt(userPrompt: string, config: ExpertConfig): string {
    const basePrompt = this.getBasePrompt(config.mode);
    const contextPrompt = config.context ? `\n\n[맥락] ${config.context}` : '';
    const preferencesPrompt = config.preferences 
      ? `\n\n[선호사항] ${JSON.stringify(config.preferences)}`
      : '';

    return `${basePrompt}${contextPrompt}${preferencesPrompt}\n\n[사용자 요청] ${userPrompt}`;
  }

  /**
   * 모드별 기본 프롬프트
   */
  private getBasePrompt(mode: ExpertMode): string {
    switch (mode) {
      case 'developer':
        return `당신은 Cursor AI처럼 뛰어난 개발자 AI입니다.

능력:
- 코드를 읽고 이해하고 분석할 수 있습니다
- 최적의 코드를 생성하고 개선할 수 있습니다
- 버그를 찾고 수정할 수 있습니다
- 아키텍처와 디자인 패턴을 제안할 수 있습니다
- 실시간으로 코드를 리팩토링할 수 있습니다
- 사용자의 의도를 정확히 파악합니다

응답 스타일:
- 명확하고 실행 가능한 코드 제공
- 코드 설명과 함께 제공
- 최신 베스트 프랙티스 준수
- 성능과 가독성 모두 고려`;

      case 'writer':
        return `당신은 전문 작가 AI입니다.

능력:
- 매력적인 스토리텔링
- 다양한 문체와 톤 조절
- 독자에게 감동을 주는 글 작성
- 논리적이고 설득력 있는 글 구성

응답 스타일:
- 창의적이고 독창적인 내용
- 명확하고 이해하기 쉬운 문장
- 적절한 문체와 톤 유지`;

      case 'video-creator':
        return `당신은 전문 영상 제작자 AI입니다.

능력:
- 영상 기획 및 스크립트 작성
- 씬 구성 및 스토리보드 제작
- 편집 가이드 제공
- 썸네일 및 마케팅 전략

응답 스타일:
- 실용적이고 실행 가능한 기획
- 단계별 가이드 제공
- 최신 트렌드 반영`;

      case 'image-creator':
        return `당신은 전문 이미지 제작자 AI입니다.

능력:
- 이미지 기획 및 디자인 가이드
- 프롬프트 최적화
- 시각적 구성 제안
- 브랜드 일관성 유지

응답 스타일:
- 구체적이고 시각적인 설명
- 실용적인 제작 가이드
- 창의적인 아이디어 제공`;

      case 'teacher':
        return `당신은 전문 교사 AI입니다.

능력:
- 복잡한 개념을 쉽게 설명
- 단계별 학습 가이드 제공
- 예제와 연습 문제 제시
- 학습자의 이해도에 맞춘 설명

응답 스타일:
- 명확하고 체계적인 설명
- 예제와 비유 활용
- 학습자 중심의 접근`;

      case 'researcher':
        return `당신은 전문 연구원 AI입니다.

능력:
- 깊이 있는 연구 및 분석
- 신뢰할 수 있는 정보 수집
- 논리적 결론 도출
- 다양한 관점 제시

응답 스타일:
- 정확하고 검증된 정보
- 객관적이고 균형잡힌 분석
- 출처와 근거 명시`;

      default:
        return `당신은 유용하고 정확한 정보를 제공하는 AI입니다.`;
    }
  }

  /**
   * 멀티모달 작업 처리
   */
  async handleMultimodalTask(
    task: string,
    mode: ExpertMode,
    options?: {
      format?: 'text' | 'markdown' | 'json';
      includeCode?: boolean;
      includeImages?: boolean;
    }
  ): Promise<string> {
    const config: ExpertConfig = { mode };
    const prompt = this.generateExpertPrompt(task, config);
    
    // 실제 AI API 호출
    const geminiKey = process.env.GOOGLE_API_KEY;
    console.log('[ExpertAI] API 키 확인:', {
      exists: !!geminiKey,
      length: geminiKey?.length || 0,
      prefix: geminiKey ? geminiKey.substring(0, 10) + '...' : '없음',
      mode,
      promptLength: prompt.length,
    });
    
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: this.getTemperature(mode),
                maxOutputTokens: this.getMaxTokens(mode),
                topP: 0.95,
                topK: 40,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text && text.trim()) {
            console.log('[ExpertAI] ✅ API 호출 성공, 응답 길이:', text.length);
            return this.formatResponse(text, mode, options);
          } else {
            console.warn('[ExpertAI] ⚠️ API 응답이 비어있습니다:', JSON.stringify(data, null, 2));
          }
        } else {
          const errorText = await response.text();
          console.error('[ExpertAI] ❌ API 오류 응답:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText.substring(0, 500),
            apiKeyExists: !!geminiKey,
            apiKeyLength: geminiKey?.length || 0,
            apiKeyPrefix: geminiKey ? geminiKey.substring(0, 10) + '...' : '없음',
          });
        }
      } catch (error: any) {
        console.error('[ExpertAI] API 호출 오류:', error.message);
      }
    }

    // Fallback: local-ai 또는 규칙 기반 응답
    // API 키가 있지만 실패한 경우, local-ai를 시도
    if (geminiKey && geminiKey.trim() !== '') {
      try {
        const { generateLocalAI } = await import('@/lib/local-ai');
        const localResponse = await generateLocalAI(prompt);
        if (localResponse && localResponse.text && localResponse.text.trim()) {
          return this.formatResponse(localResponse.text, mode, options);
        }
      } catch (error) {
        console.error('[ExpertAI] Local AI fallback 오류:', error);
      }
    }

    // 최종 Fallback: 규칙 기반 응답 (API 키가 없을 때만 메시지 표시)
    return this.generateFallbackResponse(task, mode, !!geminiKey);
  }

  /**
   * 모드별 Temperature 설정
   */
  private getTemperature(mode: ExpertMode): number {
    switch (mode) {
      case 'developer':
        return 0.3; // 코드는 정확해야 함
      case 'researcher':
        return 0.4; // 연구는 정확성 중요
      case 'writer':
      case 'video-creator':
      case 'image-creator':
        return 0.8; // 창의적 작업은 높은 temperature
      default:
        return 0.7;
    }
  }

  /**
   * 모드별 Max Tokens 설정
   */
  private getMaxTokens(mode: ExpertMode): number {
    switch (mode) {
      case 'developer':
        return 4096; // 코드는 길 수 있음
      case 'writer':
        return 8192; // 긴 글 작성
      case 'video-creator':
        return 4096; // 스크립트 작성
      default:
        return 2048;
    }
  }

  /**
   * 응답 포맷팅
   */
  private formatResponse(text: string, mode: ExpertMode, options?: any): string {
    // 모드별 추가 포맷팅
    if (mode === 'developer' && options?.includeCode) {
      // 코드 블록 강조
      return text;
    }
    
    return text;
  }

  /**
   * Fallback 응답 생성
   */
  private generateFallbackResponse(task: string, mode: ExpertMode, hasApiKey: boolean = false): string {
    const basePrompt = this.getBasePrompt(mode);
    
    if (hasApiKey) {
      // API 키가 있지만 호출이 실패한 경우
      return `${basePrompt}\n\n[요청] ${task}\n\n죄송합니다. AI API 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 문제가 계속되면 관리자에게 문의해주세요.`;
    } else {
      // API 키가 없는 경우
      return `${basePrompt}\n\n[요청] ${task}\n\n위 요청에 대해 전문가 수준의 답변을 제공하려면 GOOGLE_API_KEY를 설정하세요.`;
    }
  }
}

export const expertAI = new ExpertAI();

