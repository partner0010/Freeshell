/**
 * NanoBana AI 통합
 * 이미지/캐릭터 생성
 */

import axios from 'axios';

export class NanoBanaAI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NANOBANA_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
    this.baseUrl = process.env.NANOBANA_API_URL || 'https://api.nanobana.ai/v1';
  }

  /**
   * 캐릭터 이미지 생성
   */
  async generateCharacter(
    prompt: string,
    style: 'anime' | 'realistic' | 'cartoon' | '3d' = 'anime',
    options: {
      width?: number;
      height?: number;
      seed?: number;
    } = {}
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        return await this.generateWithFallback(prompt, style, options);
      }

      const response = await axios.post(
        `${this.baseUrl}/generate/character`,
        {
          prompt: this.enhancePrompt(prompt, style),
          style,
          width: options.width || 1024,
          height: options.height || 1024,
          seed: options.seed,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      const imageUrl = response.data.imageUrl || response.data.image;
      if (imageUrl) {
        return imageUrl;
      }

      throw new Error('이미지 생성 실패: 응답에 이미지가 없습니다');
    } catch (error: any) {
      console.error('NanoBana AI 캐릭터 생성 실패:', error);
      return await this.generateWithFallback(prompt, style, options);
    }
  }

  /**
   * 대체 이미지 생성 서비스 사용 (DALL-E 등)
   */
  private async generateWithFallback(
    prompt: string,
    style: string,
    options: any
  ): Promise<string> {
    // OpenAI DALL-E 사용
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('이미지 생성 API를 사용할 수 없습니다');
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const enhancedPrompt = this.enhancePrompt(prompt, style);
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: '1024x1024',
      quality: 'hd',
      n: 1,
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('이미지 생성 실패: 응답에 데이터가 없습니다');
    }

    return response.data[0]?.url || '';
  }

  /**
   * 프롬프트 향상 (스타일 적용)
   */
  private enhancePrompt(prompt: string, style: string): string {
    const stylePrompts: Record<string, string> = {
      anime: 'anime style, high quality, detailed, vibrant colors',
      realistic: 'photorealistic, high quality, detailed, professional photography',
      cartoon: 'cartoon style, colorful, fun, animated',
      '3d': '3D rendered, high quality, detailed, modern 3D graphics',
    };

    const stylePrompt = stylePrompts[style] || '';
    return `${prompt}, ${stylePrompt}, masterpiece, best quality`;
  }
}

export const nanobanaAI = new NanoBanaAI();

