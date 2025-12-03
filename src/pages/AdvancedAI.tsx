/**
 * 🚀 고급 AI 페이지 - 14개 AI 모델 사용
 */

import { useState } from 'react'
import { advancedAIService, AIModel } from '../services/advancedAI'
import {
  Cpu, Image, Video, Music, Sparkles, Zap,
  Send, Download, Copy, RefreshCw
} from 'lucide-react'

export default function AdvancedAI() {
  const [selectedModel, setSelectedModel] = useState<AIModel>('gpt-4-turbo')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'image' | 'video' | 'audio'>('chat')

  const models: { id: AIModel; name: string; desc: string; color: string }[] = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', desc: '128K 컨텍스트', color: 'from-green-500 to-emerald-500' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', desc: '최고 성능', color: 'from-purple-500 to-pink-500' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', desc: '균형잡힌', color: 'from-blue-500 to-cyan-500' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', desc: '초고속', color: 'from-indigo-500 to-purple-500' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', desc: '200만 토큰', color: 'from-yellow-500 to-orange-500' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: '빠른 응답', color: 'from-pink-500 to-red-500' }
  ]

  const handleChat = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setResponse('')

    try {
      const result = await advancedAIService.chat(
        [{ role: 'user', content: prompt }],
        selectedModel
      )

      setResponse(result.data.content)
    } catch (error: any) {
      setResponse(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return

    setLoading(true)

    try {
      const result = await advancedAIService.generateImage(prompt, 'dalle3')
      setResponse(`이미지 생성 완료: ${result.data[0].url}`)
    } catch (error: any) {
      setResponse(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return

    setLoading(true)

    try {
      const result = await advancedAIService.generateVideo(prompt, 'runway')
      setResponse(`비디오 생성 시작: ${result.data.id}`)
    } catch (error: any) {
      setResponse(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAudio = async () => {
    if (!prompt.trim()) return

    setLoading(true)

    try {
      const result = await advancedAIService.generateVoice(prompt)
      setResponse(`음성 생성 완료: ${result.data.url}`)
    } catch (error: any) {
      setResponse(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-purple-300 text-sm font-medium">14개 최신 AI 모델</span>
          </div>
          <h1 className="text-6xl font-black text-white mb-4">고급 AI 스튜디오</h1>
          <p className="text-xl text-gray-400">세계 최고의 AI 모델들로 무엇이든 만드세요</p>
        </div>

        {/* 탭 */}
        <div className="flex space-x-4 mb-8 justify-center">
          {[
            { id: 'chat' as const, icon: Cpu, label: 'AI 채팅' },
            { id: 'image' as const, icon: Image, label: '이미지 생성' },
            { id: 'video' as const, icon: Video, label: '비디오 생성' },
            { id: 'audio' as const, icon: Music, label: '음성 생성' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 모델 선택 */}
          {activeTab === 'chat' && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">AI 모델 선택</h2>
              <div className="space-y-3">
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      selectedModel === model.id
                        ? `bg-gradient-to-r ${model.color} text-white shadow-lg`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1">{model.name}</div>
                    <div className={`text-sm ${selectedModel === model.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {model.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메인 영역 */}
          <div className={`${activeTab === 'chat' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
              {/* 입력 영역 */}
              <div className="mb-8">
                <label className="block text-white font-bold mb-4 text-xl">
                  {activeTab === 'chat' && '💬 메시지 입력'}
                  {activeTab === 'image' && '🎨 이미지 프롬프트'}
                  {activeTab === 'video' && '🎬 비디오 프롬프트'}
                  {activeTab === 'audio' && '🗣️ 음성 텍스트'}
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-40 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder={
                    activeTab === 'chat' ? 'AI와 대화하기...' :
                    activeTab === 'image' ? '만들고 싶은 이미지를 설명하세요...' :
                    activeTab === 'video' ? '비디오 내용을 설명하세요...' :
                    '읽어줄 텍스트를 입력하세요...'
                  }
                />
              </div>

              {/* 실행 버튼 */}
              <button
                onClick={
                  activeTab === 'chat' ? handleChat :
                  activeTab === 'image' ? handleGenerateImage :
                  activeTab === 'video' ? handleGenerateVideo :
                  handleGenerateAudio
                }
                disabled={loading || !prompt.trim()}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-8"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-6 h-6 mr-3" />
                    {activeTab === 'chat' && '대화 시작'}
                    {activeTab === 'image' && '이미지 생성'}
                    {activeTab === 'video' && '비디오 생성'}
                    {activeTab === 'audio' && '음성 생성'}
                  </>
                )}
              </button>

              {/* 응답 영역 */}
              {response && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">결과</h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(response)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      복사
                    </button>
                  </div>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {response}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

