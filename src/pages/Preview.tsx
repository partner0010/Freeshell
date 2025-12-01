import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContentStore } from '../store/contentStore'
import { GeneratedContent } from '../types'
import { Play, Upload, ArrowLeft, CheckCircle } from 'lucide-react'

// 간단한 로거 (개발용)
const logger = {
  error: (msg: string, error?: any) => console.error(msg, error)
}

export default function Preview() {
  const navigate = useNavigate()
  const { formData, generatedContents, setGeneratedContents, addContent } = useContentStore()
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    if (!formData) {
      navigate('/create')
      return
    }

    // AI 콘텐츠 생성
    const generateContents = async () => {
      setIsGenerating(true)
      
      try {
        // 실제 API 호출
        const { generateContent } = await import('../services/api')
        const generatedContents = await generateContent(formData)
        
        setGeneratedContents(generatedContents)
        // 첫 번째 버전을 히스토리에 추가
        if (generatedContents[0]) {
          addContent(generatedContents[0])
        }
        setIsGenerating(false)
      } catch (error) {
        logger.error('콘텐츠 생성 실패:', error)
        // API 실패 시 시뮬레이션 데이터 사용
        setTimeout(() => {
        const mockContents: GeneratedContent[] = Array.from({ length: 5 }, (_, i) => ({
          id: `content-${Date.now()}-${i + 1}`,
          version: i + 1,
          title: `${formData.topic} - 버전 ${i + 1}`,
          description: `이 버전은 ${formData.contentType} 유형에 최적화된 콘텐츠입니다.`,
          thumbnail: `https://via.placeholder.com/400x600?text=Version+${i + 1}`,
          reasoning: `버전 ${i + 1}은 ${formData.contentFormat.join(', ')} 형식을 활용하여 ${formData.contentType}의 특성을 잘 살렸습니다. ${formData.text.substring(0, 100)}...`,
          duration: formData.contentTime,
          createdAt: new Date().toISOString(),
          topic: formData.topic,
          contentType: formData.contentType,
          status: 'generated' as const,
        }))
        
        setGeneratedContents(mockContents)
        // 첫 번째 버전을 히스토리에 추가
        if (mockContents[0]) {
          addContent(mockContents[0])
        }
        setIsGenerating(false)
      }, 2000)
    }

    generateContents()
  }, [formData, navigate, setGeneratedContents])

  const handleUpload = async (contentId: string) => {
    try {
      const { uploadContent } = await import('../services/api')
      // 기본 플랫폼 설정 (나중에 사용자가 선택할 수 있도록 개선 가능)
      const platformConfigs = [
        { platform: 'youtube', enabled: true }
      ]
      await uploadContent(contentId, platformConfigs)
      alert('업로드가 시작되었습니다!')
    } catch (error: any) {
      logger.error('업로드 실패:', error)
      alert(error.response?.data?.error || error.message || '업로드 중 오류가 발생했습니다')
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        <p className="text-gray-400 text-lg">AI가 콘텐츠를 생성하고 있습니다...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </button>
          <h1 className="text-3xl font-bold text-white">생성된 콘텐츠 미리보기</h1>
          <p className="text-gray-400 mt-2">
            {generatedContents.length}개의 버전이 생성되었습니다. 원하는 버전을 선택하세요.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedContents.map((content) => (
          <div
            key={content.id}
            className={`card cursor-pointer transition-all ${
              selectedContent === content.id
                ? 'ring-2 ring-primary-500 border-primary-500'
                : 'hover:border-dark-600'
            }`}
            onClick={() => setSelectedContent(content.id)}
          >
            {/* 썸네일 */}
            <div className="relative aspect-[9/16] bg-dark-700 rounded-lg mb-4 overflow-hidden">
              <img
                src={content.thumbnail}
                alt={content.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white" />
              </div>
              <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
                버전 {content.version}
              </div>
            </div>

            {/* 정보 */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {content.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {content.description}
                </p>
              </div>

              {/* 제작 이유 */}
              <div className="bg-dark-700 rounded-lg p-3">
                <p className="text-xs text-gray-300 line-clamp-3">
                  {content.reasoning}
                </p>
              </div>

              {/* 메타 정보 */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{content.duration}초</span>
                {selectedContent === content.id && (
                  <CheckCircle className="w-5 h-5 text-primary-500" />
                )}
              </div>

              {/* 업로드 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpload(content.id)
                }}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>업로드</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 콘텐츠 상세 정보 */}
      {selectedContent && (
        <div className="card mt-6">
          <h2 className="text-xl font-bold text-white mb-4">선택된 콘텐츠 상세 정보</h2>
          {(() => {
            const content = generatedContents.find((c) => c.id === selectedContent)
            if (!content) return null
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {content.title}
                  </h3>
                  <p className="text-gray-300">{content.description}</p>
                </div>
                <div>
                  <h4 className="text-md font-semibold text-white mb-2">제작 이유</h4>
                  <p className="text-gray-300 leading-relaxed">{content.reasoning}</p>
                </div>
                <div className="flex space-x-4 pt-4 border-t border-dark-700">
                  <button className="btn-primary flex-1">모든 플랫폼에 업로드</button>
                  <button className="btn-secondary">다시 생성하기</button>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

