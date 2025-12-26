'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { activityLogSystem, type ActivityLog, type ActivityType } from '@/lib/audit/activity-log';
import { useToast } from '@/components/ui/Toast';

export function ActivityLogPanel() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadLogs();
    loadStats();
    
    // 샘플 로그 생성 (실제로는 서버에서 가져옴)
    activityLogSystem.logActivity('user-login', '사용자 로그인', 'user-1', '관리자');
    activityLogSystem.logActivity('project-create', '프로젝트 생성', 'user-1', '관리자', {
      resource: 'project',
      resourceId: 'project-1',
    });
    activityLogSystem.logActivity('file-update', '파일 업데이트', 'user-2', '사용자', {
      resource: 'file',
      resourceId: 'file-1',
    });
    
    loadLogs();
    loadStats();
  }, [filterType]);

  const loadLogs = () => {
    const filtered = activityLogSystem.getLogs({
      type: filterType !== 'all' ? filterType as ActivityType : undefined,
    });
    setLogs(filtered.slice(0, 50)); // 최근 50개만 표시
  };

  const loadStats = () => {
    setStats(activityLogSystem.getStats());
  };

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'user-login', label: '사용자 로그인' },
    { value: 'user-logout', label: '사용자 로그아웃' },
    { value: 'file-create', label: '파일 생성' },
    { value: 'file-update', label: '파일 업데이트' },
    { value: 'file-delete', label: '파일 삭제' },
    { value: 'project-create', label: '프로젝트 생성' },
    { value: 'deployment-start', label: '배포 시작' },
    { value: 'setting-change', label: '설정 변경' },
  ];

  const handleExport = (format: 'json' | 'csv') => {
    const exported = activityLogSystem.exportLogs(format);
    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ type: 'success', message: '로그가 내보내졌습니다' });
  };

  const getTypeColor = (type: ActivityType) => {
    if (type.includes('create')) return 'bg-green-100 text-green-700';
    if (type.includes('update')) return 'bg-blue-100 text-blue-700';
    if (type.includes('delete')) return 'bg-red-100 text-red-700';
    if (type.includes('login')) return 'bg-purple-100 text-purple-700';
    if (type.includes('deployment')) return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">활동 로그</h2>
            <p className="text-sm text-gray-500">시스템 활동 감사 추적</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 통계 */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{stats.totalLogs}</div>
                  <div className="text-sm text-gray-500">전체 로그</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Object.keys(stats.byType).length}
                  </div>
                  <div className="text-sm text-gray-500">활동 유형</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">
                    {Object.keys(stats.byUser).length}
                  </div>
                  <div className="text-sm text-gray-500">활성 사용자</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 필터 및 내보내기 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>활동 로그</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                >
                  <Download size={14} className="mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                >
                  <Download size={14} className="mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Dropdown
                options={typeOptions}
                value={filterType}
                onChange={setFilterType}
                placeholder="유형 필터"
              />
            </div>
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  로그가 없습니다
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={getTypeColor(log.type)} size="sm">
                            {log.type}
                          </Badge>
                          <span className="font-semibold text-gray-800">{log.action}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          사용자: {log.userName}
                          {log.resource && ` · 리소스: ${log.resource}`}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <Clock size={12} />
                          {log.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

