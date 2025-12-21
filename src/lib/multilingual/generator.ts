/**
 * 전세계 수익화 시스템
 * 25개 이상 언어 지원, 다국어 콘텐츠 생성
 */

import { runAutomationPipeline, PipelineOptions, PipelineResult } from '@/lib/automation/pipeline';

export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', native: '한국어' },
  { code: 'en', name: '영어', native: 'English' },
  { code: 'ja', name: '일본어', native: '日本語' },
  { code: 'zh-CN', name: '중국어 (간체)', native: '简体中文' },
  { code: 'zh-TW', name: '중국어 (번체)', native: '繁體中文' },
  { code: 'es', name: '스페인어', native: 'Español' },
  { code: 'fr', name: '프랑스어', native: 'Français' },
  { code: 'de', name: '독일어', native: 'Deutsch' },
  { code: 'it', name: '이탈리아어', native: 'Italiano' },
  { code: 'pt', name: '포르투갈어', native: 'Português' },
  { code: 'ru', name: '러시아어', native: 'Русский' },
  { code: 'ar', name: '아랍어', native: 'العربية' },
  { code: 'hi', name: '힌디어', native: 'हिन्दी' },
  { code: 'th', name: '태국어', native: 'ไทย' },
  { code: 'vi', name: '베트남어', native: 'Tiếng Việt' },
  { code: 'id', name: '인도네시아어', native: 'Bahasa Indonesia' },
  { code: 'tr', name: '터키어', native: 'Türkçe' },
  { code: 'pl', name: '폴란드어', native: 'Polski' },
  { code: 'nl', name: '네덜란드어', native: 'Nederlands' },
  { code: 'sv', name: '스웨덴어', native: 'Svenska' },
  { code: 'no', name: '노르웨이어', native: 'Norsk' },
  { code: 'da', name: '덴마크어', native: 'Dansk' },
  { code: 'fi', name: '핀란드어', native: 'Suomi' },
  { code: 'cs', name: '체코어', native: 'Čeština' },
  { code: 'hu', name: '헝가리어', native: 'Magyar' },
];

export interface MultilingualOptions extends PipelineOptions {
  sourceLanguage?: string;
  targetLanguages?: string[];
  autoTranslate?: boolean;
  regionalOptimization?: boolean;
}

export interface MultilingualResult {
  source: PipelineResult;
  translations: Array<{
    language: string;
    result: PipelineResult;
  }>;
  totalRevenue: number;
}

/**
 * 전세계 수익화 콘텐츠 생성
 */
export async function generateMultilingualContent(
  options: MultilingualOptions
): Promise<MultilingualResult> {
  const {
    topic,
    sourceLanguage = 'ko',
    targetLanguages = SUPPORTED_LANGUAGES.slice(0, 15).map((l) => l.code),
    autoTranslate = true,
    regionalOptimization = true,
    ...pipelineOptions
  } = options;

  // 1. 원본 콘텐츠 생성
  const source = await runAutomationPipeline({
    ...pipelineOptions,
    topic,
    language: sourceLanguage,
  });

  // 2. 다국어 번역 및 생성
  const translations = await Promise.all(
    targetLanguages.map(async (lang) => {
      let translatedTopic = topic;
      
      if (autoTranslate) {
        translatedTopic = await translateText(topic, sourceLanguage, lang);
      }

      const result = await runAutomationPipeline({
        ...pipelineOptions,
        topic: translatedTopic,
        language: lang,
      });

      // 지역별 최적화
      if (regionalOptimization) {
        const defaultSeo = {
          title: '',
          description: '',
          keywords: [],
          tags: [],
        };
        result.seo = await optimizeForRegion(result.seo || defaultSeo, lang);
      }

      return {
        language: lang,
        result,
      };
    })
  );

  // 3. 수익 계산
  const totalRevenue = calculateRevenue(source, translations);

  return {
    source,
    translations,
    totalRevenue,
  };
}

/**
 * 텍스트 번역
 */
export async function translateText(
  text: string,
  from: string,
  to: string
): Promise<string> {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('OpenAI API 키가 필요합니다');
  }

  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the text from ${from} to ${to} while maintaining the original meaning and tone.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  });

  return response.choices[0].message.content || text;
}

/**
 * 지역별 최적화
 */
async function optimizeForRegion(
  seo: PipelineResult['seo'],
  language: string
): Promise<PipelineResult['seo']> {
  if (!seo) return seo;

  // 언어별 키워드 최적화
  const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  if (langInfo) {
    // 지역별 트렌드 키워드 추가 (실제로는 더 정교한 로직 필요)
    return {
      ...seo,
      keywords: [...seo.keywords, langInfo.name],
    };
  }

  return seo;
}

/**
 * 수익 계산
 */
function calculateRevenue(
  source: PipelineResult,
  translations: Array<{ language: string; result: PipelineResult }>
): number {
  // 기본 수익: 원본 $10
  let revenue = 10;

  // 번역본당 $10 추가
  revenue += translations.length * 10;

  // SEO 최적화 보너스
  if (source.seo) {
    revenue += 5;
  }

  return revenue;
}

/**
 * 언어별 수익 시뮬레이션
 */
export function simulateRevenue(languageCount: number): {
  perVideo: number;
  monthly: number;
  yearly: number;
} {
  const perVideo = 10 * languageCount;
  const monthly = perVideo * 30; // 일 1개
  const yearly = monthly * 12;

  return {
    perVideo,
    monthly,
    yearly,
  };
}

