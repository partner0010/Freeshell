/**
 * 프로젝트 공유 모달
 */
'use client';

import { useState, useEffect } from 'react';
import { X, Share2, UserPlus, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectShareModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export default function ProjectShareModal({
  projectId,
  isOpen,
  onClose,
}: ProjectShareModalProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [sharedWith, setSharedWith] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
      loadSharedWith();
    }
  }, [isOpen, projectId]);

  const loadTeamMembers = async () => {
    try {
      const response = await fetch('/api/team/members');
      const data = await response.json();
      
      if (response.ok && data.members) {
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error('팀 멤버 조회 오류:', error);
    }
  };

  const loadSharedWith = async () => {
    try {
      const response = await fetch(`/api/projects/share?projectId=${projectId}`);
      const data = await response.json();
      
      if (response.ok && data.sharedWith) {
        setSharedWith(data.sharedWith);
      }
    } catch (error) {
      console.error('공유 정보 조회 오류:', error);
    }
  };

  const handleShare = async () => {
    if (selectedMembers.length === 0) {
      alert('공유할 멤버를 선택해주세요.');
      return;
    }

    setIsSharing(true);
    try {
      const response = await fetch('/api/projects/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          userIds: selectedMembers,
          permission,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || '프로젝트가 공유되었습니다.');
        setSelectedMembers([]);
        loadSharedWith();
      } else {
        alert(data.error || '공유 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('공유 오류:', error);
      alert('공유 중 오류가 발생했습니다.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async (userId: string) => {
    if (!confirm('정말 공유를 취소하시겠습니까?')) return;

    try {
      const response = await fetch('/api/projects/share', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          userId,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message || '공유가 취소되었습니다.');
        loadSharedWith();
      } else {
        alert(data.error || '공유 취소 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('공유 취소 오류:', error);
      alert('공유 취소 중 오류가 발생했습니다.');
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Share2 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">프로젝트 공유</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 본문 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 권한 선택 */}
            <div>
              <label className="block text-sm font-medium mb-2">권한 설정</label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'view' | 'edit' | 'admin')}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="view">보기만 가능</option>
                <option value="edit">편집 가능</option>
                <option value="admin">관리자 권한</option>
              </select>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium mb-2">팀원 검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이메일 또는 이름으로 검색..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* 멤버 목록 */}
            <div>
              <label className="block text-sm font-medium mb-2">멤버 선택</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => {
                      setSelectedMembers(prev =>
                        prev.includes(member.id)
                          ? prev.filter(id => id !== member.id)
                          : [...prev, member.id]
                      );
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedMembers.includes(member.id)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    {selectedMembers.includes(member.id) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 공유된 멤버 목록 */}
            {sharedWith.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">공유된 멤버</label>
                <div className="space-y-2">
                  {sharedWith.map((share) => (
                    <div
                      key={share.userId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div>
                        <p className="font-medium">{share.email}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          권한: {share.permission === 'view' ? '보기' : share.permission === 'edit' ? '편집' : '관리자'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnshare(share.userId)}
                        className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        공유 취소
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing || selectedMembers.length === 0}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{isSharing ? '공유 중...' : '공유하기'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
