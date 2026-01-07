/**
 * 멀티모달 AI 시스템
 * 텍스트, 이미지, 영상, 오디오 등 모든 형태의 콘텐츠 제작 지원
 */

export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'code' | 'design';

export interface ContentRequest {
  type: ContentType;
  prompt: string;
  style?: string;
  format?: string;
  requirements?: Record<string, any>;
}

export class MultimodalAI {
  /**
   * 콘텐츠 생성
   */
  async generateContent(request: ContentRequest): Promise<{
    content: string;
    metadata?: any;
    suggestions?: string[];
  }> {
    switch (request.type) {
      case 'text':
        return await this.generateText(request);
      case 'image':
        return await this.generateImagePrompt(request);
      case 'video':
        return await this.generateVideoScript(request);
      case 'code':
        return await this.generateCode(request);
      case 'design':
        return await this.generateDesignGuide(request);
      default:
        return { content: '지원하지 않는 콘텐츠 타입입니다.' };
    }
  }

  /**
   * 텍스트 생성 (블로그, 기사, 스토리 등)
   */
  private async generateText(request: ContentRequest): Promise<any> {
    const prompt = `당신은 전문 작가입니다. 다음 요청에 맞는 고품질 텍스트를 작성해주세요.

요청: ${request.prompt}
스타일: ${request.style || '일반'}
형식: ${request.format || '기사'}

다음 요소를 포함해주세요:
- 매력적인 제목
- 명확한 구조
- 독자에게 유용한 정보
- 적절한 문체와 톤`;

    return await this.callAI(prompt);
  }

  /**
   * 이미지 제작 가이드 및 프롬프트 생성
   */
  private async generateImagePrompt(request: ContentRequest): Promise<any> {
    const prompt = `당신은 전문 이미지 제작자입니다. 다음 요청에 맞는 이미지를 제작할 수 있도록 상세한 가이드를 제공해주세요.

요청: ${request.prompt}
스타일: ${request.style || '일반'}

다음을 포함해주세요:
1. 이미지 프롬프트 (AI 이미지 생성기용)
2. 시각적 구성 설명
3. 색상 팔레트
4. 레이아웃 가이드
5. 제작 단계별 가이드`;

    return await this.callAI(prompt);
  }

  /**
   * 영상 스크립트 생성
   */
  private async generateVideoScript(request: ContentRequest): Promise<any> {
    const prompt = `당신은 전문 영상 제작자입니다. 다음 요청에 맞는 영상 스크립트를 작성해주세요.

요청: ${request.prompt}
스타일: ${request.style || '교육용'}
형식: ${request.format || '유튜브'}

다음을 포함해주세요:
1. 영상 기획 (주제, 목표, 타겟)
2. 씬별 스크립트
3. 시각적 요소 설명
4. 편집 가이드
5. 썸네일 아이디어
6. 마케팅 전략`;

    return await this.callAI(prompt);
  }

  /**
   * 코드 생성
   */
  private async generateCode(request: ContentRequest): Promise<any> {
    const prompt = `당신은 전문 개발자입니다. 다음 요청에 맞는 코드를 작성해주세요.

요청: ${request.prompt}
언어: ${request.format || 'JavaScript'}

다음을 포함해주세요:
1. 완전한 코드
2. 코드 설명
3. 사용 방법
4. 주의사항`;

    return await this.callAI(prompt);
  }

  /**
   * 디자인 가이드 생성
   */
  private async generateDesignGuide(request: ContentRequest): Promise<any> {
    const prompt = `당신은 전문 디자이너입니다. 다음 요청에 맞는 디자인 가이드를 제공해주세요.

요청: ${request.prompt}
스타일: ${request.style || '모던'}

다음을 포함해주세요:
1. 디자인 컨셉
2. 색상 팔레트
3. 타이포그래피
4. 레이아웃 구조
5. UI/UX 가이드
6. 제작 도구 추천`;

    return await this.callAI(prompt);
  }

  /**
   * AI API 호출
   */
  private async callAI(prompt: string): Promise<any> {
    const geminiKey = process.env.GOOGLE_API_KEY;
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
                temperature: 0.8,
                maxOutputTokens: 4096,
                topP: 0.95,
                topK: 40,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              content: text,
              metadata: {
                source: 'gemini',
                tokens: data.usageMetadata?.totalTokenCount,
              },
            };
          }
        }
      } catch (error) {
        console.error('[MultimodalAI] API 오류:', error);
      }
    }

    // Fallback
    return {
      content: `${prompt}\n\n위 요청에 대한 콘텐츠를 생성하려면 GOOGLE_API_KEY를 설정하세요.`,
      metadata: { source: 'fallback' },
    };
  }
}

export const multimodalAI = new MultimodalAI();

