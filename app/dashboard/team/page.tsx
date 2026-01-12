'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Crown, Shield, Mail, Trash2, Edit } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  joinedAt: string;
}

const members: TeamMember[] = [
  {
    id: '1',
    name: '사용자',
    email: 'user@example.com',
    role: 'owner',
    joinedAt: '2024-01-01',
  },
  {
    id: '2',
    name: '팀원 1',
    email: 'member1@example.com',
    role: 'admin',
    joinedAt: '2024-01-10',
  },
  {
    id: '3',
    name: '팀원 2',
    email: 'member2@example.com',
    role: 'member',
    joinedAt: '2024-01-12',
  },
];

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Users,
};

const roleColors = {
  owner: 'text-yellow-500',
  admin: 'text-purple-500',
  member: 'text-blue-500',
  viewer: 'text-gray-500',
};

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(members);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: 'member',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setInviteEmail('');
        alert(data.message || '초대 이메일이 전송되었습니다!');
        // 멤버 목록 새로고침
        loadMembers();
      } else {
        alert(data.error || '초대 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('초대 오류:', error);
      alert('초대 중 오류가 발생했습니다.');
    } finally {
      setIsInviting(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await fetch('/api/team/members');
      const data = await response.json();
      
      if (response.ok && data.members) {
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error('멤버 조회 오류:', error);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const removeMember = async (id: string) => {
    if (!confirm('정말 이 멤버를 제거하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/team/members?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== id));
        alert(data.message || '멤버가 제거되었습니다.');
      } else {
        alert(data.error || '멤버 제거 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('멤버 제거 오류:', error);
      alert('멤버 제거 중 오류가 발생했습니다.');
    }
  };

  const updateMemberRole = async (id: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      const response = await fetch('/api/team/members', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: id,
          role: newRole,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTeamMembers(teamMembers.map(m => 
          m.id === id ? { ...m, role: newRole } : m
        ));
        alert(data.message || '역할이 업데이트되었습니다.');
      } else {
        alert(data.error || '역할 업데이트 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('역할 업데이트 오류:', error);
      alert('역할 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">팀 관리</h1>
          <p className="text-gray-600 dark:text-gray-400">팀원을 초대하고 권한을 관리하세요</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <UserPlus className="w-6 h-6 text-primary" />
              <span>팀원 초대</span>
            </h2>
          </div>
          <div className="flex space-x-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="이메일 주소"
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleInvite}
              disabled={isInviting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>{isInviting ? '전송 중...' : '초대하기'}</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => {
            const RoleIcon = roleIcons[member.role];
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RoleIcon className={`w-5 h-5 ${roleColors[member.role]}`} />
                    <span className="text-sm capitalize">{member.role}</span>
                  </div>
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value as 'admin' | 'member' | 'viewer')}
                    disabled={member.role === 'owner'}
                    className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  >
                    <option value="admin">관리자</option>
                    <option value="member">멤버</option>
                    <option value="viewer">뷰어</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  가입일: {member.joinedAt}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

