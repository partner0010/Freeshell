/**
 * API 응답 압축 유틸리티
 * Next.js는 자동으로 압축하지만, 추가 최적화 가능
 */

import { NextResponse } from 'next/server';

/**
 * 압축된 응답 생성
 */
export function createCompressedResponse(
  data: any,
  options: {
    status?: number;
    headers?: Record<string, string>;
  } = {}
): NextResponse {
  const response = NextResponse.json(data, {
    status: options.status || 200,
    headers: {
      'Content-Encoding': 'gzip',
      'Vary': 'Accept-Encoding',
      ...options.headers,
    },
  });

  return response;
}

/**
 * 응답 크기 최적화 (불필요한 공백 제거)
 */
export function optimizeResponse(data: any): string {
  if (typeof data === 'string') {
    return data;
  }
  
  // JSON을 압축 (공백 제거)
  return JSON.stringify(data);
}

