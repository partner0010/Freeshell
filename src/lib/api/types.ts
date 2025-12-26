/**
 * API 응답 타입 정의
 * 타입 안정성 향상
 */

// 공통 API 응답 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 에러 응답
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

// 페이지네이션
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationParams;
}

// AI 채팅 응답
export interface AIChatResponse {
  message: string;
  type?: 'text' | 'code' | 'image';
  code?: string;
  language?: string;
  imageUrl?: string;
}

// 콘텐츠 생성 응답
export interface ContentGenerationResponse {
  type: string;
  content: any;
  url?: string;
  metadata?: Record<string, any>;
}

// 검증 응답
export interface ValidationResponse {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

