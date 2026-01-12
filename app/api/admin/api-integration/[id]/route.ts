/**
 * API 연동 개별 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';

let apiConfigs: any[] = [];

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const configId = params.id;
    apiConfigs = apiConfigs.filter(c => c.id !== configId);

    return NextResponse.json({
      success: true,
      message: '설정이 삭제되었습니다.',
    });
  } catch (error: any) {
    console.error('[API Integration API] 오류:', error);
    return NextResponse.json(
      { error: '설정 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
