/**
 * STEP 2: 이미지·배경·스타일 자동 생성 파이프라인
 * Scene 정보 기반 비주얼 자산 자동 생성
 */

import sceneExample from '../final-specs/scene-character-final.json';

// SceneJSON 타입 정의
export type SceneJSON = typeof sceneExample.scene;

/**
 * 비주얼 생성 입력
 */
export interface VisualGenerationInput {
  scene: SceneJSON;
  styleKeywords: string[];
  platformPurpose: 'shortform' | 'movie' | 'ad';
  targetResolution: { width: number; height: number };
}

/**
 * 비주얼 생성 출력
 */
export interface VisualGenerationOutput {
  images: Array<{
    id: string;
    type: 'character' | 'background' | 'prop' | 'effect';
    url: string;
    metadata: {
      style: string;
      resolution: { width: number; height: number };
      generatedAt: number;
      characterId?: string;
    };
  }>;
  backgrounds: Array<{
    id: string;
    sceneId: string;
    url: string;
    type: 'image' | 'video' | '3d';
    metadata: {
      style: string;
      description: string;
      resolution: { width: number; height: number };
    };
  }>;
  styleMetadata: {
    preset: string;
    colorPalette: string[];
    mood: string;
    lighting: string;
  };
}

/**
 * ============================================
 * 전체 생성 파이프라인
 * ============================================
 */

/**
 * 단계 1: Scene → 비주얼 요구 분석
 */
export interface Step1_AnalyzeVisualRequirements {
  input: {
    scene: SceneJSON;
    styleKeywords: string[];
  };
  output: {
    requirements: {
      backgrounds: Array<{
        type: 'image' | 'video' | '3d';
        description: string;
        mood: string;
        required: boolean;
      }>;
      characters: Array<{
        characterId: string;
        poses: string[];
        expressions: string[];
        required: boolean;
      }>;
      props: Array<{
        type: string;
        description: string;
        position: { x: number; y: number; z: number };
      }>;
      effects: Array<{
        type: string;
        description: string;
        timing: { start: number; duration: number };
      }>;
    };
  };
}

/**
 * 단계 2: 스타일 프리셋 결정
 */
export interface Step2_DetermineStylePreset {
  input: {
    styleKeywords: string[];
    platformPurpose: string;
    scene: SceneJSON;
  };
  output: {
    preset: StylePreset;
    colorPalette: string[];
    mood: string;
    lighting: string;
  };
}

/**
 * 단계 3: 이미지/배경 생성
 */
export interface Step3_GenerateAssets {
  input: {
    requirements: Step1_AnalyzeVisualRequirements['output']['requirements'];
    preset: StylePreset;
  };
  output: {
    generatedAssets: Array<{
      id: string;
      type: 'background' | 'character' | 'prop' | 'effect';
      url: string;
      prompt: string;
      metadata: any;
    }>;
  };
}

/**
 * 단계 4: Scene ↔ 이미지 매핑
 */
export interface Step4_MapAssetsToScene {
  input: {
    scene: SceneJSON;
    assets: Step3_GenerateAssets['output']['generatedAssets'];
  };
  output: {
    mappedScene: SceneJSON;
    assetMapping: Array<{
      sceneElement: string;  // JSON 경로
      assetId: string;
      assetUrl: string;
    }>;
  };
}

/**
 * 단계 5: 캐시 및 재사용 전략
 */
export interface Step5_CacheAndReuse {
  input: {
    assets: VisualGenerationOutput['images'];
    scene: SceneJSON;
  };
  output: {
    cachedAssets: Array<{
      assetId: string;
      cacheKey: string;
      reuseCount: number;
    }>;
    reusableAssets: Array<{
      assetId: string;
      similarity: number;
      canReuse: boolean;
    }>;
  };
}

/**
 * ============================================
 * 스타일 프리셋 구조
 * ============================================
 */

export interface StylePreset {
  id: string;
  name: string;
  category: 'realistic' | 'anime' | 'cartoon' | 'cinematic' | 'minimal';
  parameters: {
    colorPalette: string[];
    mood: string;
    lighting: 'natural' | 'dramatic' | 'soft' | 'dark' | 'bright';
    composition: 'centered' | 'rule-of-thirds' | 'symmetrical';
    texture: 'smooth' | 'rough' | 'glossy' | 'matte';
  };
  generation: {
    model: string;  // 'stable-diffusion', 'dalle', 'midjourney' 등
    promptTemplate: string;
    negativePrompt?: string;
    settings: {
      steps: number;
      guidance: number;
      seed?: number;
    };
  };
}

