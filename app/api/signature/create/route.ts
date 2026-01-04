/**
 * 전자서명 요청 생성 API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const signers = JSON.parse(formData.get('signers') as string);
    const message = formData.get('message') as string;

    if (!file || !title || !signers || signers.length === 0) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 파일 검증
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 실제로는 파일을 저장하고 서명 요청을 생성해야 함
    // 여기서는 시뮬레이션
    const documentId = `doc-${Date.now()}`;

    const result = {
      success: true,
      documentId,
      message: '서명 요청이 생성되었습니다.',
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('서명 요청 생성 오류:', error);
    return NextResponse.json(
      { error: '서명 요청 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

