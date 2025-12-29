import { NextRequest, NextResponse } from 'next/server';
import { validateInput, validateUrl } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 10, 60000); // 1분에 10회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { scenes, audio, config } = body;

    // 입력 검증
    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return NextResponse.json(
        { error: '장면이 필요합니다.' },
        { status: 400 }
      );
    }

    // 장면 배열 크기 제한
    if (scenes.length > 50) {
      return NextResponse.json(
        { error: '장면은 최대 50개까지 가능합니다.' },
        { status: 400 }
      );
    }

    // 각 장면의 URL 검증
    for (const scene of scenes) {
      if (scene.videoUrl && !validateUrl(scene.videoUrl)) {
        return NextResponse.json(
          { error: '올바른 비디오 URL이 아닙니다.' },
          { status: 400 }
        );
      }
      if (scene.imageUrl && !validateUrl(scene.imageUrl)) {
        return NextResponse.json(
          { error: '올바른 이미지 URL이 아닙니다.' },
          { status: 400 }
        );
      }
    }

    // 영상 합성
    // 실제로는 FFmpeg 등을 사용하여 영상 합성
    // 여기서는 첫 번째 장면의 영상 URL 반환

    // 폴백: 첫 번째 장면의 영상 URL 반환
    return NextResponse.json({
      videoUrl: scenes[0]?.videoUrl || '',
      thumbnail: scenes[0]?.imageUrl || '',
      totalDuration: config?.duration || 60,
      sceneCount: scenes.length,
      audioTrackCount: audio?.length || 0,
    });
  } catch (error) {
    console.error('영상 합성 오류:', error);
    return NextResponse.json(
      { error: '영상 합성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

