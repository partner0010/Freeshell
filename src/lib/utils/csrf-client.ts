/**
 * 클라이언트 사이드 CSRF 토큰 관리
 */

/**
 * CSRF 토큰 가져오기 (쿠키에서)
 */
export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}

/**
 * API 요청에 CSRF 토큰 추가
 */
export function addCSRFTokenToRequest(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken();
  if (token) {
    return {
      ...headers,
      'X-CSRF-Token': token,
    };
  }
  return headers;
}

/**
 * fetch 래퍼 (CSRF 토큰 자동 추가)
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = addCSRFTokenToRequest(options.headers as HeadersInit);
  
  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

