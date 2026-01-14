/**
 * 영상 다운로드 API (프록시)
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.SHORTFORM_BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    
    // 백엔드 API 호출
    const response = await fetch(`${BACKEND_URL}/api/v1/job/${jobId}/download`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: response.status }
      );
    }
    
    // 비디오 파일 스트리밍
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="shortform-${jobId}.mp4"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
