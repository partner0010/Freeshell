'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Server,
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

// 로그 데이터
const logsData = [
  { id: 1, type: 'info', message: '사용자 로그인 성공', user: 'kim@example.com', source: 'auth', timestamp: '2024-03-25 14:32:15', ip: '192.168.1.1' },
  { id: 2, type: 'warning', message: '비밀번호 입력 실패 (3회)', user: 'park@example.com', source: 'auth', timestamp: '2024-03-25 14:30:22', ip: '192.168.1.45' },
  { id: 3, type: 'success', message: '프로젝트 저장 완료', user: 'lee@example.com', source: 'project', timestamp: '2024-03-25 14:28:10', ip: '192.168.1.23' },
  { id: 4, type: 'error', message: 'API 요청 실패: Rate limit exceeded', user: 'system', source: 'api', timestamp: '2024-03-25 14:25:44', ip: '-' },
  { id: 5, type: 'info', message: '새 사용자 가입', user: 'new@example.com', source: 'auth', timestamp: '2024-03-25 14:22:33', ip: '192.168.1.78' },
  { id: 6, type: 'warning', message: 'DB 연결 지연 감지', user: 'system', source: 'database', timestamp: '2024-03-25 14:20:15', ip: '-' },
  { id: 7, type: 'success', message: '결제 처리 완료', user: 'jung@example.com', source: 'billing', timestamp: '2024-03-25 14:18:02', ip: '192.168.1.92' },
  { id: 8, type: 'info', message: '템플릿 다운로드', user: 'choi@example.com', source: 'template', timestamp: '2024-03-25 14:15:48', ip: '192.168.1.56' },
];

const logTypeConfig: Record<string, { color: string; bgColor: string; icon: React.ComponentType<any> }> = {
  info: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Info },
  warning: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: AlertTriangle },
  error: { color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertCircle },
  success: { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
};

const sourceIcons: Record<string, React.ComponentType<any>> = {
  auth: User,
  api: Server,
  database: Database,
  project: Server,
  billing: Shield,
  template: Server,
};

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filteredLogs = logsData.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || log.type === selectedType;
    const matchesSource = selectedSource === 'all' || log.source === selectedSource;
    return matchesSearch && matchesType && matchesSource;
  });

  // 로그 통계
  const stats = {
    total: logsData.length,
    errors: logsData.filter(l => l.type === 'error').length,
    warnings: logsData.filter(l => l.type === 'warning').length,
    today: logsData.length, // 실제로는 날짜 필터 적용
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-800">시스템 로그</h1>
          <p className="text-gray-500 mt-1">시스템 활동을 모니터링하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">자동 새로고침</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Download size={18} />
            내보내기
          </button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">전체 로그</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">오류</p>
              <p className="text-2xl font-bold text-gray-800">{stats.errors}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">경고</p>
              <p className="text-2xl font-bold text-gray-800">{stats.warnings}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">오늘</p>
              <p className="text-2xl font-bold text-gray-800">{stats.today}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="로그 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="all">모든 유형</option>
            <option value="info">정보</option>
            <option value="warning">경고</option>
            <option value="error">오류</option>
            <option value="success">성공</option>
          </select>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="all">모든 소스</option>
            <option value="auth">인증</option>
            <option value="api">API</option>
            <option value="database">데이터베이스</option>
            <option value="project">프로젝트</option>
            <option value="billing">결제</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <RefreshCw size={18} />
            새로고침
          </button>
        </div>
      </div>

      {/* 로그 테이블 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">유형</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">메시지</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">사용자</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">소스</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">IP</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">시간</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => {
                const typeConfig = logTypeConfig[log.type];
                const TypeIcon = typeConfig.icon;
                const SourceIcon = sourceIcons[log.source] || Server;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                        <TypeIcon size={12} />
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-800 truncate max-w-xs">{log.message}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{log.user}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <SourceIcon size={14} />
                        {log.source}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500 font-mono">{log.ip}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-gray-600">{filteredLogs.length}개 로그</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg">1</button>
            <button className="p-2 border rounded-lg hover:bg-gray-50">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

