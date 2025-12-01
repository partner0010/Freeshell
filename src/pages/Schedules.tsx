import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Calendar, Clock, Play, Pause, Trash2, Plus, Zap } from 'lucide-react'
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
    if (token) {
      loadSchedules()
    }
  }, [token])

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setSchedules(response.data.schedules)
      }
    } catch (error) {
      console.error('스케줄 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSchedule = async (id: string, isActive: boolean) => {
    try {
      await axios.put(`/api/schedules/${id}`, { isActive: !isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadSchedules()
    } catch (error) {
      console.error('스케줄 상태 변경 실패:', error)
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await axios.delete(`/api/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      loadSchedules()
    } catch (error) {
      console.error('스케줄 삭제 실패:', error)
    }
  }

  const createSmartSchedule = async () => {
    try {
      const response = await axios.post('/api/schedules/smart', {
        contentType: '일상대화',
        frequency: 'daily',
        platforms: ['youtube']
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        alert('AI 기반 최적 스케줄이 생성되었습니다!')
        loadSchedules()
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('스마트 스케줄 생성 실패:', error)
    }
  }

  if (loading) {
    return <div className="text-white text-center">로딩 중...</div>
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center">
          <Calendar className="w-8 h-8 mr-3" />
          스케줄 관리
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={createSmartSchedule}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center"
          >
            <Zap className="w-5 h-5 mr-2" />
            AI 스마트 스케줄 생성
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 스케줄
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-dark-800 rounded-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-4">등록된 스케줄이 없습니다</p>
          <button
            onClick={createSmartSchedule}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            AI 스마트 스케줄 생성하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{schedule.name}</h3>
                  <p className="text-gray-400 text-sm">{schedule.contentType}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  schedule.isActive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {schedule.isActive ? '활성' : '비활성'}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {schedule.frequency === 'daily' ? '매일' : 
                   schedule.frequency === 'weekly' ? '매주' : '매월'}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  다음 실행: {new Date(schedule.nextRunAt).toLocaleString('ko-KR')}
                </div>
                {schedule.lastRunAt && (
                  <div className="flex items-center text-gray-400 text-sm">
                    마지막 실행: {new Date(schedule.lastRunAt).toLocaleString('ko-KR')}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {schedule.platforms.map(platform => (
                    <span key={platform} className="px-2 py-1 bg-dark-700 text-gray-300 text-xs rounded">
                      {platform}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleSchedule(schedule.id, schedule.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      schedule.isActive
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {schedule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => deleteSchedule(schedule.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

