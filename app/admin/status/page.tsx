/**
 * 관리자 상태 대시보드
 * 솔루션 점검 및 상세 상태 모니터링
 */
'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  FileText,
  Eye,
  BarChart3,
  Zap,
  History
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EnhancedButton from '@/components/EnhancedButton';
import EnhancedCard from '@/components/EnhancedCard';
import ScrollAnimation from '@/components/ScrollAnimation';
import PageHeader from '@/components/PageHeader';

interface HealthCheckReport {
  timestamp: string;
  overall: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    message: string;
  };
  services: any;
  security: any;
  dataProtection: any;
  performance: any;
  recommendations: any[];
}

interface AnalyticsData {
  users: {
    total: number;
    active: number;
    new: number;
    returning: number;
  };
  traffic: {
    total: number;
    unique: number;
    pageViews: number;
    sessions: number;
    averageSessionDuration: number;
  };
  menuUsage: {
    [menu: string]: {
      views: number;
      uniqueUsers: number;
      averageTime: number;
    };
  };
  realTime: {
    activeUsers: number;
    currentPage: string;
    lastActivity: string;
  };
}

export default function AdminStatusPage() {
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [latestReport, setLatestReport] = useState<HealthCheckReport | null>(null);
  const [reports, setReports] = useState<HealthCheckReport[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedDate, setSelectedDate] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reportsList, setReportsList] = useState<any[]>([]);

  useEffect(() => {
    loadLatestReport();
    loadAnalytics();
    loadReports();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadLatestReport();
        loadAnalytics();
      }, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedDate]);

  const loadReports = async () => {
    try {
      const response = await fetch('/api/admin/reports?limit=10');
      if (response.ok) {
        const data = await response.json();
        setReportsList(data.reports || []);
      }
    } catch (error) {
      console.error('리포트 목록 로드 실패:', error);
    }
  };

  const downloadReport = async (reportId: string, format: 'json' | 'csv' = 'csv') => {
    try {
      const response = await fetch(`/api/admin/reports?id=${reportId}&format=${format}`);
      if (response.ok) {
        if (format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `health-check-${reportId}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `health-check-${reportId}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('리포트 다운로드 실패:', error);
    }
  };

  const loadLatestReport = async () => {
    try {
      const response = await fetch('/api/admin/health-check?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.reports && data.reports.length > 0) {
          setLatestReport(data.reports[0]);
        }
      }
    } catch (error) {
      console.error('리포트 로드 실패:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/admin/analytics?start=${selectedDate.start}&end=${selectedDate.end}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('분석 데이터 로드 실패:', error);
    }
  };

  const runHealthCheck = async () => {
    setIsRunningCheck(true);
    try {
      const response = await fetch('/api/admin/health-check', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setLatestReport(data.report);
        await loadLatestReport();
      }
    } catch (error) {
      console.error('점검 실행 실패:', error);
    } finally {
      setIsRunningCheck(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      <PageHeader
        title="솔루션 상태 대시보드"
        description="전체 시스템 상태 모니터링 및 점검"
        icon={Activity}
        action={
          <div className="flex items-center gap-2">
            <EnhancedButton
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-500' : ''}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>자동 갱신 {autoRefresh ? 'ON' : 'OFF'}</span>
            </EnhancedButton>
            <EnhancedButton
              variant="outline"
              onClick={() => setShowReports(!showReports)}
              icon={History}
            >
              리포트 목록
            </EnhancedButton>
            <EnhancedButton
              variant="gradient"
              onClick={runHealthCheck}
              loading={isRunningCheck}
              icon={Zap}
            >
              솔루션 점검 실행
            </EnhancedButton>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* 전체 상태 요약 */}
        {latestReport && (
          <ScrollAnimation direction="down">
            <EnhancedCard className="mb-8" glass>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">전체 상태</h2>
                  <p className="text-gray-600">
                    마지막 점검: {new Date(latestReport.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`px-6 py-4 rounded-xl border-2 ${getStatusColor(latestReport.overall.status)}`}>
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(latestReport.overall.status)}
                    <span className="text-2xl font-bold">{latestReport.overall.score}/100</span>
                  </div>
                  <p className="text-sm font-semibold">{latestReport.overall.message}</p>
                </div>
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 실시간 사용자 현황 */}
          <ScrollAnimation direction="up" delay={100}>
            <EnhancedCard title="실시간 사용자 현황" icon={Users}>
              {analytics ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">현재 접속자</span>
                    <span className="text-3xl font-bold text-purple-600">
                      {analytics.realTime.activeUsers}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">총 사용자</p>
                      <p className="text-xl font-bold">{analytics.users.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">활성 사용자</p>
                      <p className="text-xl font-bold text-green-600">
                        {analytics.users.active.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">신규 사용자</p>
                      <p className="text-xl font-bold text-blue-600">
                        {analytics.users.new.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">재방문자</p>
                      <p className="text-xl font-bold text-purple-600">
                        {analytics.users.returning.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">데이터 로딩 중...</div>
              )}
            </EnhancedCard>
          </ScrollAnimation>

          {/* 트래픽 통계 */}
          <ScrollAnimation direction="up" delay={200}>
            <EnhancedCard title="트래픽 통계" icon={TrendingUp}>
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">총 방문</p>
                      <p className="text-2xl font-bold">{analytics.traffic.total.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">고유 방문자</p>
                      <p className="text-2xl font-bold">{analytics.traffic.unique.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">페이지뷰</p>
                      <p className="text-2xl font-bold">{analytics.traffic.pageViews.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">세션</p>
                      <p className="text-2xl font-bold">{analytics.traffic.sessions.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-1">평균 세션 시간</p>
                    <p className="text-xl font-bold">
                      {Math.floor(analytics.traffic.averageSessionDuration / 60)}분{' '}
                      {analytics.traffic.averageSessionDuration % 60}초
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">데이터 로딩 중...</div>
              )}
            </EnhancedCard>
          </ScrollAnimation>
        </div>

        {/* 날짜 선택 */}
        <ScrollAnimation direction="up" delay={300}>
          <EnhancedCard className="mb-8" title="날짜 범위 선택" icon={Calendar}>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
                <input
                  type="date"
                  value={selectedDate.start}
                  onChange={(e) => setSelectedDate({ ...selectedDate, start: e.target.value })}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
                <input
                  type="date"
                  value={selectedDate.end}
                  onChange={(e) => setSelectedDate({ ...selectedDate, end: e.target.value })}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex-1" />
              <EnhancedButton onClick={loadAnalytics} variant="outline" icon={RefreshCw}>
                조회
              </EnhancedButton>
            </div>
          </EnhancedCard>
        </ScrollAnimation>

        {/* 메뉴별 사용 통계 */}
        {analytics && (
          <ScrollAnimation direction="up" delay={400}>
            <EnhancedCard title="메뉴별 사용 통계" icon={BarChart3}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">메뉴</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">조회수</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">고유 사용자</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">평균 체류 시간</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analytics.menuUsage).map(([menu, stats]) => (
                      <tr key={menu} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{menu}</td>
                        <td className="py-3 px-4 text-right">{stats.views.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">{stats.uniqueUsers.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right">
                          {Math.floor(stats.averageTime / 60)}분 {stats.averageTime % 60}초
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}

        {/* 보안 상태 */}
        {latestReport && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ScrollAnimation direction="up" delay={500}>
              <EnhancedCard title="보안 상태" icon={Shield}>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">취약점 상태</span>
                      <span className="text-sm text-gray-500">
                        {latestReport.security.vulnerabilities.critical +
                          latestReport.security.vulnerabilities.high +
                          latestReport.security.vulnerabilities.medium +
                          latestReport.security.vulnerabilities.low}{' '}
                        개 발견
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-red-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-red-700">
                          {latestReport.security.vulnerabilities.critical}
                        </p>
                        <p className="text-xs text-red-600">Critical</p>
                      </div>
                      <div className="bg-orange-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-orange-700">
                          {latestReport.security.vulnerabilities.high}
                        </p>
                        <p className="text-xs text-orange-600">High</p>
                      </div>
                      <div className="bg-yellow-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-yellow-700">
                          {latestReport.security.vulnerabilities.medium}
                        </p>
                        <p className="text-xs text-yellow-600">Medium</p>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-2 text-center">
                        <p className="text-lg font-bold text-blue-700">
                          {latestReport.security.vulnerabilities.low}
                        </p>
                        <p className="text-xs text-blue-600">Low</p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">바이러스 상태</span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          latestReport.security.virusStatus === 'clean'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {latestReport.security.virusStatus === 'clean' ? '정상' : '의심'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">해킹 시도</span>
                      <span className="text-sm font-semibold">
                        {latestReport.security.hackingAttempts}회
                      </span>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </ScrollAnimation>

            {/* 정보보호 상태 */}
            <ScrollAnimation direction="up" delay={600}>
              <EnhancedCard title="정보보호 상태" icon={Shield}>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">금융 정보</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">암호화</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            latestReport.dataProtection.financial.encrypted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {latestReport.dataProtection.financial.encrypted ? '적용됨' : '미적용'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">준수 상태</span>
                        <span className="text-sm font-semibold">
                          {latestReport.dataProtection.financial.compliance === 'none'
                            ? 'N/A'
                            : latestReport.dataProtection.financial.compliance.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {latestReport.dataProtection.financial.details}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">개인정보</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">암호화</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            latestReport.dataProtection.personal.encrypted
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {latestReport.dataProtection.personal.encrypted ? '적용됨' : '미적용'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">준수 상태</span>
                        <span className="text-sm font-semibold">
                          {latestReport.dataProtection.personal.compliance === 'none'
                            ? 'N/A'
                            : latestReport.dataProtection.personal.compliance.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {latestReport.dataProtection.personal.details}
                      </p>
                    </div>
                  </div>
                </div>
              </EnhancedCard>
            </ScrollAnimation>
          </div>
        )}

        {/* 서비스 상태 */}
        {latestReport && (
          <ScrollAnimation direction="up" delay={700}>
            <EnhancedCard title="서비스 상태" icon={Activity}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(latestReport.services).map(([key, service]: [string, any]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 ${
                      service.status === 'healthy'
                        ? 'bg-green-50 border-green-200'
                        : service.status === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{service.name}</span>
                      {getStatusIcon(service.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{service.message}</p>
                    {service.responseTime && (
                      <p className="text-xs text-gray-500">
                        응답 시간: {service.responseTime}ms
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}

        {/* 권장사항 */}
        {latestReport && latestReport.recommendations.length > 0 && (
          <ScrollAnimation direction="up" delay={800}>
            <EnhancedCard title="권장사항" icon={FileText}>
              <div className="space-y-3">
                {latestReport.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      rec.priority === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : rec.priority === 'high'
                        ? 'bg-orange-50 border-orange-200'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                            rec.priority === 'critical'
                              ? 'bg-red-200 text-red-700'
                              : rec.priority === 'high'
                              ? 'bg-orange-200 text-orange-700'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-200 text-yellow-700'
                              : 'bg-blue-200 text-blue-700'
                          }`}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-900">{rec.title}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                    <p className="text-xs text-gray-500">
                      <strong>조치:</strong> {rec.action}
                    </p>
                  </div>
                ))}
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}

        {/* 리포트 목록 */}
        {showReports && (
          <ScrollAnimation direction="up" delay={900}>
            <EnhancedCard title="점검 리포트 목록" icon={History}>
              <div className="space-y-3">
                {reportsList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>저장된 리포트가 없습니다.</p>
                  </div>
                ) : (
                  reportsList.map((report) => (
                    <div
                      key={report.timestamp}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(report.overall.status)}
                          <span className="font-semibold text-gray-900">
                            {new Date(report.timestamp).toLocaleString()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(report.overall.status)}`}>
                            {report.overall.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{report.overall.message}</p>
                        <p className="text-xs text-gray-500">
                          서비스 {report.summary.servicesCount}개 • 취약점 {report.summary.vulnerabilitiesCount}개
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <EnhancedButton
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report.timestamp, 'csv')}
                          icon={Download}
                        >
                          CSV
                        </EnhancedButton>
                        <EnhancedButton
                          variant="outline"
                          size="sm"
                          onClick={() => downloadReport(report.timestamp, 'json')}
                          icon={Download}
                        >
                          JSON
                        </EnhancedButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </EnhancedCard>
          </ScrollAnimation>
        )}
      </div>

      <Footer />
    </div>
  );
}
