import { logger } from '../../utils/logger'
import { translateToMultipleLanguages, SUPPORTED_LANGUAGES } from '../translation/translator'
import { generateContent } from '../contentGenerator'
import { GeneratedContent } from '../../types'
import { nanobanaAI } from '../ai/nanobanaAI'
import { klingAI } from '../ai/klingAI'
import { superToneAI } from '../ai/superToneAI'
import { generateVideo } from '../videoGenerator'
import { splitTextIntoSubtitles, addSubtitlesToVideo } from '../subtitleGenerator'

export interface MultilingualConfig {
  sourceLanguage: string
  targetLanguages: string[]
  regions?: string[] // 지역별 최적화
  generateVideos: boolean // 각 언어별로 비디오 생성 여부
}

/**
 * 다국어 콘텐츠 생성 (전세계 수익화)
 */
export async function generateMultilingualContent(
  topic: string,
  contentType: string,
  duration: number,
  config: MultilingualConfig
): Promise<Record<string, GeneratedContent[]>> {
  logger.info('다국어 콘텐츠 생성 시작:', { topic, languages: config.targetLanguages })

  // 1. 원본 콘텐츠 생성 (소스 언어)
  const sourceContents = await generateContent({
    topic,
    contentType: contentType as any,
    contentTime: duration,
    contentFormat: ['video', 'text'],
    text: ''
  })

  if (sourceContents.length === 0) {
    throw new Error('원본 콘텐츠 생성 실패')
  }

  const sourceContent = sourceContents[0]
  const results: Record<string, GeneratedContent[]> = {
    [config.sourceLanguage]: sourceContents
  }

  // 2. 각 언어로 번역 및 콘텐츠 생성
  for (const targetLanguage of config.targetLanguages) {
    try {
      logger.info(`콘텐츠 생성 중: ${targetLanguage}`)

      // 콘텐츠 번역
      const translated = await translateToMultipleLanguages(
        {
          title: sourceContent.title,
          description: sourceContent.description,
          script: sourceContent.script,
          tags: [] // 태그는 나중에 추가
        },
        [targetLanguage],
        config.sourceLanguage
      )

      const translatedContent = translated[targetLanguage]

      // 번역된 콘텐츠로 새 버전 생성
      const multilingualContent: GeneratedContent = {
        ...sourceContent,
        id: `${sourceContent.id}_${targetLanguage}`,
        title: translatedContent.title,
        description: translatedContent.description,
        script: translatedContent.script || sourceContent.script,
        topic: topic // 주제는 그대로
      }

      // 비디오 생성 (요청된 경우)
      if (config.generateVideos && multilingualContent.script) {
        try {
          // 다국어 음성 생성 (SUPERTONE AI)
          const audioPath = await superToneAI.generateContentNarration(
            multilingualContent.script,
            contentType,
            targetLanguage
          )

          // 이미지 생성 (NanoBana AI) - 번역된 대본 기반
          const imagePrompts = extractImagePrompts(multilingualContent.script, duration)
          const images = await nanobanaAI.generateMultipleCharacters(
            imagePrompts,
            'anime'
          )

          // 비디오 생성
          let videoUrl: string
          if (duration >= 60) {
            // 긴 영상은 Kling AI 사용
            const videoPrompts = splitScriptIntoClips(multilingualContent.script, duration)
            videoUrl = await klingAI.generateLongVideo(videoPrompts, {
              duration,
              transition: 'fade'
            })
          } else {
            // 짧은 영상은 기본 방법
            videoUrl = await generateVideo(
              multilingualContent,
              images,
              undefined,
              undefined,
              true
            )
          }

          // 다국어 자막 추가
          if (multilingualContent.script) {
            const subtitleSegments = splitTextIntoSubtitles(
              multilingualContent.script,
              40,
              2,
              duration
            )

            const videoWithSubtitles = videoUrl.replace('.mp4', `_${targetLanguage}_subtitles.mp4`)
            await addSubtitlesToVideo(
              videoUrl,
              subtitleSegments,
              videoWithSubtitles,
              {
                fontName: 'Arial',
                fontSize: 28,
                fontColor: '#FFFFFF',
                backgroundColor: '#000000@0.6',
                outlineColor: '#000000',
                outlineWidth: 3,
                position: 'bottom',
                marginV: 50
              }
            )
            videoUrl = videoWithSubtitles
          }

          multilingualContent.videoUrl = videoUrl
          logger.info(`다국어 비디오 생성 완료: ${targetLanguage}`)

        } catch (error) {
          logger.warn(`다국어 비디오 생성 실패 (${targetLanguage}):`, error)
        }
      }

      results[targetLanguage] = [multilingualContent]

    } catch (error) {
      logger.error(`다국어 콘텐츠 생성 실패 (${targetLanguage}):`, error)
      // 실패해도 계속 진행
    }
  }

  logger.info('다국어 콘텐츠 생성 완료:', { 
    languages: Object.keys(results).length,
    totalContents: Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
  })

  return results
}

