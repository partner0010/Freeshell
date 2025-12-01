import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'

interface RevenueData {
  total: number
  byPlatform: Record<string, number>
}

interface DailyRevenue {
  date: string
  platform: string
  amount: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function RevenueDashboard() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    fetchRevenue()
  }, [period])

  const fetchRevenue = async () => {
    try {
      setLoading(true)
      const startDate = getStartDate(period)
      
      const response = await axios.get('/api/revenue', {
        params: {
          startDate: startDate?.toISOString()
        }
      })

      if (response.data.success) {
        setRevenue(response.data.data)
      }

      // 일별 수익 데이터 (예시)
      setDailyRevenue(generateMockDailyData(period))
    } catch (error) {
      console.error('수익 데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStartDate = (period: string): Date | undefined => {
    const now = new Date()
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default:
        return undefined
    }
  }

  const generateMockDailyData = (period: string): DailyRevenue[] => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    const platforms = ['youtube', 'gumroad', 'blog', 'template']
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      return {
        date: date.toISOString().split('T')[0],
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        amount: Math.random() * 100 + 10
      }
    })
  }

  const platformData = revenue?.byPlatform 
    ? Object.entries(revenue.byPlatform).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round(value)
      }))
    : []

  const dailyChartData = dailyRevenue.reduce((acc, item) => {
    const existing = acc.find(d => d.date === item.date)
    if (existing) {
      existing[item.platform] = (existing[item.platform] || 0) + item.amount
    } else {
      acc.push({
        date: item.date,
        [item.platform]: item.amount
      })
    }
    return acc
  }, [] as any[])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">수익 대시보드</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="7d">최근 7일</option>
          <option value="30d">최근 30일</option>
          <option value="90d">최근 90일</option>
          <option value="all">전체</option>
        </select>
      </div>

      {/* 총 수익 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">총 수익</div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            ${revenue?.total ? revenue.total.toLocaleString() : '0'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">YouTube</div>
          <div className="text-2xl font-bold mt-2">
            ${revenue?.byPlatform?.youtube?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">E-book 판매</div>
          <div className="text-2xl font-bold mt-2">
            ${revenue?.byPlatform?.gumroad?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-500 text-sm">블로그</div>
          <div className="text-2xl font-bold mt-2">
            ${revenue?.byPlatform?.blog?.toLocaleString() || '0'}
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 플랫폼별 수익 파이 차트 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">플랫폼별 수익 분포</h2>
          {platformData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* 일별 수익 추이 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">일별 수익 추이</h2>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="youtube" stackId="a" fill="#0088FE" />
                <Bar dataKey="gumroad" stackId="a" fill="#00C49F" />
                <Bar dataKey="blog" stackId="a" fill="#FFBB28" />
                <Bar dataKey="template" stackId="a" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* 플랫폼별 상세 수익 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">플랫폼별 상세 수익</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">플랫폼</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">수익</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">비율</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {platformData.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${item.value.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {revenue?.total ? ((item.value / revenue.total) * 100).toFixed(1) : '0'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

