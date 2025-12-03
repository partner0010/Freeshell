/**
 * 📊 대시보드 - 완전히 새로운 디자인
 * 실시간 통계, 최근 활동, AI 사용량
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, Video, Image, Music, FileText, Zap,
  Users, DollarSign, Clock, Activity, Award, Target,
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown,
  Sparkles, Cpu, Globe, Rocket
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'video' | 'image' | 'audio' | 'ebook' | 'blog'
  title: string
  status: 'completed' | 'processing' | 'failed'
  createdAt: Date
  views?: number
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])

  const stats = [
    {
      icon: Video,
      label: '생성된 비디오',
      value: '1,234',
      change: '+23.5%',
      trend: 'up' as const,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Image,
      label: '생성된 이미지',
      value: '5,678',
      change: '+45.2%',
      trend: 'up' as const,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Music,
      label: '음성 & 음악',
      value: '892',
      change: '+12.8%',
      trend: 'up' as const,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: DollarSign,
      label: '수익',
      value: '₩2.3M',
      change: '+67.4%',
      trend: 'up' as const,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const aiUsage = [
    { model: 'GPT-4 Turbo', usage: 85, color: 'bg-green-500' },
    { model: 'Claude 3 Opus', usage: 72, color: 'bg-purple-500' },
    { model: 'Gemini 1.5 Pro', usage: 68, color: 'bg-blue-500' },
    { model: 'DALL-E 3', usage: 91, color: 'bg-pink-500' },
    { model: 'Runway Gen-2', usage: 45, color: 'bg-cyan-500' },
    { model: 'ElevenLabs', usage: 78, color: 'bg-orange-500' }
  ]

  const quickActions = [
    { icon: Video, label: '비디오 생성', path: '/create', color: 'purple' },
    { icon: Image, label: '이미지 생성', path: '/create', color: 'blue' },
    { icon: Music, label: '음성 생성', path: '/create', color: 'green' },
    { icon: FileText, label: '전자책 생성', path: '/ebook', color: 'orange' },
    { icon: Globe, label: '블로그 발행', path: '/blog', color: 'pink' },
    { icon: Zap, label: '자동 생성', path: '/auto', color: 'yellow' }
  ]

  useEffect(() => {
    // 최근 활동 로드
    setRecentActivities([
      {
        id: '1',
        type: 'video',
        title: 'AI 기술 트렌드 2024',
        status: 'completed',
        createdAt: new Date(),
        views: 1234
      },
      {
        id: '2',
        type: 'image',
        title: '우주 탐험 일러스트',
        status: 'completed',
        createdAt: new Date(),
        views: 567
      },
      {
        id: '3',
        type: 'audio',
        title: '평화로운 배경음악',
        status: 'processing',
        createdAt: new Date()
      }
    ])
  }, [])

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-[1800px] mx-auto px-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-black text-white mb-3">
              안녕하세요! 👋
            </h1>
            <p className="text-xl text-gray-400">
              오늘도 멋진 콘텐츠를 만들어볼까요?
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {['day', 'week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  timeRange === range
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {range === 'day' ? '오늘' : range === 'week' ? '이번 주' : range === 'month' ? '이번 달' : '올해'}
              </button>
            ))}
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} bg-opacity-20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:scale-105 transition-all`}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-10 h-10 text-white" />
                <div className={`flex items-center text-sm font-bold ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-base text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 빠른 작업 */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
              <h2 className="text-3xl font-black text-white mb-8 flex items-center">
                <Zap className="w-8 h-8 mr-3 text-yellow-400" />
                빠른 작업
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`group bg-gradient-to-br from-${action.color}-500/20 to-${action.color}-600/20 border border-white/10 rounded-2xl p-8 hover:scale-105 hover:shadow-2xl transition-all`}
                  >
                    <action.icon className={`w-12 h-12 text-${action.color}-400 mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                    <div className="text-white font-bold">{action.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mt-8">
              <h2 className="text-3xl font-black text-white mb-8 flex items-center">
                <Clock className="w-8 h-8 mr-3 text-blue-400" />
                최근 활동
              </h2>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${
                        activity.type === 'video' ? 'from-purple-500 to-pink-500' :
                        activity.type === 'image' ? 'from-blue-500 to-cyan-500' :
                        activity.type === 'audio' ? 'from-green-500 to-emerald-500' :
                        'from-orange-500 to-red-500'
                      } rounded-xl flex items-center justify-center`}>
                        {activity.type === 'video' && <Video className="w-6 h-6 text-white" />}
                        {activity.type === 'image' && <Image className="w-6 h-6 text-white" />}
                        {activity.type === 'audio' && <Music className="w-6 h-6 text-white" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{activity.title}</h3>
                        <p className="text-sm text-gray-400">
                          {activity.status === 'completed' && '완료'}
                          {activity.status === 'processing' && '처리 중...'}
                          {activity.status === 'failed' && '실패'}
                        </p>
                      </div>
                    </div>
                    {activity.views && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">{activity.views.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">조회수</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI 사용량 */}
          <div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10">
              <h2 className="text-3xl font-black text-white mb-8 flex items-center">
                <Cpu className="w-8 h-8 mr-3 text-purple-400" />
                AI 사용량
              </h2>

              <div className="space-y-6">
                {aiUsage.map((ai, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold">{ai.model}</span>
                      <span className="text-gray-400">{ai.usage}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${ai.color} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${ai.usage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">이번 달 사용량</span>
                  <span className="text-2xl font-black text-white">2,847 / 3,000</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            {/* 업적 */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 mt-8">
              <h2 className="text-3xl font-black text-white mb-8 flex items-center">
                <Award className="w-8 h-8 mr-3 text-yellow-400" />
                업적
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">첫 번째 비디오</h3>
                    <p className="text-sm text-gray-400">비디오 1개 생성</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">콘텐츠 마스터</h3>
                    <p className="text-sm text-gray-400">100개 콘텐츠 생성</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl opacity-50">
                  <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">바이럴 히트</h3>
                    <p className="text-sm text-gray-400">조회수 100만 달성</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