export const StylePresets: Record<string, StylePreset> = {
  'realistic-modern': {
    id: 'realistic-modern',
    name: '현실적 모던',
    category: 'realistic',
    parameters: {
      colorPalette: ['#ffffff', '#f0f0f0', '#333333', '#0066cc'],
      mood: 'professional',
      lighting: 'natural',
      composition: 'rule-of-thirds',
      texture: 'smooth',
    },
    generation: {
      model: 'stable-diffusion',
      promptTemplate: 'photorealistic, modern, {description}, high quality, 4k',
      negativePrompt: 'cartoon, anime, illustration',
      settings: {
        steps: 50,
        guidance: 7.5,
      },
    },
  },
  'anime-vibrant': {
    id: 'anime-vibrant',
    name: '애니메이션 비브란트',
    category: 'anime',
    parameters: {
      colorPalette: ['#ff6b9d', '#4ecdc4', '#ffe66d', '#95e1d3'],
      mood: 'energetic',
      lighting: 'bright',
      composition: 'centered',
      texture: 'smooth',
    },
    generation: {
      model: 'stable-diffusion',
      promptTemplate: 'anime style, vibrant colors, {description}, high quality, detailed',
      negativePrompt: 'realistic, photorealistic',
      settings: {
        steps: 40,
        guidance: 8.0,
      },
    },
  },
  'cinematic-dramatic': {
    id: 'cinematic-dramatic',
    name: '시네마틱 드라마틱',
    category: 'cinematic',
    parameters: {
      colorPalette: ['#1a1a1a', '#4a4a4a', '#ffd700', '#8b0000'],
      mood: 'dramatic',
      lighting: 'dramatic',
      composition: 'rule-of-thirds',
      texture: 'glossy',
    },
    generation: {
      model: 'stable-diffusion',
      promptTemplate: 'cinematic, dramatic lighting, {description}, film grain, 4k',
      negativePrompt: 'bright, cheerful, flat lighting',
      settings: {
        steps: 60,
        guidance: 9.0,
      },
    },
  },
};

/**
 * ============================================
 * Scene ↔ 이미지 매핑 방식
 * ============================================
 */

export function mapAssetsToScene(
  scene: SceneJSON,
  assets: VisualGenerationOutput['images']
): Step4_MapAssetsToScene['output'] {
  const assetMapping: Step4_MapAssetsToScene['output']['assetMapping'] = [];
  const mappedScene = JSON.parse(JSON.stringify(scene));
  
  // 배경 매핑
  const backgroundAsset = assets.find(a => a.type === 'background');
  if (backgroundAsset) {
    mappedScene.background.source = backgroundAsset.url;
    assetMapping.push({
      sceneElement: '/background/source',
      assetId: backgroundAsset.id,
      assetUrl: backgroundAsset.url,
    });
  }
  
  // 캐릭터 이미지 매핑
  scene.characters.forEach((char, index) => {
    const characterAsset = assets.find(a => 
      a.type === 'character' && a.metadata.characterId === char.characterId
    );
    if (characterAsset) {
      assetMapping.push({
        sceneElement: `/characters/${index}/image`,
        assetId: characterAsset.id,
        assetUrl: characterAsset.url,
      });
    }
  });
  
  return {
    mappedScene,
    assetMapping,
  };
}

/**
 * ============================================
 * 수정 시 재생성 전략
 * ============================================
 */

export const RegenerationStrategy = {
  // 배경 변경 시
  backgroundChange: {
    trigger: 'scene.background.description changed',
    action: 'regenerate-background-only',
    cache: 'invalidate-background-cache',
  },
  
  // 스타일 변경 시
  styleChange: {
    trigger: 'style preset changed',
    action: 'regenerate-all-assets',
    cache: 'invalidate-all-cache',
  },
  
  // 캐릭터 변경 시
  characterChange: {
    trigger: 'character appearance changed',
    action: 'regenerate-character-assets',
    cache: 'invalidate-character-cache',
  },
  
  // 부분 수정 시
  partialChange: {
    trigger: 'minor property change',
    action: 'reuse-existing-assets',
    cache: 'keep-cache',
  },
};

/**
 * ============================================
 * 에디터 연동 방식
 * ============================================
 */

export interface EditorVisualIntegration {
  // 자산 생성 요청
  requestAssetGeneration(
    scene: SceneJSON,
    style: string,
    purpose: string
  ): Promise<VisualGenerationOutput>;
  
  // 자산 미리보기
  previewAsset(assetId: string): Promise<string>;
  
  // 자산 교체
  replaceAsset(sceneId: string, elementPath: string, newAssetId: string): void;
  
  // 자산 캐시 관리
  getCachedAsset(cacheKey: string): string | null;
  cacheAsset(assetId: string, cacheKey: string): void;
}

/**
 * ============================================
 * 캐시 키 생성 전략
 * ============================================
 */

export function generateCacheKey(
  scene: SceneJSON,
  style: string,
  element: 'background' | 'character' | 'prop'
): string {
  const key = {
    sceneId: scene.id,
    style,
    element,
    description: element === 'background' 
      ? scene.background.description 
      : scene.characters[0]?.characterId || '',
  };
  
  return `asset-${JSON.stringify(key)}-${scene.duration}`;
}

/**
 * ============================================
 * 자산 재사용 전략
 * ============================================
 */

export function findReusableAssets(
  requiredAsset: {
    type: string;
    description: string;
    style: string;
  },
  existingAssets: VisualGenerationOutput['images']
): Array<{
  assetId: string;
  similarity: number;
  canReuse: boolean;
}> {
  return existingAssets
    .filter(asset => asset.type === requiredAsset.type)
    .map(asset => {
      const similarity = calculateSimilarity(
        requiredAsset.description,
        asset.metadata.style || ''
      );
      
      return {
        assetId: asset.id,
        similarity,
        canReuse: similarity > 0.8,  // 80% 이상 유사하면 재사용
      };
    })
    .sort((a, b) => b.similarity - a.similarity);
}

function calculateSimilarity(str1: string, str2: string): number {
  // 간단한 유사도 계산 (실제로는 더 정교한 알고리즘 사용)
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  const commonWords = words1.filter(w => words2.includes(w));
  return commonWords.length / Math.max(words1.length, words2.length);
}
