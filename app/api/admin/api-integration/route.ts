/**
 * API 연동 관리 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { validateInput } from '@/lib/security/input-validation';
import { rateLimitCheck } from '@/lib/security/rate-limit';

interface APIConfig {
  id: string;
  name: string;
  type: 'oauth' | 'api_key' | 'webhook' | 'custom';
  endpoint?: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  scopes?: string[];
  headers?: Record<string, string>;
  enabled: boolean;
  lastTested?: Date;
  status?: 'success' | 'error' | 'pending';
  errorMessage?: string;
}

// 실제로는 데이터베이스 사용
let apiConfigs: APIConfig[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      configs: apiConfigs,
    });
  } catch (error: any) {
    console.error('[API Integration API] 오류:', error);
    return NextResponse.json(
      { error: '설정을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await rateLimitCheck(request, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, type, endpoint, apiKey, clientId, clientSecret, redirectUri, scopes, headers } = body;

    const nameValidation = validateInput(name, { maxLength: 100, required: true });
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    const newConfig: APIConfig = {
      id: `api_${Date.now()}`,
      name: nameValidation.sanitized || name,
      type: type || 'api_key',
      endpoint,
      apiKey,
      clientId,
      clientSecret,
      redirectUri,
      scopes: scopes || [],
      headers: headers || {},
      enabled: true,
      status: 'pending',
    };

    apiConfigs.push(newConfig);

    return NextResponse.json({
      success: true,
      config: newConfig,
    });
  } catch (error: any) {
    console.error('[API Integration API] 오류:', error);
    return NextResponse.json(
      { error: '설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const configIndex = apiConfigs.findIndex(c => c.id === id);
    if (configIndex === -1) {
      return NextResponse.json(
        { error: '설정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    apiConfigs[configIndex] = { ...apiConfigs[configIndex], ...updates };

    return NextResponse.json({
      success: true,
      config: apiConfigs[configIndex],
    });
  } catch (error: any) {
    console.error('[API Integration API] 오류:', error);
    return NextResponse.json(
      { error: '설정 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
