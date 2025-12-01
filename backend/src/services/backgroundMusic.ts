import path from 'path'
import fs from 'fs/promises'
import { logger } from '../utils/logger'

export interface MusicTrack {
  id: string
  name: string
  path: string
  duration: number
  genre: string[]
  mood: string[]
  bpm?: number
}

/**
 * 배경음악 라이브러리 (무료 음악)
 * YouTube Audio Library 또는 무료 음악 사이트에서 다운로드한 음악
 */
const MUSIC_LIBRARY: MusicTrack[] = [
  // 실제로는 음악 파일이 있어야 하지만, 여기서는 구조만 정의
  // 사용자는 자신의 음악 라이브러리를 추가할 수 있음
]

/**
 * 콘텐츠 분위기에 맞는 배경음악 선택
 */
export async function selectBackgroundMusic(
  contentType: string,
  mood: string,
  duration: number
): Promise<MusicTrack | null> {
  logger.info('배경음악 선택:', { contentType, mood, duration })

  // 실제 구현 시 음악 라이브러리에서 선택
  // 여기서는 기본 구조만 제공
  
  const matchingTracks = MUSIC_LIBRARY.filter(track => {
    const matchesGenre = track.genre.some(g => 
      contentType.toLowerCase().includes(g.toLowerCase())
    )
    const matchesMood = track.mood.some(m => 
      mood.toLowerCase().includes(m.toLowerCase())
    )
    return matchesGenre || matchesMood
  })

  if (matchingTracks.length === 0) {
    logger.warn('매칭되는 배경음악이 없습니다')
    return null
  }

  // 가장 적합한 트랙 선택 (랜덤 또는 점수 기반)
  const selectedTrack = matchingTracks[Math.floor(Math.random() * matchingTracks.length)]
  
  logger.info('배경음악 선택 완료:', selectedTrack.name)
  return selectedTrack
}

/**
 * 무료 배경음악 다운로드 (YouTube Audio Library)
 * 실제 구현 시 YouTube Audio Library API 또는 웹 스크래핑 사용
 */
export async function downloadFreeMusic(
  genre: string,
  mood: string
): Promise<string | null> {
  logger.info('무료 배경음악 다운로드:', { genre, mood })

  // 실제 구현 필요
  // YouTube Audio Library: https://www.youtube.com/audiolibrary
  // 또는 무료 음악 사이트 API 사용
  
  return null
}

/**
 * 비디오에 배경음악 추가 (FFmpeg 사용)
 */
export async function addBackgroundMusicToVideo(
  videoPath: string,
  musicPath: string,
  outputPath: string,
  options: {
    volume?: number // 0.0 ~ 1.0 (기본값: 0.3)
    fadeIn?: number // 페이드인 시간 (초)
    fadeOut?: number // 페이드아웃 시간 (초)
    loop?: boolean // 반복 재생
  } = {}
): Promise<string> {
  logger.info('배경음악 추가 시작:', musicPath)

  const volume = options.volume || 0.3
  const fadeIn = options.fadeIn || 1
  const fadeOut = options.fadeOut || 1

  return new Promise((resolve, reject) => {
    const ffmpeg = require('fluent-ffmpeg')
    
    let command = ffmpeg(videoPath)
      .input(musicPath)
      .outputOptions([
        '-c:v', 'copy', // 비디오는 그대로
        '-c:a', 'aac', // 오디오 코덱
        '-filter_complex', `[1:a]volume=${volume},afade=t=in:st=0:d=${fadeIn},afade=t=out:st=0:d=${fadeOut}[a1];[0:a][a1]amix=inputs=2:duration=first:dropout_transition=2`
      ])
      .output(outputPath)
      .on('end', () => {
        logger.info('배경음악 추가 완료')
        resolve(outputPath)
      })
      .on('error', (err: Error) => {
        logger.error('배경음악 추가 실패:', err)
        reject(err)
      })
      .run()
  })
}

/**
 * 무료 음악 라이브러리 초기화
 * 사용자가 음악 파일을 추가할 수 있도록 구조 제공
 */
export async function initializeMusicLibrary(musicDirectory: string): Promise<void> {
  logger.info('음악 라이브러리 초기화:', musicDirectory)

  try {
    const files = await fs.readdir(musicDirectory)
    const audioFiles = files.filter(f => 
      ['.mp3', '.wav', '.m4a', '.ogg'].includes(path.extname(f).toLowerCase())
    )

    // 실제 구현 시 음악 파일 메타데이터 읽기
    // 예: ID3 태그, 파일명에서 장르/분위기 추출 등
    
    logger.info(`음악 라이브러리 초기화 완료: ${audioFiles.length}개 파일`)
  } catch (error) {
    logger.warn('음악 라이브러리 초기화 실패:', error)
  }
}

/**
 * 음악 라이브러리에 트랙 추가
 */
export async function addTrackToLibrary(track: MusicTrack): Promise<void> {
  MUSIC_LIBRARY.push(track)
  logger.info('음악 트랙 추가:', track.name)
}

/**
 * 음악 라이브러리에서 트랙 검색
 */
export function searchMusicLibrary(
  query: string,
  filters?: {
    genre?: string[]
    mood?: string[]
    minDuration?: number
    maxDuration?: number
  }
): MusicTrack[] {
  let results = MUSIC_LIBRARY.filter(track => {
    const matchesQuery = track.name.toLowerCase().includes(query.toLowerCase())
    const matchesGenre = !filters?.genre || filters.genre.some(g => 
      track.genre.includes(g)
    )
    const matchesMood = !filters?.mood || filters.mood.some(m => 
      track.mood.includes(m)
    )
    const matchesDuration = (!filters?.minDuration || track.duration >= filters.minDuration) &&
      (!filters?.maxDuration || track.duration <= filters.maxDuration)

    return matchesQuery && matchesGenre && matchesMood && matchesDuration
  })

  return results
}

