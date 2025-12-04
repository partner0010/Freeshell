/**
 * 🎬 자동 창작 페이지
 * AI 추천 + 자동 생성 + 미리보기 + 선택 + 배포
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Calendar, Clock, TrendingUp, Play, Download, Upload, CheckCircle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

interface Recommendation {
  topic: string
  score: number
  reason: string
  category: string
  keywords: string[]
}

interface GeneratedVersion {
  id: string
  url: string
  thumbnailUrl: string
  score: number
  selected: boolean
}

export default function AutoCreation() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [versions, setVersions] = useState<GeneratedVersion[]>([])
  const [schedule, setSchedule] = useState({
    frequency: 'daily',
    count: 10,
    time: '08:30'
  })

  // 오늘의 추천 가져오기
  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/api/trends/daily-recommendations')
      setRecommendations(response.data.recommendations)
    } catch (error) {
      toast.error('추천을 가져올 수 없습니다')
    }
  }

  // 콘텐츠 생성
  const generateContent = async (topic: string) => {
    setGenerating(true)
    setSelectedTopic(topic)

    try {
      toast.loading('AI가 여러 버전을 생성 중...', { duration: 3000 })

      const response = await api.post('/api/ai/generate-versions', {
        topic,
        count: 3,
        settings: {
          resolution: '4K',
          fps: 60,
          lipSync: true,
          detailLevel: 'ultra'
        }
      })

      const newVersions = response.data.versions.map((v: any) => ({
        ...v,
        selected: false
      }))

      setVersions(newVersions)
      toast.success(`${newVersions.length}개 버전 생성 완료!`)
    } catch (error) {
      toast.error('생성 실패')
    } finally {
      setGenerating(false)
    }
  }

  // 버전 선택/해제
  const toggleVersion = (id: string) => {
    setVersions(prev =>
      prev.map(v => v.id === id ? { ...v, selected: !v.selected } : v)
    )
  }

  // 선택한 버전 다운로드
  const downloadSelected = () => {
    const selected = versions.filter(v => v.selected)
    
    if (selected.length === 0) {
      toast.error('다운로드할 버전을 선택하세요')
      return
    }

    selected.forEach(v => {
      const link = document.createElement('a')
      link.href = v.url
      link.download = `${selectedTopic}-${v.id}.mp4`
      link.click()
    })

    toast.success(`${selected.length}개 다운로드 시작!`)
  }

  // 선택한 버전 소셜 미디어 업로드
  const uploadSelected = async () => {
    const selected = versions.filter(v => v.selected)
    
    if (selected.length === 0) {
      toast.error('업로드할 버전을 선택하세요')
      return
    }

    try {
      toast.loading('소셜 미디어 업로드 중...')

      const response = await api.post('/api/social/upload-batch', {
        videos: selected.map(v => v.url),
        platforms: ['youtube', 'tiktok', 'instagram']
      })

      toast.success(`${response.data.successful}개 업로드 완료!`)
    } catch (error) {
      toast.error('업로드 실패')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            🎬 AI 자동 창작 스튜디오
          </h1>
          <p className="text-xl text-gray-300">
            AI가 추천하고, 자동으로 생성하고, 미리보기 후 선택하세요
          </p>
        </motion.div>

        {/* 오늘의 추천 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-yellow-400" />
              오늘의 추천 주제
            </h2>
            <button
              onClick={fetchRecommendations}
              className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-xl transition-colors"
            >
              🔄 새로고침
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => generateContent(rec.topic)}
                className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-xl border border-purple-500/30 hover:border-purple-500 cursor-pointer hover:scale-105 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl font-bold text-yellow-400">
                    #{idx + 1}
                  </span>
                  <span className="bg-purple-500 px-3 py-1 rounded-full text-sm">
                    {rec.score}점
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2">{rec.topic}</h3>
                <p className="text-sm text-gray-400 mb-3">{rec.reason}</p>

                <div className="flex flex-wrap gap-2">
                  {rec.keywords.map(keyword => (
                    <span key={keyword} className="bg-blue-500/30 px-2 py-1 rounded text-xs">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 자동 예약 설정 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20"
        >
          <h2 className="text-3xl font-bold mb-6 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-green-400" />
            자동 예약 설정
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">빈도</label>
              <select
                value={schedule.frequency}
                onChange={(e) => setSchedule({ ...schedule, frequency: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3"
              >
                <option value="daily">매일</option>
                <option value="weekly">매주</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">개수</label>
              <input
                type="number"
                value={schedule.count}
                onChange={(e) => setSchedule({ ...schedule, count: parseInt(e.target.value) })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3"
                min={1}
                max={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">시간</label>
              <input
                type="time"
                value={schedule.time}
                onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3"
              />
            </div>
          </div>

          <button className="mt-6 w-full bg-gradient-to-r from-green-500 to-teal-500 py-4 rounded-xl font-bold hover:shadow-lg transition-all">
            ⏰ 자동 예약 시작
          </button>
        </motion.div>

        {/* 생성된 버전들 (미리보기 & 선택) */}
        <AnimatePresence>
          {versions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center">
                <Sparkles className="w-8 h-8 mr-3 text-purple-400" />
                생성된 버전 ({versions.filter(v => v.selected).length}/{versions.length} 선택됨)
              </h2>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {versions.map((version, idx) => (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => toggleVersion(version.id)}
                    className={`relative bg-gray-800 rounded-xl overflow-hidden cursor-pointer border-4 transition-all ${
                      version.selected ? 'border-green-500 shadow-lg shadow-green-500/50' : 'border-transparent hover:border-purple-500'
                    }`}
                  >
                    {/* 썸네일 */}
                    <div className="relative aspect-video bg-gray-700">
                      <img
                        src={version.thumbnailUrl}
                        alt={`버전 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* 재생 버튼 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-16 h-16 text-white" />
                      </div>

                      {/* 선택 표시 */}
                      {version.selected && (
                        <div className="absolute top-4 right-4">
                          <CheckCircle className="w-8 h-8 text-green-500 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">버전 {idx + 1}</span>
                        <span className="bg-yellow-500 px-3 py-1 rounded-full text-sm font-bold text-black">
                          {version.score}점
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 space-y-1">
                        <div>해상도: {version.metadata.resolution}</div>
                        <div>품질: {version.score >= 95 ? '최고' : '우수'}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                <button
                  onClick={downloadSelected}
                  disabled={versions.filter(v => v.selected).length === 0}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>선택 항목 다운로드</span>
                </button>

                <button
                  onClick={uploadSelected}
                  disabled={versions.filter(v => v.selected).length === 0}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:shadow-lg disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span>소셜 미디어 업로드</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 로딩 */}
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <div className="w-32 h-32 border-8 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
              <h3 className="text-2xl font-bold mb-2">AI가 창작 중...</h3>
              <p className="text-gray-400">초고품질로 여러 버전을 생성하고 있습니다</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

