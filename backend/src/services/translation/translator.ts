import OpenAI from 'openai'
import { logger } from '../../utils/logger'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

/**
 * 지원 언어 목록 (전세계 주요 언어)
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', name: '한국어', region: 'Asia' },
  { code: 'en', name: 'English', region: 'Global' },
  { code: 'en-US', name: 'English (US)', region: 'North America' },
  { code: 'en-GB', name: 'English (UK)', region: 'Europe' },
  { code: 'ja', name: '日本語', region: 'Asia' },
  { code: 'zh', name: '中文', region: 'Asia' },
  { code: 'zh-CN', name: '中文 (简体)', region: 'Asia' },
  { code: 'zh-TW', name: '中文 (繁體)', region: 'Asia' },
  { code: 'es', name: 'Español', region: 'Latin America' },
  { code: 'es-ES', name: 'Español (España)', region: 'Europe' },
  { code: 'es-MX', name: 'Español (México)', region: 'Latin America' },
  { code: 'fr', name: 'Français', region: 'Europe' },
  { code: 'de', name: 'Deutsch', region: 'Europe' },
  { code: 'pt', name: 'Português', region: 'Latin America' },
  { code: 'pt-BR', name: 'Português (Brasil)', region: 'Latin America' },
  { code: 'ru', name: 'Русский', region: 'Europe' },
  { code: 'ar', name: 'العربية', region: 'Middle East' },
  { code: 'hi', name: 'हिन्दी', region: 'Asia' },
  { code: 'th', name: 'ไทย', region: 'Asia' },
  { code: 'vi', name: 'Tiếng Việt', region: 'Asia' },
  { code: 'id', name: 'Bahasa Indonesia', region: 'Asia' },
  { code: 'it', name: 'Italiano', region: 'Europe' },
  { code: 'nl', name: 'Nederlands', region: 'Europe' },
  { code: 'pl', name: 'Polski', region: 'Europe' },
  { code: 'tr', name: 'Türkçe', region: 'Middle East' }
]

/**
 * 텍스트 번역 (OpenAI 또는 Google Translate)
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = 'ko'
): Promise<string> {
  logger.info('텍스트 번역:', { from: sourceLanguage, to: targetLanguage, length: text.length })

  if (sourceLanguage === targetLanguage) {
    return text
  }

  try {
    // OpenAI를 사용한 번역 (고품질)
    if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the following text to ${getLanguageName(targetLanguage)}. Maintain the tone, style, and meaning. For YouTube content, make it engaging and natural.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const translated = response.choices[0].message.content || text
      logger.info('번역 완료 (OpenAI)')
      return translated
    }

    // Google Translate API 사용 (대체)
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY
    if (googleApiKey) {
      try {
        const { v2 } = await import('@google-cloud/translate')
        const translate = new v2.Translate({ key: googleApiKey })
        const [translated] = await translate.translate(text, targetLanguage)
        logger.info('번역 완료 (Google Translate)')
        return translated as string
      } catch (error) {
        logger.warn('Google Translate API 실패:', error)
      }
    }
    
    logger.warn('번역 API가 없습니다. 원본 텍스트 반환')
    return text

  } catch (error) {
    logger.error('번역 실패:', error)
    return text // 실패 시 원본 반환
  }
}

/**
 * 언어 코드로 언어 이름 가져오기
 */
function getLanguageName(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
  return lang ? lang.name : code
}

/**
 * 콘텐츠 전체 번역 (제목, 설명, 대본, 태그)
 */
export async function translateContent(
  content: {
    title: string
    description: string
    script?: string
    tags?: string[]
  },
  targetLanguage: string,
  sourceLanguage: string = 'ko'
): Promise<{
  title: string
  description: string
  script?: string
  tags?: string[]
}> {
  logger.info('콘텐츠 전체 번역:', { targetLanguage })

  const [title, description, script, tags] = await Promise.all([
    translateText(content.title, targetLanguage, sourceLanguage),
    translateText(content.description, targetLanguage, sourceLanguage),
    content.script ? translateText(content.script, targetLanguage, sourceLanguage) : Promise.resolve(undefined),
    content.tags ? Promise.all(
      content.tags.map(tag => translateText(tag, targetLanguage, sourceLanguage))
    ) : Promise.resolve(undefined)
  ])

  return {
    title,
    description,
    script,
    tags
  }
}

/**
 * 여러 언어로 일괄 번역
 */
export async function translateToMultipleLanguages(
  content: {
    title: string
    description: string
    script?: string
    tags?: string[]
  },
  targetLanguages: string[],
  sourceLanguage: string = 'ko'
): Promise<Record<string, {
  title: string
  description: string
  script?: string
  tags?: string[]
}>> {
  logger.info('다국어 번역 시작:', { languages: targetLanguages })

  const translations: Record<string, any> = {}

  // 병렬 번역 (API 제한 고려하여 배치 처리)
  const batchSize = 5
  for (let i = 0; i < targetLanguages.length; i += batchSize) {
    const batch = targetLanguages.slice(i, i + batchSize)
    const batchTranslations = await Promise.all(
      batch.map(lang => 
        translateContent(content, lang, sourceLanguage).then(translated => ({
          lang,
          translated
        }))
      )
    )

    batchTranslations.forEach(({ lang, translated }) => {
      translations[lang] = translated
    })
  }

  logger.info('다국어 번역 완료:', { count: Object.keys(translations).length })
  return translations
}

/**
 * 지역별 최적화된 콘텐츠 생성
 */
export async function createLocalizedContent(
  content: {
    title: string
    description: string
    script?: string
    tags?: string[]
  },
  region: string
): Promise<{
  title: string
  description: string
  script?: string
  tags?: string[]
  localizedTags?: string[]
}> {
  logger.info('지역별 콘텐츠 최적화:', { region })

  // 지역별 언어 매핑
  const regionLanguages: Record<string, string> = {
    'Asia': 'ko',
    'North America': 'en-US',
    'Europe': 'en-GB',
    'Latin America': 'es',
    'Middle East': 'ar'
  }

  const targetLanguage = regionLanguages[region] || 'en'

  // 번역
  const translated = await translateContent(content, targetLanguage)

  // 지역별 트렌드 태그 추가
  const localizedTags = await getRegionalTrendingTags(region, targetLanguage)

  return {
    ...translated,
    localizedTags: [...(translated.tags || []), ...localizedTags]
  }
}

/**
 * 지역별 트렌딩 태그 가져오기
 */
async function getRegionalTrendingTags(region: string, language: string): Promise<string[]> {
  // 실제로는 지역별 트렌드 API 사용
  // 여기서는 기본 태그 반환
  const regionalTags: Record<string, string[]> = {
    'Asia': ['#asia', '#trending', '#viral'],
    'North America': ['#usa', '#trending', '#viral'],
    'Europe': ['#europe', '#trending', '#viral'],
    'Latin America': ['#latam', '#trending', '#viral'],
    'Middle East': ['#middleeast', '#trending', '#viral']
  }

  return regionalTags[region] || []
}

