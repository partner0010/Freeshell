import axios from 'axios'
import { ContentForm, GeneratedContent, PlatformConfig } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': import.meta.env.VITE_API_KEY || '', // API 키 추가
  },
})

// AI 콘텐츠 생성
export const generateContent = async (formData: ContentForm): Promise<GeneratedContent[]> => {
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

