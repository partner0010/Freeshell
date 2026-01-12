/**
 * 관리자 메뉴 상태 위젯
 * 항상 표시되는 사이트 상태 요약
 */
'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface StatusSummary {
  overall: {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
  };
  realTime: {
    activeUsers: number;
  };
  security: {
    vulnerabilities: {
      critical: number;
      high: number;
    };
  };
}

export default function AdminStatusWidget() {
  const [status, setStatus] = useState<StatusSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      // 최신 리포트 가져오기
      const reportResponse = await fetch('/api/admin/health-check?limit=1');
      const analyticsResponse = await fetch('/api/admin/analytics?realtime=true');

      if (reportResponse.ok && analyticsResponse.ok) {
        const reportData = await reportResponse.json();
        const analyticsData = await analyticsResponse.json();

        if (reportData.reports && reportData.reports.length > 0) {
          const report = reportData.reports[0];
          setStatus({
            overall: {
              status: report.overall.status,
              score: report.overall.score,
            },
            realTime: {
              activeUsers: analyticsData.data?.activeUsers || 0,
            },
            security: {
              vulnerabilities: {
                critical: report.security.vulnerabilities.critical,
                high: report.security.vulnerabilities.high,
              },
            },
          });
        }
      }
    } catch (error) {
      console.error('상태 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">상태 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <Link href="/admin/status">
      <div className={`bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-all cursor-pointer ${getStatusColor(status.overall.status)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="font-semibold">시스템 상태</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.overall.status)}
            <span className="text-lg font-bold">{status.overall.score}/100</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs opacity-75 mb-1">실시간 사용자</p>
            <p className="font-bold">{status.realTime.activeUsers}명</p>
          </div>
          <div>
            <p className="text-xs opacity-75 mb-1">중요 취약점</p>
            <p className="font-bold">
              {status.security.vulnerabilities.critical + status.security.vulnerabilities.high}개
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs text-center opacity-75">클릭하여 상세 보기</p>
        </div>
      </div>
    </Link>
  );
}
