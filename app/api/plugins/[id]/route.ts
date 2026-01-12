/**
 * 플러그인 개별 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import pluginManager from '@/lib/plugins/manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const plugin = pluginManager.getPlugin(params.id);

    if (!plugin) {
      return NextResponse.json(
        { error: '플러그인을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      plugin: {
        id: plugin.manifest.id,
        name: plugin.manifest.name,
        version: plugin.manifest.version,
        description: plugin.manifest.description,
        author: plugin.manifest.author,
        icon: plugin.manifest.icon,
        enabled: plugin.enabled,
        permissions: plugin.manifest.permissions,
        hooks: plugin.manifest.hooks,
        settings: plugin.manifest.settings,
      },
    });
  } catch (error: any) {
    console.error('[플러그인 조회 API] 오류:', error);
    return NextResponse.json(
      { error: '플러그인 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'enable') {
      const success = await pluginManager.enable(params.id);
      return NextResponse.json({
        success,
        message: success ? '플러그인이 활성화되었습니다.' : '플러그인 활성화에 실패했습니다.',
      });
    } else if (action === 'disable') {
      const success = await pluginManager.disable(params.id);
      return NextResponse.json({
        success,
        message: success ? '플러그인이 비활성화되었습니다.' : '플러그인 비활성화에 실패했습니다.',
      });
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[플러그인 업데이트 API] 오류:', error);
    return NextResponse.json(
      { error: '플러그인 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const success = await pluginManager.unregister(params.id);

    return NextResponse.json({
      success,
      message: success ? '플러그인이 제거되었습니다.' : '플러그인 제거에 실패했습니다.',
    });
  } catch (error: any) {
    console.error('[플러그인 삭제 API] 오류:', error);
    return NextResponse.json(
      { error: '플러그인 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
