/**
 * 사용자 관리 시스템
 * User Management System
 */

export type Role = 'admin' | 'editor' | 'viewer' | 'guest';

export type Permission = 'read' | 'write' | 'delete' | 'admin' | 'deploy' | 'settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  avatar?: string;
  lastActive?: Date;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  createdAt: Date;
}

export interface RolePermission {
  role: Role;
  permissions: Permission[];
}

// 사용자 관리 시스템
export class UserManagement {
  private users: Map<string, User> = new Map();
  private teams: Map<string, Team> = new Map();

  private rolePermissions: RolePermission[] = [
    { role: 'admin', permissions: ['read', 'write', 'delete', 'admin', 'deploy', 'settings'] },
    { role: 'editor', permissions: ['read', 'write'] },
    { role: 'viewer', permissions: ['read'] },
    { role: 'guest', permissions: [] },
  ];

  // 사용자 생성
  createUser(email: string, name: string, role: Role = 'viewer'): User {
    const rolePerm = this.rolePermissions.find(rp => rp.role === role);
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      permissions: rolePerm?.permissions || [],
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // 권한 확인
  hasPermission(userId: string, permission: Permission): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    return user.permissions.includes(permission);
  }

  // 역할 변경
  updateRole(userId: string, newRole: Role): void {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const rolePerm = this.rolePermissions.find(rp => rp.role === newRole);
    user.role = newRole;
    user.permissions = rolePerm?.permissions || [];
  }

  // 팀 생성
  createTeam(name: string): Team {
    const team: Team = {
      id: `team-${Date.now()}`,
      name,
      members: [],
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);
    return team;
  }

  // 팀에 사용자 추가
  addUserToTeam(teamId: string, userId: string): void {
    const team = this.teams.get(teamId);
    const user = this.users.get(userId);
    if (!team || !user) throw new Error('Team or User not found');

    if (!team.members.find(m => m.id === userId)) {
      team.members.push(user);
    }
  }

  // 사용자 가져오기
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  // 모든 사용자 가져오기
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // 팀 가져오기
  getTeam(id: string): Team | undefined {
    return this.teams.get(id);
  }

  // 모든 팀 가져오기
  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }
}

export const userManagement = new UserManagement();

