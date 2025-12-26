/**
 * 음악 생성 API
 * 외부 AI 음악 생성 서비스와 연동
 */

import { NextRequest, NextResponse } from 'next/server';
import { MusicGenerator } from '@/lib/content/music-generator';
import type { MusicConfig, SongConfig } from '@/lib/content/music-generator';

export const runtime = 'nodejs';

const musicGenerator = new MusicGenerator();

// 음악 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, ...config } = body;

    if (type === 'song') {
      const songConfig = config as SongConfig;
      if (!songConfig.lyrics || !songConfig.topic) {
        return NextResponse.json(
          { error: 'lyrics와 topic이 필요합니다.' },
          { status: 400 }
        );
      }

      const song = await musicGenerator.generateSong(songConfig);
      return NextResponse.json({ success: true, data: song });
    } else {
      const musicConfig = config as MusicConfig;
      if (!musicConfig.genre || !musicConfig.mood) {
        return NextResponse.json(
          { error: 'genre와 mood가 필요합니다.' },
          { status: 400 }
        );
      }

      const music = await musicGenerator.generateMusic(musicConfig);
      return NextResponse.json({ success: true, data: music });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: '음악 생성 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

