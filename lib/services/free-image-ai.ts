/**
 * 완전 무료 이미지 AI 서비스
 * Stable Diffusion 통합
 */

export interface ImageAIResponse {
  imageUrl: string;
  source: 'stable-diffusion' | 'huggingface-diffusion' | 'fallback';
  success: boolean;
  responseTime: number;
}

/**
 * 텍스트로부터 이미지 생성
 */
export async function generateImage(
  prompt: string,
  options?: {
    width?: number;
    height?: number;
    steps?: number;
    guidance?: number;
  }
): Promise<ImageAIResponse> {
  const startTime = Date.now();

  // 1순위: Hugging Face Stable Diffusion (무료)
  try {
    const result = await tryHuggingFaceDiffusion(prompt, options);
    if (result.success) {
      return {
        ...result,
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.warn('[FreeImageAI] Hugging Face Diffusion 실패:', error);
  }

  // 2순위: Stable Diffusion WebUI API (로컬 실행)
  try {
    const result = await tryStableDiffusionLocal(prompt, options);
    if (result.success) {
      return {
        ...result,
        responseTime: Date.now() - startTime,
      };
    }
  } catch (error) {
    console.warn('[FreeImageAI] Stable Diffusion Local 실패:', error);
  }

  // Fallback
  return {
    imageUrl: '',
    source: 'fallback',
    success: false,
    responseTime: Date.now() - startTime,
  };
}

/**
 * Hugging Face Stable Diffusion (무료)
 */
async function tryHuggingFaceDiffusion(
  prompt: string,
  options?: { width?: number; height?: number; steps?: number; guidance?: number }
): Promise<ImageAIResponse> {
  try {
    // 여러 Stable Diffusion 모델 시도
    const models = [
      'runwayml/stable-diffusion-v1-5',
      'stabilityai/stable-diffusion-2-1',
      'CompVis/stable-diffusion-v1-4',
    ];

    for (const model of models) {
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
                width: options?.width || 512,
                height: options?.height || 512,
                num_inference_steps: options?.steps || 20,
                guidance_scale: options?.guidance || 7.5,
              },
            }),
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          return {
            imageUrl,
            source: 'huggingface-diffusion',
            success: true,
            responseTime: 0,
          };
        } else if (response.status === 503) {
          // 모델이 로딩 중일 수 있음, 다음 모델 시도
          console.warn(`[FreeImageAI] Hugging Face 모델 ${model} 로딩 중, 다음 모델 시도...`);
          continue;
        }
      } catch (error) {
        console.warn(`[FreeImageAI] Hugging Face 모델 ${model} 오류:`, error);
        continue;
      }
    }
  } catch (error) {
    console.warn('[FreeImageAI] Hugging Face Diffusion 오류:', error);
  }

  return {
    imageUrl: '',
    source: 'huggingface-diffusion',
    success: false,
    responseTime: 0,
  };
}

/**
 * Stable Diffusion WebUI (로컬 실행)
 */
async function tryStableDiffusionLocal(
  prompt: string,
  options?: { width?: number; height?: number; steps?: number; guidance?: number }
): Promise<ImageAIResponse> {
  // Stable Diffusion WebUI는 기본적으로 localhost:7860에서 실행
  const sdUrl = process.env.STABLE_DIFFUSION_URL || 'http://localhost:7860';
  
  try {
    const response = await fetch(`${sdUrl}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        width: options?.width || 512,
        height: options?.height || 512,
        steps: options?.steps || 20,
        cfg_scale: options?.guidance || 7.5,
      }),
      signal: AbortSignal.timeout(60000), // 60초 타임아웃
    });

    if (response.ok) {
      const data = await response.json();
      if (data.images && data.images.length > 0) {
        // Base64 이미지를 Blob URL로 변환
        const base64Image = data.images[0];
        const imageBlob = await fetch(`data:image/png;base64,${base64Image}`).then(r => r.blob());
        const imageUrl = URL.createObjectURL(imageBlob);
        
        console.log('[FreeImageAI] ✅ Stable Diffusion Local 성공');
        return {
          imageUrl,
          source: 'stable-diffusion',
          success: true,
          responseTime: 0,
        };
      }
    }
  } catch (error: any) {
    // Stable Diffusion이 실행되지 않았을 수 있음 (정상)
    if (error.name === 'AbortError' || error.message?.includes('fetch')) {
      console.log('[FreeImageAI] Stable Diffusion 사용 불가 (서버가 실행되지 않았을 수 있음)');
    } else {
      console.warn('[FreeImageAI] Stable Diffusion Local 오류:', error);
    }
  }

  return {
    imageUrl: '',
    source: 'stable-diffusion',
    success: false,
    responseTime: 0,
  };
}