/**
 * 대본에서 이미지 프롬프트 추출
 */
function extractImagePrompts(script: string, duration: number): string[] {
  const sentences = script.split(/[.!?]\s+/).filter(s => s.trim().length > 0)
  const imagesPerSecond = 0.2
  const targetImageCount = Math.max(1, Math.min(Math.floor(duration * imagesPerSecond), 20))
  const prompts: string[] = []
  const sentencesPerImage = Math.ceil(sentences.length / targetImageCount)

  for (let i = 0; i < sentences.length; i += sentencesPerImage) {
    const group = sentences.slice(i, i + sentencesPerImage).join('. ')
    if (group.trim()) {
      prompts.push(`Create an image for: ${group}`)
    }
  }

  return prompts.length > 0 ? prompts : ['Create an image for the video content']
}

/**
 * 대본을 여러 클립으로 분할
 */
function splitScriptIntoClips(script: string, duration: number): string[] {
  const sentences = script.split(/[.!?]\s+/).filter(s => s.trim().length > 0)
  const clipDuration = 8
  const clipCount = Math.ceil(duration / clipDuration)
  const clips: string[] = []
  const sentencesPerClip = Math.ceil(sentences.length / clipCount)

  for (let i = 0; i < sentences.length; i += sentencesPerClip) {
    const group = sentences.slice(i, i + sentencesPerClip).join('. ')
    if (group.trim()) {
      clips.push(group)
    }
  }

  return clips.length > 0 ? clips : [script]
}

/**
 * 전세계 수익화를 위한 자동화
 */
export async function generateGlobalContent(
  topic: string,
  contentType: string,
  duration: number,
  options: {
    regions?: string[] // 특정 지역만 (없으면 전체)
    languages?: string[] // 특정 언어만 (없으면 주요 언어)
    generateVideos?: boolean
  } = {}
): Promise<Record<string, GeneratedContent[]>> {
  // 기본 설정
  const regions = options.regions || ['Asia', 'North America', 'Europe', 'Latin America']
  const languages = options.languages || [
    'ko', 'en-US', 'en-GB', 'ja', 'zh-CN', 'es', 'pt-BR', 'fr', 'de', 'ru', 'ar', 'hi', 'th', 'vi', 'id'
  ]

  // 지역별 언어 매핑
  const regionLanguageMap: Record<string, string[]> = {
    'Asia': ['ko', 'ja', 'zh-CN', 'zh-TW', 'hi', 'th', 'vi', 'id'],
    'North America': ['en-US', 'es-MX'],
    'Europe': ['en-GB', 'fr', 'de', 'it', 'nl', 'pl', 'ru'],
    'Latin America': ['es', 'pt-BR'],
    'Middle East': ['ar', 'tr']
  }

  // 선택된 지역의 언어만 필터링
  const targetLanguages = languages.filter(lang => {
    return regions.some(region => 
      regionLanguageMap[region]?.includes(lang)
    )
  })

  return await generateMultilingualContent(topic, contentType, duration, {
    sourceLanguage: 'ko',
    targetLanguages: targetLanguages.length > 0 ? targetLanguages : languages,
    regions,
    generateVideos: options.generateVideos !== false
  })
}

