/**
 * 구체적인 에러 메시지 및 복구 제안
 */

export interface ErrorDetails {
  message: string
  code: string
  suggestions: string[]
  recoverable: boolean
}

export class ErrorMessageProvider {
  /**
   * AI API 에러 메시지
   */
  static getAIError(service: string, error: any): ErrorDetails {
    const errorMessage = error?.message || '알 수 없는 오류'
    
    // 타임아웃 에러
    if (errorMessage.includes('타임아웃') || errorMessage.includes('timeout')) {
      return {
        message: `${service} API 응답 시간이 초과되었습니다`,
        code: 'AI_TIMEOUT',
        suggestions: [
          '잠시 후 다시 시도해주세요',
          '더 짧은 메시지로 질문해보세요',
          '다른 AI 서비스를 사용해보세요'
        ],
        recoverable: true
      }
    }

    // API 키 에러
    if (errorMessage.includes('API 키') || errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return {
        message: `${service} API 키가 유효하지 않습니다`,
        code: 'AI_API_KEY_INVALID',
        suggestions: [
          '환경 변수에서 API 키를 확인하세요',
          'API 키가 만료되었는지 확인하세요',
          'API 키 권한을 확인하세요'
        ],
        recoverable: false
      }
    }

    // 할당량 초과
    if (errorMessage.includes('할당량') || errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        message: `${service} API 사용량 한도를 초과했습니다`,
        code: 'AI_QUOTA_EXCEEDED',
        suggestions: [
          '잠시 후 다시 시도해주세요 (보통 몇 분 후 해제)',
          '다른 AI 서비스를 사용해보세요',
          'API 플랜을 업그레이드하세요'
        ],
        recoverable: true
      }
    }

    // 네트워크 에러
    if (errorMessage.includes('네트워크') || errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
      return {
        message: `${service} API에 연결할 수 없습니다`,
        code: 'AI_NETWORK_ERROR',
        suggestions: [
          '인터넷 연결을 확인하세요',
          '방화벽 설정을 확인하세요',
          '잠시 후 다시 시도해주세요'
        ],
        recoverable: true
      }
    }

    // 일반 에러
    return {
      message: `${service} API 오류: ${errorMessage}`,
      code: 'AI_ERROR',
      suggestions: [
        '잠시 후 다시 시도해주세요',
        '다른 AI 서비스를 사용해보세요',
        '문제가 계속되면 관리자에게 문의하세요'
      ],
      recoverable: true
    }
  }

  /**
   * 데이터베이스 에러 메시지
   */
  static getDatabaseError(error: any): ErrorDetails {
    const errorMessage = error?.message || '알 수 없는 오류'

    if (errorMessage.includes('unique constraint') || errorMessage.includes('UNIQUE')) {
      return {
        message: '이미 존재하는 데이터입니다',
        code: 'DB_UNIQUE_VIOLATION',
        suggestions: [
          '다른 값으로 시도해보세요',
          '기존 데이터를 수정하세요'
        ],
        recoverable: true
      }
    }

    if (errorMessage.includes('foreign key') || errorMessage.includes('FOREIGN KEY')) {
      return {
        message: '관련된 데이터가 없습니다',
        code: 'DB_FOREIGN_KEY_VIOLATION',
        suggestions: [
          '필요한 데이터를 먼저 생성하세요',
          '데이터 관계를 확인하세요'
        ],
        recoverable: true
      }
    }

    if (errorMessage.includes('connection') || errorMessage.includes('ECONNREFUSED')) {
      return {
        message: '데이터베이스에 연결할 수 없습니다',
        code: 'DB_CONNECTION_ERROR',
        suggestions: [
          '데이터베이스 서버가 실행 중인지 확인하세요',
          '연결 설정을 확인하세요',
          '잠시 후 다시 시도해주세요'
        ],
        recoverable: true
      }
    }

    return {
      message: `데이터베이스 오류: ${errorMessage}`,
      code: 'DB_ERROR',
      suggestions: [
        '잠시 후 다시 시도해주세요',
        '문제가 계속되면 관리자에게 문의하세요'
      ],
      recoverable: true
    }
  }

  /**
   * 인증 에러 메시지
   */
  static getAuthError(error: any): ErrorDetails {
    const errorMessage = error?.message || '알 수 없는 오류'

    if (errorMessage.includes('token') || errorMessage.includes('인증')) {
      return {
        message: '인증이 필요합니다',
        code: 'AUTH_REQUIRED',
        suggestions: [
          '로그인해주세요',
          '토큰이 만료되었으면 다시 로그인하세요'
        ],
        recoverable: true
      }
    }

    if (errorMessage.includes('권한') || errorMessage.includes('permission')) {
      return {
        message: '이 작업을 수행할 권한이 없습니다',
        code: 'AUTH_PERMISSION_DENIED',
        suggestions: [
          '관리자에게 권한을 요청하세요',
          '다른 계정으로 로그인하세요'
        ],
        recoverable: false
      }
    }

    return {
      message: `인증 오류: ${errorMessage}`,
      code: 'AUTH_ERROR',
      suggestions: [
        '다시 로그인해보세요',
        '문제가 계속되면 관리자에게 문의하세요'
      ],
      recoverable: true
    }
  }

  /**
   * 입력 검증 에러 메시지
   */
  static getValidationError(error: any): ErrorDetails {
    return {
      message: '입력값이 올바르지 않습니다',
      code: 'VALIDATION_ERROR',
      suggestions: [
        '입력 형식을 확인하세요',
        '필수 항목을 모두 입력했는지 확인하세요',
        '입력 길이 제한을 확인하세요'
      ],
      recoverable: true
    }
  }

  /**
   * 일반 에러 메시지
   */
  static getGenericError(error: any, context?: string): ErrorDetails {
    const errorMessage = error?.message || '알 수 없는 오류'
    
    return {
      message: context ? `${context}: ${errorMessage}` : errorMessage,
      code: 'GENERIC_ERROR',
      suggestions: [
        '잠시 후 다시 시도해주세요',
        '입력값을 확인하세요',
        '문제가 계속되면 관리자에게 문의하세요'
      ],
      recoverable: true
    }
  }
}

