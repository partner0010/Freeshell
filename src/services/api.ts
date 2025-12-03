import axios from 'axios'
import { ContentForm, GeneratedContent, PlatformConfig } from '../types'
import { getCSRFToken, setCSRFToken, sanitizeErrorMessage } from '../utils/security'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30초 타임아웃
  withCredentials: true, // 쿠키 포함 (CSRF 보호)
})

// 요청 인터셉터: CSRF 토큰 및 인증 토큰 추가
api.interceptors.request.use(
  (config) => {
    // CSRF 토큰 추가
    const csrfToken = getCSRFToken() || setCSRFToken()
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }

    // 인증 토큰 추가 (localStorage에서 안전하게 조회)
    if (typeof window !== 'undefined') {
      try {
        const encoded = localStorage.getItem('token')
        if (encoded) {
          const token = atob(encoded) // Base64 디코딩
          config.headers['Authorization'] = `Bearer ${token}`
        }
      } catch (error) {
        // 프로덕션에서는 에러 로그 제거
        if (import.meta.env.DEV) {
          // 토큰 조회 실패는 조용히 처리 (로깅 시스템 사용 시 주석 해제)
          // logger.error('토큰 조회 실패', error)
        }
      }
    }

    // API 키는 서버에서만 사용 (프론트엔드에서는 제거)
    // config.headers['X-API-Key'] = import.meta.env.VITE_API_KEY || ''

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터: 에러 처리 및 보안
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 에러 메시지 Sanitization
    if (error.response) {
      error.response.data.error = sanitizeErrorMessage(error.response.data)
    }
    
    // 401 에러 시 로그아웃
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        sessionStorage.removeItem('csrf-token')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// AI 콘텐츠 생성
export const generateContent = async (formData: ContentForm): Promise<{ success: boolean; data: GeneratedContent[] }> => {
  const formDataToSend = new FormData()
  formDataToSend.append('topic', formData.topic)
  formDataToSend.append('contentType', formData.contentType)
  formDataToSend.append('contentTime', formData.contentTime.toString())
  formDataToSend.append('contentFormat', JSON.stringify(formData.contentFormat))
  formDataToSend.append('text', formData.text)
  
  if (formData.images) {
    formData.images.forEach((image) => {
      formDataToSend.append('images', image)
    })
  }
  
  if (formData.videos) {
    formData.videos.forEach((video) => {
      formDataToSend.append('videos', video)
    })
  }

  const response = await api.post<{ success: boolean; data: GeneratedContent[] }>('/content/generate', formDataToSend, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

// 콘텐츠 업로드
export const uploadContent = async (
  contentId: string,
  platformConfigs: PlatformConfig[]
): Promise<void> => {
  await api.post('/upload', {
    contentId,
    platforms: platformConfigs,
  })
}

// 플랫폼 인증 확인
export const verifyPlatformAuth = async (platform: string): Promise<boolean> => {
  const response = await api.get<{ success: boolean; verified: boolean }>(`/platform/${platform}/verify`)
  return response.data.verified
}

export default api

