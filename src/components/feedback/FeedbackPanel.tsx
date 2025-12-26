'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, Filter, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { feedbackSystem, type Feedback, type FeedbackType, type FeedbackStatus } from '@/lib/feedback/feedback-system';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function FeedbackPanel() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('feature');
  const { showToast } = useToast();

  React.useEffect(() => {
    loadFeedbacks();
  }, [filterType, filterStatus]);

  const loadFeedbacks = () => {
    const filtered = feedbackSystem.filterFeedbacks({
      type: filterType !== 'all' ? filterType as FeedbackType : undefined,
      status: filterStatus !== 'all' ? filterStatus as FeedbackStatus : undefined,
    });
    setFeedbacks(filtered);
  };

  const typeOptions = [
    { value: 'all', label: '전체' },
    { value: 'bug', label: '버그' },
    { value: 'feature', label: '기능 제안' },
    { value: 'improvement', label: '개선 사항' },
    { value: 'question', label: '질문' },
    { value: 'compliment', label: '칭찬' },
  ];

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'open', label: '열림' },
    { value: 'in-progress', label: '진행 중' },
    { value: 'resolved', label: '해결됨' },
    { value: 'closed', label: '닫힘' },
  ];

  const feedbackTypeOptions = [
    { value: 'bug', label: '버그 리포트' },
    { value: 'feature', label: '기능 제안' },
    { value: 'improvement', label: '개선 사항' },
    { value: 'question', label: '질문' },
    { value: 'compliment', label: '칭찬' },
  ];

  const handleCreateFeedback = () => {
    if (!feedbackTitle.trim() || !feedbackDescription.trim()) {
      showToast({ type: 'warning', message: '제목과 내용을 입력해주세요' });
      return;
    }

    feedbackSystem.createFeedback(feedbackType, feedbackTitle, feedbackDescription, 'User');
    setFeedbackTitle('');
    setFeedbackDescription('');
    loadFeedbacks();
    showToast({ type: 'success', message: '피드백이 제출되었습니다' });
  };

  const handleVote = (id: string) => {
    feedbackSystem.voteFeedback(id);
    loadFeedbacks();
    if (selectedFeedback && selectedFeedback.id === id) {
      setSelectedFeedback(feedbackSystem.getFeedback(id) || null);
    }
  };

  const getTypeColor = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return 'bg-red-100 text-red-700';
      case 'feature':
        return 'bg-blue-100 text-blue-700';
      case 'improvement':
        return 'bg-green-100 text-green-700';
      case 'question':
        return 'bg-yellow-100 text-yellow-700';
      case 'compliment':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: FeedbackStatus) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-700';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'list', label: '목록' },
    { id: 'create', label: '피드백 작성' },
  ];

  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">피드백 시스템</h2>
            <p className="text-sm text-gray-500">버그 리포트 및 기능 제안</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'list' ? (
          <>
            {/* 필터 */}
            <Card>
              <CardHeader>
                <CardTitle>필터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Dropdown
                    options={typeOptions}
                    value={filterType}
                    onChange={setFilterType}
                    placeholder="유형"
                  />
                  <Dropdown
                    options={statusOptions}
                    value={filterStatus}
                    onChange={setFilterStatus}
                    placeholder="상태"
                  />
                </div>
              </CardContent>
            </Card>

            {/* 피드백 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>피드백 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {feedbacks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    피드백이 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedFeedback?.id === feedback.id
                            ? 'bg-primary-50 border-primary-300'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{feedback.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {feedback.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(feedback.id);
                              }}
                            >
                              <ThumbsUp size={14} className="mr-1" />
                              {feedback.votes}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={getTypeColor(feedback.type)}>
                            {feedback.type === 'bug' ? '버그' : feedback.type === 'feature' ? '기능 제안' : feedback.type === 'improvement' ? '개선' : feedback.type === 'question' ? '질문' : '칭찬'}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(feedback.status)}>
                            {feedback.status === 'open' ? '열림' : feedback.status === 'in-progress' ? '진행 중' : feedback.status === 'resolved' ? '해결됨' : '닫힘'}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {feedback.comments.length}개 댓글
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 선택된 피드백 상세 */}
            {selectedFeedback && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedFeedback.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">{selectedFeedback.description}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">댓글</h5>
                      {selectedFeedback.comments.length === 0 ? (
                        <p className="text-sm text-gray-400">댓글이 없습니다</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedFeedback.comments.map((comment) => (
                            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{comment.author}</span>
                                <span className="text-xs text-gray-400">
                                  {comment.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>새 피드백 작성</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Dropdown
                  options={feedbackTypeOptions}
                  value={feedbackType}
                  onChange={(val) => setFeedbackType(val as FeedbackType)}
                  placeholder="유형 선택"
                />
                <Input
                  value={feedbackTitle}
                  onChange={(e) => setFeedbackTitle(e.target.value)}
                  placeholder="제목"
                />
                <textarea
                  value={feedbackDescription}
                  onChange={(e) => setFeedbackDescription(e.target.value)}
                  placeholder="설명을 입력하세요..."
                  className="w-full h-32 p-3 border rounded-lg"
                />
                <Button variant="primary" onClick={handleCreateFeedback} className="w-full">
                  <Plus size={18} className="mr-2" />
                  피드백 제출
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

