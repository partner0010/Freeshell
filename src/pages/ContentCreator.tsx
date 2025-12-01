import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContentStore } from '../store/contentStore'
import { ContentType, ContentFormat } from '../types'
import { Sparkles, Clock, FileText, Image, Video } from 'lucide-react'
import { sanitizeInput, containsXSS, containsSQLInjection, limitInputLength } from '../utils/security'

const CONTENT_TYPES: { value: ContentType; label: string; category?: string }[] = [
  // 뉴스/트렌드
  { value: 'today-issue', label: '오늘의 이슈', category: '뉴스/트렌드' },
  { value: 'trending-news', label: '트렌딩 뉴스', category: '뉴스/트렌드' },
  { value: 'viral-trend', label: '바이럴 트렌드', category: '뉴스/트렌드' },
  // 엔터테인먼트
  { value: 'movie', label: '영화 이야기', category: '엔터테인먼트' },
  { value: 'drama', label: '드라마 이야기', category: '엔터테인먼트' },
  { value: 'entertainment', label: '연예/엔터', category: '엔터테인먼트' },
  { value: 'celebrity', label: '연예인/셀럽', category: '엔터테인먼트' },
  { value: 'music', label: '음악', category: '엔터테인먼트' },
  { value: 'dance', label: '댄스', category: '엔터테인먼트' },
  // 교육/정보
  { value: 'education', label: '교육', category: '교육/정보' },
  { value: 'tutorial', label: '튜토리얼', category: '교육/정보' },
  { value: 'how-to', label: 'How-to', category: '교육/정보' },
  { value: 'tips', label: '팁/꿀팁', category: '교육/정보' },
  { value: 'life-hacks', label: '생활 꿀팁', category: '교육/정보' },
  // 리뷰/평가
  { value: 'product-review', label: '제품 리뷰', category: '리뷰/평가' },
  { value: 'restaurant-review', label: '맛집 리뷰', category: '리뷰/평가' },
  { value: 'movie-review', label: '영화 리뷰', category: '리뷰/평가' },
  { value: 'game-review', label: '게임 리뷰', category: '리뷰/평가' },
  { value: 'comparison', label: '비교/대결', category: '리뷰/평가' },
  // 라이프스타일
  { value: 'daily-talk', label: '일상대화', category: '라이프스타일' },
  { value: 'lifestyle', label: '라이프스타일', category: '라이프스타일' },
  { value: 'fashion', label: '패션', category: '라이프스타일' },
  { value: 'beauty', label: '뷰티', category: '라이프스타일' },
  { value: 'cooking', label: '요리', category: '라이프스타일' },
  { value: 'recipe', label: '레시피', category: '라이프스타일' },
  { value: 'travel', label: '여행', category: '라이프스타일' },
  { value: 'fitness', label: '피트니스', category: '라이프스타일' },
  { value: 'health', label: '건강', category: '라이프스타일' },
  // 코미디/재미
  { value: 'funny', label: '재미(개그)', category: '코미디/재미' },
  { value: 'comedy', label: '코미디', category: '코미디/재미' },
  { value: 'prank', label: '장난/프랭크', category: '코미디/재미' },
  { value: 'challenge', label: '챌린지', category: '코미디/재미' },
  // 감정 표현
  { value: 'joy', label: '기쁨', category: '감정 표현' },
  { value: 'sadness', label: '슬픔', category: '감정 표현' },
  { value: 'anger', label: '분노', category: '감정 표현' },
  { value: 'fear', label: '두려움', category: '감정 표현' },
  { value: 'surprise', label: '놀람', category: '감정 표현' },
  { value: 'disgust', label: '혐오', category: '감정 표현' },
  { value: 'contempt', label: '경멸', category: '감정 표현' },
  // 게임/IT
  { value: 'gaming', label: '게임', category: '게임/IT' },
  { value: 'tech', label: '테크', category: '게임/IT' },
  { value: 'it-news', label: 'IT 뉴스', category: '게임/IT' },
  { value: 'app-review', label: '앱 리뷰', category: '게임/IT' },
  // 동물/펫
  { value: 'pets', label: '반려동물', category: '동물/펫' },
  { value: 'animals', label: '동물', category: '동물/펫' },
  // DIY/만들기
  { value: 'diy', label: 'DIY', category: 'DIY/만들기' },
  { value: 'craft', label: '공예', category: 'DIY/만들기' },
  { value: 'art', label: '예술', category: 'DIY/만들기' },
  // 자동차
  { value: 'car', label: '자동차', category: '자동차' },
  { value: 'automotive', label: '오토모티브', category: '자동차' },
  // 투자/금융
  { value: 'investment', label: '투자', category: '투자/금융' },
  { value: 'stock', label: '주식', category: '투자/금융' },
  { value: 'crypto', label: '암호화폐', category: '투자/금융' },
  { value: 'finance', label: '금융', category: '투자/금융' },
  // 부동산
  { value: 'real-estate', label: '부동산', category: '부동산' },
  // 동기부여/자기계발
  { value: 'motivation', label: '동기부여', category: '동기부여/자기계발' },
  { value: 'self-improvement', label: '자기계발', category: '동기부여/자기계발' },
  { value: 'success-story', label: '성공 스토리', category: '동기부여/자기계발' },
  // 역사/문화
  { value: 'history', label: '역사', category: '역사/문화' },
  { value: 'culture', label: '문화', category: '역사/문화' },
  // 과학/기술
  { value: 'science', label: '과학', category: '과학/기술' },
  { value: 'technology', label: '기술', category: '과학/기술' },
  // 기타
  { value: 'other-media', label: '기타 매체 콘텐츠', category: '기타' },
  { value: 'asmr', label: 'ASMR', category: '기타' },
  { value: 'reaction', label: '리액션', category: '기타' },
  { value: 'storytelling', label: '스토리텔링', category: '기타' },
]

