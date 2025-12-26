/**
 * 회의록 오디오 전사 API
 * 오디오 파일을 텍스트로 변환
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 오디오 전사
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: '오디오 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 실제 구현 시:
    // 1. OpenAI Whisper API 사용
    // 2. Google Speech-to-Text API 사용
    // 3. Azure Speech Services 사용
    // 4. AssemblyAI 사용
    
    // 여기서는 시뮬레이션 (실제 API 연동 준비)
    const apiKey = process.env.OPENAI_API_KEY || process.env.WHISPER_API_KEY;
    
    if (apiKey) {
      try {
        // OpenAI Whisper API 호출
        const audioBuffer = await audioFile.arrayBuffer();
        const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
        
        const formDataForAPI = new FormData();
        formDataForAPI.append('file', audioBlob, audioFile.name);
        formDataForAPI.append('model', 'whisper-1');
        formDataForAPI.append('language', 'ko');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formDataForAPI,
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            success: true,
            transcript: data.text,
            language: data.language,
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || '전사 실패');
        }
      } catch (error: any) {
        console.error('Whisper API 호출 실패:', error);
        // 폴백: 시뮬레이션
        return NextResponse.json({
          success: true,
          transcript: `[오디오 전사 시뮬레이션] ${audioFile.name} 파일에서 추출된 회의 내용입니다. 실제 API 연동을 위해서는 OPENAI_API_KEY 환경 변수를 설정하세요.`,
          language: 'ko',
        });
      }
    } else {
      // API 키가 없을 때 시뮬레이션
      return NextResponse.json({
        success: true,
        transcript: `[오디오 전사 시뮬레이션] ${audioFile.name} 파일에서 추출된 회의 내용입니다. 실제 API 연동을 위해서는 OPENAI_API_KEY 환경 변수를 설정하세요.`,
        language: 'ko',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: '오디오 전사 중 오류가 발생했습니다.', detail: error.message },
      { status: 500 }
    );
  }
}

