import { useState, useEffect } from 'react'
import { 
  Shield, Users, FileText, DollarSign, Settings, 
  TrendingUp, Activity, AlertCircle, CheckCircle,
  Ban, Crown, UserCog, Search, Zap, Clock, Play, Pause
} from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

interface User {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

interface Stats {
  totalUsers: number
  activeUsers: number
  totalContents: number
  totalRevenue: number
}

interface InspectionReport {
  timestamp: string
  overallScore: number
  issues: Array<{
    category: string
    severity: string
    issue: string
    recommendation: string
    autoFixable: boolean
  }>
  optimizations: string[]
}

interface Schedule {
  id: string
  time: string
  enabled: boolean
  autoFix: boolean
  optimize: boolean
}

export default function Admin() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState('pending')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalContents: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)
  const [inspectionRunning, setInspectionRunning] = useState(false)
  const [inspectionReport, setInspectionReport] = useState<InspectionReport | null>(null)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [newScheduleTime, setNewScheduleTime] = useState('02:00')
  const [newScheduleAutoFix, setNewScheduleAutoFix] = useState(true)
  const [newScheduleOptimize, setNewScheduleOptimize] = useState(true)

  useEffect(() => {
    loadData()
    if (activeTab === 'inspection') {
      loadSchedules()
      loadLatestReport()
    }
  }, [activeTab])

  const loadData = async () => {
    try {
      setLoading(true)
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalUsers: 156,
        activeUsers: 142,
        totalContents: 1234,
        totalRevenue: 45678
      })

      setUsers([
        {
          id: '1',
          username: 'admin',
          email: 'admin@freeshell.co.kr',
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          username: 'user1',
          email: 'user1@example.com',
          role: 'user',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('데이터 로드 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    // API 호출
    console.log(`사용자 ${userId}의 역할을 ${newRole}로 변경`)
    await loadData()
  }

  const handleToggleActive = async (userId: string) => {
    // API 호출
    console.log(`사용자 ${userId} 활성화 상태 변경`)
    await loadData()
  }

  const runInspection = async () => {
    try {
      setInspectionRunning(true)
      const response = await axios.post('/api/auto-inspection/run', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setInspectionReport(response.data.data)
      }
    } catch (error) {
      console.error('점검 실행 실패:', error)
    } finally {
      setInspectionRunning(false)
    }
  }

  const runAutoFix = async () => {
    if (!inspectionReport) return
    try {
      const response = await axios.post('/api/auto-inspection/fix', {
        issues: inspectionReport.issues.filter((i) => i.autoFixable),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        alert('자동 조치 완료!')
        await runInspection() // 다시 점검
      }
    } catch (error) {
      console.error('자동 조치 실패:', error)
    }
  }

  const runOptimize = async () => {
    try {
      const response = await axios.post('/api/auto-inspection/optimize', {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        alert('최적화 완료!')
      }
    } catch (error) {
      console.error('최적화 실패:', error)
    }
  }

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/auto-inspection/schedule', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setSchedules(response.data.data)
      }
    } catch (error) {
      console.error('스케줄 로드 실패:', error)
    }
  }

  const loadLatestReport = async () => {
    try {
      const response = await axios.get('/api/auto-inspection/reports', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success && response.data.data.length > 0) {
        const latest = JSON.parse(response.data.data[0].report)
        setInspectionReport(latest)
      }
    } catch (error) {
      console.error('보고서 로드 실패:', error)
    }
  }

  const createSchedule = async () => {
    try {
      const response = await axios.post('/api/auto-inspection/schedule', {
        time: newScheduleTime,
        autoFix: newScheduleAutoFix,
        optimize: newScheduleOptimize,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        await loadSchedules()
        setNewScheduleTime('02:00')
      }
    } catch (error) {
      console.error('스케줄 생성 실패:', error)
    }
  }

  const toggleSchedule = async (id: string, enabled: boolean) => {
    try {
      await axios.put(`/api/auto-inspection/schedule/${id}`, {
        enabled: !enabled,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await loadSchedules()
    } catch (error) {
      console.error('스케줄 업데이트 실패:', error)
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm('스케줄을 삭제하시겠습니까?')) return
    try {
      await axios.delete(`/api/auto-inspection/schedule/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      await loadSchedules()
    } catch (error) {
      console.error('스케줄 삭제 실패:', error)
    }
  }

  const tabs = [
    { id: 'pending', name: '승인 대기', icon: AlertCircle },
    { id: 'users', name: '사용자 관리', icon: Users },
    { id: 'contents', name: '콘텐츠 관리', icon: FileText },
    { id: 'revenue', name: '수익 관리', icon: DollarSign },
    { id: 'inspection', name: '자동 점검', icon: Search },
    { id: 'settings', name: '시스템 설정', icon: Settings }
  ]

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-[1800px] mx-auto px-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black text-white">관리자 페이지</h1>
            </div>
            <p className="text-lg text-gray-300">모든 시스템을 통제하고 관리하세요</p>
          </div>
          <div className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-2xl">
            <Crown className="w-5 h-5 text-red-400" />
            <span className="font-bold text-red-400">관리자 권한</span>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{stats.totalUsers}</div>
            <div className="text-base text-gray-300 font-medium">전체 사용자</div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-green-400" />
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{stats.activeUsers}</div>
            <div className="text-base text-gray-300 font-medium">활성 사용자</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-4xl font-black text-white mb-2">{stats.totalContents}</div>
            <div className="text-base text-gray-300 font-medium">전체 콘텐츠</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-orange-400" />
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-4xl font-black text-white mb-2">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-base text-gray-300 font-medium">총 수익</div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex space-x-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold text-base transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>

        {/* 콘텐츠 */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl text-gray-300">로딩 중...</p>
            </div>
          ) : activeTab === 'pending' ? (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">승인 대기 중인 사용자</h2>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6">
                <p className="text-base text-yellow-400 font-semibold">
                  ⚠️ 회원가입한 사용자는 관리자 승인 후 서비스를 이용할 수 있습니다
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">승인 대기 중...</h3>
                      <p className="text-sm text-gray-400">회원가입하면 여기에 표시됩니다</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="px-6 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold transition-colors">
                      승인
                    </button>
                    <button className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-colors">
                      거부
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'users' ? (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">사용자 목록</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        user.role === 'admin' ? 'bg-red-500/20' : 'bg-blue-500/20'
                      }`}>
                        <Users className={`w-6 h-6 ${
                          user.role === 'admin' ? 'text-red-400' : 'text-blue-400'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-bold text-white">{user.username}</h3>
                          {user.role === 'admin' && (
                            <Crown className="w-5 h-5 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option value="user" className="bg-gray-900">일반 사용자</option>
                        <option value="moderator" className="bg-gray-900">운영자</option>
                        <option value="admin" className="bg-gray-900">관리자</option>
                      </select>
                      
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {user.isActive ? '활성화' : '비활성화'}
                      </button>
                      
                      <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors">
                        <Ban className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'inspection' ? (
            <div>
              <h2 className="text-2xl font-black text-white mb-6">AI 자동 점검 시스템</h2>
              
              {/* 즉시 실행 버튼 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={runInspection}
                  disabled={inspectionRunning}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-white hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                  <span>{inspectionRunning ? '점검 중...' : '즉시 점검 실행'}</span>
                </button>
                
                <button
                  onClick={runAutoFix}
                  disabled={!inspectionReport || inspectionReport.issues.filter((i) => i.autoFixable).length === 0}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-white hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Zap className="w-5 h-5" />
                  <span>자동 조치 실행</span>
                </button>
                
                <button
                  onClick={runOptimize}
                  className="flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl font-bold text-white hover:scale-105 transition-all"
                >
                  <Activity className="w-5 h-5" />
                  <span>플랫폼 최적화</span>
                </button>
              </div>

              {/* 점검 결과 */}
              {inspectionReport && (
                <div className="bg-white/5 rounded-3xl p-8 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">점검 결과</h3>
                    <div className={`px-4 py-2 rounded-xl font-bold ${
                      inspectionReport.overallScore >= 90 ? 'bg-green-500/20 text-green-400' :
                      inspectionReport.overallScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {inspectionReport.overallScore}점
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-sm text-gray-400 mb-1">보안 문제</div>
                      <div className="text-2xl font-bold text-white">
                        {inspectionReport.issues.filter((i) => i.category === 'security').length}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-sm text-gray-400 mb-1">성능 문제</div>
                      <div className="text-2xl font-bold text-white">
                        {inspectionReport.issues.filter((i) => i.category === 'performance').length}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-sm text-gray-400 mb-1">안정성 문제</div>
                      <div className="text-2xl font-bold text-white">
                        {inspectionReport.issues.filter((i) => i.category === 'stability').length}
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-sm text-gray-400 mb-1">법적 문제</div>
                      <div className="text-2xl font-bold text-white">
                        {inspectionReport.issues.filter((i) => i.category === 'legal').length}
                      </div>
                    </div>
                  </div>

                  {/* 문제 목록 */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {inspectionReport.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                {issue.severity}
                              </span>
                              <span className="text-sm text-gray-400">{issue.category}</span>
                              {issue.autoFixable && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">
                                  자동 수정 가능
                                </span>
                              )}
                            </div>
                            <div className="text-white font-bold mb-1">{issue.issue}</div>
                            <div className="text-sm text-gray-400">{issue.recommendation}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 스케줄 관리 */}
              <div className="bg-white/5 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">자동 점검 스케줄</h3>
                
                {/* 새 스케줄 생성 */}
                <div className="bg-white/5 rounded-2xl p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">실행 시간</label>
                      <input
                        type="time"
                        value={newScheduleTime}
                        onChange={(e) => setNewScheduleTime(e.target.value)}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="autoFix"
                        checked={newScheduleAutoFix}
                        onChange={(e) => setNewScheduleAutoFix(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <label htmlFor="autoFix" className="text-white">자동 조치</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="optimize"
                        checked={newScheduleOptimize}
                        onChange={(e) => setNewScheduleOptimize(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <label htmlFor="optimize" className="text-white">최적화</label>
                    </div>
                    <button
                      onClick={createSchedule}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white transition-colors"
                    >
                      스케줄 추가
                    </button>
                  </div>
                </div>

                {/* 스케줄 목록 */}
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl"
                    >
                      <div className="flex items-center space-x-4">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <div>
                          <div className="text-white font-bold">매일 {schedule.time}</div>
                          <div className="text-sm text-gray-400">
                            {schedule.autoFix && '자동 조치'} {schedule.optimize && '최적화'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                          className={`px-4 py-2 rounded-xl font-bold transition-colors ${
                            schedule.enabled
                              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                          }`}
                        >
                          {schedule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-xl text-gray-400">준비 중입니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

