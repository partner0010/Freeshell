'use client';

import React, { useState } from 'react';
import { Clock, Plus, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { taskScheduler, type ScheduledTask, type ScheduleType } from '@/lib/scheduler/task-scheduler';
import { useToast } from '@/components/ui/Toast';

export function TaskSchedulerPanel() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [taskName, setTaskName] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('daily');
  const [schedule, setSchedule] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setTasks(taskScheduler.getAllTasks());
  }, []);

  const scheduleTypeOptions = [
    { value: 'once', label: '한 번만' },
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
    { value: 'cron', label: 'Cron 표현식' },
  ];

  const handleCreateTask = () => {
    if (!taskName.trim() || !schedule.trim()) {
      showToast({ type: 'warning', message: '작업 이름과 스케줄을 입력해주세요' });
      return;
    }

    taskScheduler.createTask(taskName, scheduleType, schedule, 'backup-data');
    setTasks(taskScheduler.getAllTasks());
    setTaskName('');
    setSchedule('');
    showToast({ type: 'success', message: '작업이 생성되었습니다' });
  };

  const handleExecute = async (taskId: string) => {
    await taskScheduler.executeTask(taskId);
    setTasks(taskScheduler.getAllTasks());
    showToast({ type: 'success', message: '작업이 실행되었습니다' });
  };

  const handleToggle = (taskId: string) => {
    taskScheduler.toggleTask(taskId);
    setTasks(taskScheduler.getAllTasks());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Clock className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">작업 스케줄러</h2>
            <p className="text-sm text-gray-500">예약 작업 및 자동화</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {/* 작업 생성 */}
        <Card>
          <CardHeader>
            <CardTitle>새 작업 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="작업 이름"
              />
              <Dropdown
                options={scheduleTypeOptions}
                value={scheduleType}
                onChange={(val) => setScheduleType(val as ScheduleType)}
                placeholder="스케줄 유형"
              />
              <Input
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder={scheduleType === 'cron' ? '0 0 * * *' : '2025-01-01 00:00:00'}
              />
              <Button variant="primary" onClick={handleCreateTask} className="w-full">
                <Plus size={18} className="mr-2" />
                작업 생성
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 작업 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>예약된 작업</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                예약된 작업이 없습니다
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{task.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {task.scheduleType} · {task.schedule}
                        </p>
                        {task.nextRun && (
                          <p className="text-xs text-gray-400 mt-1">
                            다음 실행: {task.nextRun.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                        {task.enabled ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggle(task.id)}
                          >
                            <Pause size={14} />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggle(task.id)}
                          >
                            <Play size={14} />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecute(task.id)}
                        >
                          <Play size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>실행: {task.runCount}회</span>
                      <span>오류: {task.errorCount}회</span>
                      {task.lastRun && (
                        <span>마지막 실행: {task.lastRun.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

