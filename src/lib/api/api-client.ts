/**
 * API 클라이언트 래퍼
 * 재시도, 타임아웃, 에러 처리 통합
 */

import { getCSRFToken } from '@/lib/utils/csrf-client';

export interface ApiClientOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  ok: boolean;
}

export class ApiClient {
  private baseURL: string;
  private defaultOptions: ApiClientOptions;

  constructor(baseURL: string = '', options: ApiClientOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      timeout: 30000, // 30초
      retries: 3,
      retryDelay: 1000, // 1초
      ...options,
    };
  }

  /**
   * 요청 실행 (재시도 로직 포함)
   */
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    retries: number = this.defaultOptions.retries || 3
  ): Promise<Response> {
    try {
      // 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.defaultOptions.timeout
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 성공 응답 또는 클라이언트 에러는 재시도 안 함
      if (response.ok || response.status < 500) {
        return response;
      }

      // 서버 에러인 경우 재시도
      if (retries > 0 && response.status >= 500) {
        await this.delay(this.defaultOptions.retryDelay || 1000);
        return this.executeRequest(url, options, retries - 1);
      }

      return response;
    } catch (error: any) {
      // 네트워크 에러인 경우 재시도
      if (retries > 0 && (error.name === 'AbortError' || error.name === 'TypeError')) {
        await this.delay(this.defaultOptions.retryDelay || 1000);
        return this.executeRequest(url, options, retries - 1);
      }
      throw error;
    }
  }

  /**
   * 지연 함수
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 헤더 준비
   */
  private prepareHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
      ...this.defaultOptions.headers,
    };

    // CSRF 토큰 추가
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * GET 요청
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.executeRequest(url, {
      method: 'GET',
      headers: this.prepareHeaders(options?.headers as Record<string, string>),
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }

  /**
   * POST 요청
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.executeRequest(url, {
      method: 'POST',
      headers: this.prepareHeaders(options?.headers as Record<string, string>),
      body: JSON.stringify(body),
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }

  /**
   * PUT 요청
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.executeRequest(url, {
      method: 'PUT',
      headers: this.prepareHeaders(options?.headers as Record<string, string>),
      body: JSON.stringify(body),
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }

  /**
   * DELETE 요청
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.executeRequest(url, {
      method: 'DELETE',
      headers: this.prepareHeaders(options?.headers as Record<string, string>),
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    return {
      data,
      status: response.status,
      headers: response.headers,
      ok: response.ok,
    };
  }
}

// 기본 인스턴스
export const apiClient = new ApiClient();

