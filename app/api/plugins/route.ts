/**
 * 플러그인 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import pluginManager from '@/lib/plugins/manager';
import { PluginManifest } from '@/lib/plugins/types';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const plugins = pluginManager.getPlugins().map(plugin => ({
      id: plugin.manifest.id,
      name: plugin.manifest.name,
      version: plugin.manifest.version,
      description: plugin.manifest.description,
      author: plugin.manifest.author,
      icon: plugin.manifest.icon,
      enabled: plugin.enabled,
      permissions: plugin.manifest.permissions,
    }));

    return NextResponse.json({
      success: true,
      plugins,
    });
  } catch (error: any) {
    console.error('[플러그인 목록 API] 오류:', error);
    return NextResponse.json(
      { error: '플러그인 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const manifest: PluginManifest = body.manifest;

    if (!manifest || !manifest.id || !manifest.name || !manifest.version) {
      return NextResponse.json(
        { error: '유효하지 않은 플러그인 매니페스트입니다.' },
        { status: 400 }
      );
    }

    const success = await pluginManager.register(manifest);

    if (success) {
      // 자동 활성화
      await pluginManager.enable(manifest.id);
    }

    return NextResponse.json({
      success,
      message: success ? '플러그인이 등록되었습니다.' : '플러그인 등록에 실패했습니다.',
    });
  } catch (error: any) {
    console.error('[플러그인 등록 API] 오류:', error);
    return NextResponse.json(
      { error: '플러그인 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
