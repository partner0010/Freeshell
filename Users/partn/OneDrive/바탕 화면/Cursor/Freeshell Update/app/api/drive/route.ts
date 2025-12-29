import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

// AI 드라이브 API
export async function GET(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 100, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    // 입력 검증
    if (folderId) {
      const validation = validateInput(folderId, { maxLength: 100, allowHtml: false });
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid folder ID' },
          { status: 400 }
        );
      }
    }

    // 실제 구현 시 데이터베이스에서 파일 목록 조회
    const files = [
      {
        id: '1',
        name: '파리 여행 계획서',
        type: 'file',
        fileType: 'document',
        size: '2.4 MB',
        modifiedAt: '2024-01-15',
        url: '#',
      },
      {
        id: '2',
        name: '제품 소개 비디오',
        type: 'file',
        fileType: 'video',
        size: '15.8 MB',
        modifiedAt: '2024-01-14',
        url: '#',
      },
    ];

    return NextResponse.json({ files, folderId });
  } catch (error) {
    console.error('Drive GET error:', error);
    return NextResponse.json(
      { error: '파일 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 20, 60000); // 파일 업로드는 제한적
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '파일 크기는 10MB를 초과할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    const allowedTypes = ['image/', 'video/', 'audio/', 'application/pdf', 'text/'];
    const isValidType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isValidType) {
      return NextResponse.json(
        { error: '허용되지 않은 파일 타입입니다.' },
        { status: 400 }
      );
    }

    // 파일명 검증
    const fileNameValidation = validateInput(file.name, {
      maxLength: 255,
      allowHtml: false,
    });
    if (!fileNameValidation.valid) {
      return NextResponse.json(
        { error: '올바르지 않은 파일명입니다.' },
        { status: 400 }
      );
    }

    // 실제 구현 시 파일 저장 로직
    // 예: AWS S3, Cloudinary 등에 업로드

    const response = {
      id: Date.now().toString(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
      url: `https://example.com/files/${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Drive POST error:', error);
    return NextResponse.json(
      { error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate Limiting
    const rateLimit = await rateLimitCheck(request, 50, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: Object.fromEntries(rateLimit.headers.entries()) }
      );
    }

    const body = await request.json();
    const { fileId } = body;

    // 입력 검증
    const validation = validateInput(fileId, {
      maxLength: 100,
      required: true,
      allowHtml: false,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid file ID' },
        { status: 400 }
      );
    }

    // 실제 구현 시 파일 삭제 로직

    return NextResponse.json({ success: true, fileId });
  } catch (error) {
    console.error('Drive DELETE error:', error);
    return NextResponse.json(
      { error: '파일 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

