/**
 * 🏠 홈페이지 - 완전히 새로운 디자인
 * 모던하고 인터랙티브한 랜딩 페이지
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Sparkles, Video, Image, Music, BookOpen, Globe,
  Zap, TrendingUp, Users, Award, ArrowRight, Play,
  Check, Star, MessageSquare, FileText, Cpu, Rocket
} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [activeFeature, setActiveFeature] = useState(0)
  const [stats, setStats] = useState({
    users: 0,
    contents: 0,
    aiModels: 0,
    features: 0
  })

  useEffect(() => {
    // 숫자 카운팅 애니메이션
    const targetStats = {
      users: 10000,
      contents: 50000,
      aiModels: 14,
      features: 100
    }

    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        users: Math.floor(targetStats.users * progress),
        contents: Math.floor(targetStats.contents * progress),
        aiModels: Math.floor(targetStats.aiModels * progress),
        features: Math.floor(targetStats.features * progress)
      })

      if (currentStep >= steps) {
        clearInterval(timer)
        setStats(targetStats)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const features = [
    {
      icon: Video,
      title: 'AI 비디오 생성',
      description: 'Runway, Pika Labs로 텍스트를 비디오로 변환',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Image,
      title: 'AI 이미지 생성',
      description: 'DALL-E 3, Midjourney 스타일로 고품질 이미지',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Music,
      title: 'AI 음성 & 음악',
      description: 'ElevenLabs 음성 합성, AIVA 음악 작곡',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: BookOpen,
      title: '전자책 자동 생성',
      description: 'PDF, EPUB 형식의 전자책을 AI로 자동 생성',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Globe,
      title: '100개 언어 지원',
      description: '전세계 언어로 번역 및 콘텐츠 생성',
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Zap,
      title: '실시간 협업',
      description: '팀원과 함께 실시간으로 콘텐츠 제작',
      gradient: 'from-yellow-500 to-orange-500'
    }
  ]

  const aiModels = [
    { name: 'GPT-4 Turbo', desc: '128K 컨텍스트', color: 'text-green-400' },
    { name: 'Claude 3 Opus', desc: '최고 성능', color: 'text-purple-400' },
    { name: 'Gemini 1.5 Pro', desc: '200만 토큰', color: 'text-blue-400' },
    { name: 'DALL-E 3', desc: 'HD 이미지', color: 'text-pink-400' },
    { name: 'Runway Gen-2', desc: '고품질 비디오', color: 'text-cyan-400' },
    { name: 'ElevenLabs', desc: '초현실적 음성', color: 'text-orange-400' }
  ]


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 text-center z-10">
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-purple-300 text-sm font-medium">14개 최신 AI 모델 통합</span>
          </div>

          <h1 className="text-7xl md:text-8xl font-black text-white mb-6 leading-tight">
            AI로 콘텐츠를
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              자동 생성하세요
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            GPT-4, Claude 3, Gemini로 비디오, 이미지, 음성, 전자책을<br />
            단 몇 초 만에 생성하고 100개 플랫폼에 자동 업로드
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => isAuthenticated ? navigate('/create') : navigate('/register')}
              className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105 flex items-center"
            >
              {isAuthenticated ? '지금 만들기' : '무료로 시작하기'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/demo')}
              className="px-10 py-5 bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white text-lg font-bold rounded-2xl border border-white/20 transition-all flex items-center"
            >
              <Play className="mr-2 w-5 h-5" />
              데모 보기
            </button>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">
                {stats.users.toLocaleString()}+
              </div>
              <div className="text-gray-400">사용자</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">
                {stats.contents.toLocaleString()}+
              </div>
              <div className="text-gray-400">생성된 콘텐츠</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">
                {stats.aiModels}+
              </div>
              <div className="text-gray-400">AI 모델</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-white mb-2">
                {stats.features}+
              </div>
              <div className="text-gray-400">기능</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 모델 섹션 */}
      <section className="py-32 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              세계 최고 AI 모델 통합
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              14개의 최신 AI 모델을 하나의 플랫폼에서 사용하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiModels.map((model, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all hover:scale-105 hover:shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <Cpu className={`w-10 h-10 ${model.color}`} />
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                    활성화
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{model.name}</h3>
                <p className="text-gray-400">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              모든 창작 도구가 한 곳에
            </h2>
            <p className="text-xl text-gray-400">
              100+ 기능으로 무엇이든 만드세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all hover:scale-105 cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 시작하기 섹션 (요금제 제거) */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            모든 기능을 무료로 사용해보세요
          </p>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-12">
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">빠른 시작</h3>
                <p className="text-gray-300">3분 안에 첫 콘텐츠 생성</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">14개 AI 모델</h3>
                <p className="text-gray-300">최고급 AI 기술 사용</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">무제한 생성</h3>
                <p className="text-gray-300">원하는 만큼 만드세요</p>
              </div>
            </div>

            <button
              onClick={() => isAuthenticated ? navigate('/create') : navigate('/register')}
              className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-2xl shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105 inline-flex items-center"
            >
              {isAuthenticated ? '지금 만들기' : '무료로 시작하기'}
              <ArrowRight className="ml-3 w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-32 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <Rocket className="w-20 h-20 text-white mx-auto mb-8 animate-bounce" />
          
          <h2 className="text-6xl md:text-7xl font-black text-white mb-8">
            지금 바로 시작하세요
          </h2>
          
          <p className="text-2xl text-gray-200 mb-12">
            3분 만에 첫 AI 콘텐츠를 만들 수 있습니다
          </p>

          <button
            onClick={() => navigate('/register')}
            className="px-12 py-6 bg-white text-purple-900 text-xl font-black rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-110 shadow-2xl"
          >
            무료로 시작하기 🚀
          </button>

          <p className="text-gray-300 mt-8">
            신용카드 필요 없음 · 즉시 시작 가능 · 언제든지 취소 가능
          </p>
        </div>
      </section>
    </div>
  )
}
