import { create } from 'zustand'
import { ContentForm, GeneratedContent, PlatformConfig } from '../types'

interface ContentStore {
  formData: ContentForm | null
  generatedContents: GeneratedContent[]
  allContents: GeneratedContent[] // 모든 생성된 콘텐츠 (히스토리)
  platformConfigs: PlatformConfig[]
  setFormData: (data: ContentForm) => void
  setGeneratedContents: (contents: GeneratedContent[]) => void
  addContent: (content: GeneratedContent) => void
  addPlatformConfig: (config: PlatformConfig) => void
  clearFormData: () => void
}

export const useContentStore = create<ContentStore>((set) => ({
  formData: null,
  generatedContents: [],
  allContents: [], // 로컬 스토리지에서 불러올 수도 있음
  platformConfigs: [],
  setFormData: (data) => set({ formData: data }),
  setGeneratedContents: (contents) => set({ generatedContents: contents }),
  addContent: (content) => set((state) => ({
    allContents: [content, ...state.allContents]
  })),
  addPlatformConfig: (config) => set((state) => ({
    platformConfigs: [...state.platformConfigs, config]
  })),
  clearFormData: () => set({ formData: null }),
}))

