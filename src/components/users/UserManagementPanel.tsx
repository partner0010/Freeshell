'use client';

import React, { useState } from 'react';
import { Users, Plus, Shield, UserPlus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { userManagement, type User, type Team, type Role } from '@/lib/users/user-management';
import { useToast } from '@/components/ui/Toast';
import { Tabs } from '@/components/ui/Tabs';

export function UserManagementPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<Role>('viewer');
  const [teamName, setTeamName] = useState('');
  const { showToast } = useToast();

  React.useEffect(() => {
    setUsers(userManagement.getAllUsers());
    setTeams(userManagement.getAllTeams());
  }, []);

  const roleOptions = [
    { value: 'admin', label: '관리자' },
    { value: 'editor', label: '편집자' },
    { value: 'viewer', label: '조회자' },
    { value: 'guest', label: '게스트' },
  ];

  const handleCreateUser = () => {
    if (!userEmail.trim() || !userName.trim()) {
      showToast({ type: 'warning', message: '이메일과 이름을 입력해주세요' });
      return;
    }

    const user = userManagement.createUser(userEmail, userName, userRole);
    setUsers([...users, user]);
    setUserEmail('');
    setUserName('');
    showToast({ type: 'success', message: '사용자가 생성되었습니다' });
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      showToast({ type: 'warning', message: '팀 이름을 입력해주세요' });
      return;
    }

    const team = userManagement.createTeam(teamName);
    setTeams([...teams, team]);
    setTeamName('');
    showToast({ type: 'success', message: '팀이 생성되었습니다' });
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-700';
      case 'editor':
        return 'bg-blue-100 text-blue-700';
      case 'viewer':
        return 'bg-green-100 text-green-700';
      case 'guest':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const tabs = [
    { id: 'users', label: '사용자' },
    { id: 'teams', label: '팀' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">사용자 관리</h2>
            <p className="text-sm text-gray-500">팀 및 권한 관리</p>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as typeof activeTab)} />
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {activeTab === 'users' ? (
          <>
            {/* 사용자 생성 */}
            <Card>
              <CardHeader>
                <CardTitle>새 사용자 추가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="이메일"
                  />
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="이름"
                  />
                  <Dropdown
                    options={roleOptions}
                    value={userRole}
                    onChange={(val) => setUserRole(val as Role)}
                  />
                  <Button variant="primary" onClick={handleCreateUser} className="w-full">
                    <Plus size={18} className="mr-2" />
                    사용자 추가
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 사용자 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>사용자 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    사용자가 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{user.name}</h4>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {user.role === 'admin' ? '관리자' : user.role === 'editor' ? '편집자' : user.role === 'viewer' ? '조회자' : '게스트'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {user.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" size="sm">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* 팀 생성 */}
            <Card>
              <CardHeader>
                <CardTitle>새 팀 생성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="팀 이름"
                    className="flex-1"
                  />
                  <Button variant="primary" onClick={handleCreateTeam}>
                    <Plus size={18} className="mr-2" />
                    생성
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 팀 목록 */}
            <Card>
              <CardHeader>
                <CardTitle>팀 목록</CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    팀이 없습니다
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div key={team.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Building2 size={20} className="text-gray-600" />
                            <h4 className="font-semibold text-gray-800">{team.name}</h4>
                          </div>
                          <Badge variant="outline">{team.members.length}명</Badge>
                        </div>
                        <div className="space-y-2">
                          {team.members.length === 0 ? (
                            <p className="text-sm text-gray-400">멤버가 없습니다</p>
                          ) : (
                            team.members.map((member) => (
                              <div key={member.id} className="flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-gray-700">{member.name}</span>
                                <Badge variant="outline" size="sm">{member.role}</Badge>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

