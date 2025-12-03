/**
 * 권한 관리 시스템
 * 사용자 역할 및 권한 확인
 */

import { getPrismaClient } from './database'
import { logger } from './logger'

export type UserRole = 'user' | 'admin' | 'moderator'

export interface Permission {
  resource: string
  action: string
}

/**
 * 역할별 권한 정의
 */
const rolePermissions: Record<UserRole, Permission[]> = {
  user: [
    { resource: 'content', action: 'create' },
    { resource: 'content', action: 'read' },
    { resource: 'content', action: 'update' },
    { resource: 'content', action: 'delete' },
    { resource: 'ai-chat', action: 'use' },
    { resource: 'schedule', action: 'create' },
    { resource: 'schedule', action: 'read' },
    { resource: 'schedule', action: 'update' },
    { resource: 'schedule', action: 'delete' }
  ],
  moderator: [
    { resource: 'content', action: 'create' },
    { resource: 'content', action: 'read' },
    { resource: 'content', action: 'update' },
    { resource: 'content', action: 'delete' },
    { resource: 'ai-chat', action: 'use' },
    { resource: 'schedule', action: 'create' },
    { resource: 'schedule', action: 'read' },
    { resource: 'schedule', action: 'update' },
    { resource: 'schedule', action: 'delete' },
    { resource: 'user', action: 'read' },
    { resource: 'content', action: 'moderate' }
  ],
  admin: [
    { resource: '*', action: '*' } // 모든 권한
  ]
}

/**
 * 권한 확인 클래스
 */
export class PermissionChecker {
  private prisma = getPrismaClient()

  /**
   * 사용자 역할 조회
   */
  async getUserRole(userId: string): Promise<UserRole> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, isActive: true }
      })

      if (!user || !user.isActive) {
        return 'user' // 기본 역할
      }

      return (user.role as UserRole) || 'user'
    } catch (error: any) {
      logger.error('사용자 역할 조회 실패', error)
      return 'user' // 기본 역할
    }
  }

  /**
   * 권한 확인
   */
  async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId)
      const permissions = rolePermissions[role] || []

      // Admin은 모든 권한
      if (role === 'admin') {
        return true
      }

      // 권한 확인
      return permissions.some(
        perm =>
          (perm.resource === resource || perm.resource === '*') &&
          (perm.action === action || perm.action === '*')
      )
    } catch (error: any) {
      logger.error('권한 확인 실패', error)
      return false // 안전하게 거부
    }
  }

  /**
   * 관리자 권한 확인
   */
  async isAdmin(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role === 'admin'
  }

  /**
   * 관리자 또는 모더레이터 권한 확인
   */
  async isAdminOrModerator(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId)
    return role === 'admin' || role === 'moderator'
  }

  /**
   * 사용자 역할 업데이트
   */
  async updateUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      // 자신의 역할은 변경할 수 없음 (관리자도)
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!currentUser) {
        throw new Error('사용자를 찾을 수 없습니다')
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { role }
      })

      return true
    } catch (error: any) {
      logger.error('사용자 역할 업데이트 실패', error)
      throw error
    }
  }

  /**
   * 사용자 활성화/비활성화
   */
  async setUserActive(userId: string, isActive: boolean): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { isActive }
      })

      return true
    } catch (error: any) {
      logger.error('사용자 활성화 상태 변경 실패', error)
      throw error
    }
  }
}

export const permissionChecker = new PermissionChecker()

/**
 * 권한 확인 미들웨어
 */
export function requirePermission(resource: string, action: string) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: '인증이 필요합니다'
        })
      }

      const hasPermission = await permissionChecker.hasPermission(userId, resource, action)

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: '이 작업을 수행할 권한이 없습니다',
          code: 'PERMISSION_DENIED'
        })
      }

      next()
    } catch (error: any) {
      logger.error('권한 확인 미들웨어 실패', error)
      res.status(500).json({
        success: false,
        error: '권한 확인 중 오류가 발생했습니다'
      })
    }
  }
}

/**
 * 관리자 권한 확인 미들웨어
 */
export function requireAdmin(req: any, res: any, next: any) {
  return requirePermission('*', '*')(req, res, next)
}