const CONTENT_FORMATS: { value: ContentFormat; label: string; icon: any }[] = [
  { value: 'text', label: '글', icon: FileText },
  { value: 'real-image-static', label: '실물 이미지 (정지)', icon: Image },
  { value: 'real-image-animated', label: '실물 이미지 (움직임)', icon: Image },
  { value: 'creative-image-static', label: '창작 이미지 (정지)', icon: Image },
  { value: 'creative-image-animated', label: '창작 이미지 (움직임)', icon: Image },
  { value: 'animation-image-static', label: '애니메이션 이미지 (정지)', icon: Image },
  { value: 'animation-image-animated', label: '애니메이션 이미지 (움직임)', icon: Image },
  { value: 'real-video', label: '실물 동영상', icon: Video },
  { value: 'creative-video', label: '창작 동영상', icon: Video },
  { value: 'animation-video', label: '애니메이션 동영상', icon: Video },
]

export default function ContentCreator() {
  const navigate = useNavigate()
  const { setFormData, setGeneratedContents } = useContentStore()
  
  const [topic, setTopic] = useState('')
  const [contentType, setContentType] = useState<ContentType>('today-issue')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [contentTime, setContentTime] = useState(60)
  const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>(['text'])
  const [text, setText] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [videos, setVideos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleFormatToggle = (format: ContentFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    )
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files))
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos(Array.from(e.target.files))
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return secs > 0 ? `${minutes}분 ${secs}초` : `${minutes}분`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 입력 검증
    if (!topic || topic.trim().length === 0) {
      alert('주제를 입력해주세요')
      return
    }

    // XSS 및 SQL Injection 검증
    if (containsXSS(topic) || containsSQLInjection(topic)) {
      alert('유효하지 않은 문자가 포함되어 있습니다')
      return
    }

    if (text && (containsXSS(text) || containsSQLInjection(text))) {
      alert('콘텐츠에 유효하지 않은 문자가 포함되어 있습니다')
      return
    }

    // 입력 길이 제한
    const sanitizedTopic = limitInputLength(sanitizeInput(topic), 200)
    const sanitizedText = text ? limitInputLength(sanitizeInput(text), 10000) : ''
    
    const formData = {
      topic: sanitizedTopic,
      contentType,
      contentTime,
      contentFormat: selectedFormats,
      text: sanitizedText,
      images,
      videos,
    }

    setFormData(formData)
    
    // AI 콘텐츠 생성 API 호출
    try {
      setLoading(true)
      const { generateContent } = await import('../services/api')
      const contents = await generateContent(formData)
      setGeneratedContents(contents.data || contents)
      navigate('/preview')
    } catch (error: any) {
      console.error('콘텐츠 생성 실패:', error)
      alert(error.response?.data?.error || error.message || '콘텐츠 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">콘텐츠 생성</h1>
        <p className="text-gray-400">AI가 여러분의 아이디어를 숏폼 콘텐츠로 변환합니다</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 주제 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            주제
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => {
              const value = limitInputLength(e.target.value, 200)
              setTopic(value)
            }}
            placeholder="예: 오늘 가장 핫한 이슈는..."
            className="input-field"
            required
            maxLength={200}
          />
        </div>

        {/* 콘텐츠 유형 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            콘텐츠 유형
          </label>
          <div className="space-y-6">
            {Object.entries(
              CONTENT_TYPES.reduce((acc, type) => {
                const category = type.category || '기타'
                if (!acc[category]) acc[category] = []
                acc[category].push(type)
                return acc
              }, {} as Record<string, typeof CONTENT_TYPES>)
            ).map(([category, types]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {types.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setContentType(type.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors text-sm ${
                        contentType === type.value
                          ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                          : 'border-dark-600 bg-dark-700 text-gray-300 hover:border-dark-500'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 콘텐츠 시간 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>콘텐츠 시간: {contentTime}초</span>
            </div>
          </label>
          <input
            type="range"
            min="15"
            max="3600"
            step="15"
            value={contentTime}
            onChange={(e) => setContentTime(Number(e.target.value))}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>15초</span>
            <span>10분 (600초)</span>
            <span>1시간 (3600초)</span>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            현재: {formatTime(contentTime)} {contentTime >= 600 && '(광고 수익 최적화)'}
          </div>
        </div>

        {/* 콘텐츠 형식 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            콘텐츠 형식 (복수 선택 가능)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONTENT_FORMATS.map((format) => {
              const Icon = format.icon
              const isSelected = selectedFormats.includes(format.value)
              return (
                <button
                  key={format.value}
                  type="button"
                  onClick={() => handleFormatToggle(format.value)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-500/20 text-primary-400'
                      : 'border-dark-600 bg-dark-700 text-gray-300 hover:border-dark-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{format.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 콘텐츠 작성 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            콘텐츠 작성
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              const value = limitInputLength(e.target.value, 10000)
              setText(value)
            }}
            placeholder="콘텐츠의 내용을 작성해주세요..."
            rows={8}
            className="input-field resize-none"
            maxLength={10000}
            required
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            이미지 업로드 (선택)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="input-field"
          />
          {images.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {images.length}개의 이미지가 선택되었습니다
            </p>
          )}
        </div>

        {/* 동영상 업로드 */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            동영상 업로드 (선택)
          </label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideoChange}
            className="input-field"
          />
          {videos.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">
              {videos.length}개의 동영상이 선택되었습니다
            </p>
          )}
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>AI로 콘텐츠 생성하기</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

