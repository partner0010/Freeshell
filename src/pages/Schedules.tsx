import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Calendar, Clock, Play, Pause, Trash2, Plus, Sparkles } from 'lucide-react'
import axios from 'axios'

interface Schedule {
  id: string
  name: string
  description?: string
  contentType: string
  frequency: string
  nextRunAt: string
  lastRunAt?: string
  isActive: boolean
  platforms: string[]
  executions: Array<{
    id: string
    status: string
    startedAt: string
    completedAt?: string
  }>
}

export default function Schedules() {
  const { token } = useAuthStore()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    try {
      if (token) {
        const response = await axios.get('/api/schedules', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.success) {
          setSchedules(response.data.schedules)
        }
      } else {
        // 샘플 데이터
        setSchedules([
          {
            id: '1',
            name: '매일 오전 9시 숏폼 생성',
            description: 'AI 트렌드 뉴스 자동 생성',
            contentType: '오늘의 이슈',
            frequency: '매일',
            nextRunAt: new Date(Date.now() + 86400000).toISOString(),
            isActive: true,
            platforms: ['youtube', 'tiktok'],
            executions: []
          },
          {
            id: '2',
            name: '주간 블로그 포스트',
            description: '매주 월요일 블로그 자동 발행',
            contentType: '기술 리뷰',
            frequency: '매주 월요일',
            nextRunAt: new Date(Date.now() + 604800000).toISOString(),
            isActive: true,
            platforms: ['blog'],
            executions: []
          }
        ])
      }
    } catch (error) {
      console.error('스케줄 로드 실패:', error)
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSchedule = async (scheduleId: string) => {
    try {
      await axios.patch(`/api/schedules/${scheduleId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadSchedules()
    } catch (error) {
      console.error('스케줄 토글 실패:', error)
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    try {
      await axios.delete(`/api/schedules/${scheduleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadSchedules()
    } catch (error) {
      console.error('스케줄 삭제 실패:', error)
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 헤더 */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
            <Calendar className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold text-white">예약 시스템</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white">
            자동 예약 배포
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            원하는 시간에 자동으로 콘텐츠를 생성하고 배포하세요
          </p>
        </div>

        {/* 스케줄 목록 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-300">로딩 중...</p>
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-4">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-2">{schedule.name}</h3>
                    <p className="text-base text-gray-300 mb-3">{schedule.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.frequency}</span>
                      </span>
                      <span>다음 실행: {new Date(schedule.nextRunAt).toLocaleString('ko-KR')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleSchedule(schedule.id)}
                      className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
                        schedule.isActive
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                    >
                      {schedule.isActive ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-6">예약된 작업이 없습니다</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all"
              >
                <Plus className="w-6 h-6" />
                <span>첫 예약 만들기</span>
              </button>
            </div>
          )}
        </div>

        {/* 새 예약 버튼 */}
        {schedules.length > 0 && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="fixed bottom-8 right-8 flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:scale-105 transition-all"
          >
            <Plus className="w-6 h-6" />
            <span>새 예약</span>
          </button>
        )}
      </div>
    </div>
  )
}
