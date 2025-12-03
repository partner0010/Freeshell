/**
 * AI API 사용량 제한 서비스
 * 사용자별 일일/월간 호출 제한 관리
 */

import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'

export interface UsageLimit {
  dailyLimit: number
  monthlyLimit: number
  dailyUsed: number
  monthlyUsed: number
  canUse: boolean
  remainingDaily: number
  remainingMonthly: number
}

export class UsageLimiter {
  private prisma = getPrismaClient()

  /**
   * 사용량 제한 확인 및 증가
   */
  async checkAndIncrement(userId: string): Promise<UsageLimit> {
    try {
      // 사용자 제한 설정 조회 또는 생성
      let usageLimit = await this.prisma.aIUsageLimit.findUnique({
        where: { userId }
      })

      if (!usageLimit) {
        // 기본 제한 설정으로 생성
        usageLimit = await this.prisma.aIUsageLimit.create({
          data: {
            userId,
            dailyLimit: 100,
            monthlyLimit: 3000,
            dailyUsed: 0,
            monthlyUsed: 0,
            lastResetDate: new Date()
          }
        })
      }

      // 날짜 리셋 확인 (일일 제한)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastReset = new Date(usageLimit.lastResetDate)
      lastReset.setHours(0, 0, 0, 0)

      if (today.getTime() > lastReset.getTime()) {
        // 하루가 지났으면 일일 사용량 리셋
        usageLimit = await this.prisma.aIUsageLimit.update({
          where: { userId },
          data: {
            dailyUsed: 0,
            lastResetDate: today
          }
        })
      }

      // 월간 제한 리셋 확인
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const lastResetMonth = lastReset.getMonth()
      const lastResetYear = lastReset.getFullYear()

      if (currentYear > lastResetYear || (currentYear === lastResetYear && currentMonth > lastResetMonth)) {
        // 한 달이 지났으면 월간 사용량 리셋
        usageLimit = await this.prisma.aIUsageLimit.update({
          where: { userId },
          data: {
            monthlyUsed: 0,
            lastResetDate: today
          }
        })
      }

      // 사용량 증가
      const updated = await this.prisma.aIUsageLimit.update({
        where: { userId },
        data: {
          dailyUsed: { increment: 1 },
          monthlyUsed: { increment: 1 }
        }
      })

      // 제한 확인
      const canUse = updated.dailyUsed <= updated.dailyLimit && updated.monthlyUsed <= updated.monthlyLimit

      return {
        dailyLimit: updated.dailyLimit,
        monthlyLimit: updated.monthlyLimit,
        dailyUsed: updated.dailyUsed,
        monthlyUsed: updated.monthlyUsed,
        canUse,
        remainingDaily: Math.max(0, updated.dailyLimit - updated.dailyUsed),
        remainingMonthly: Math.max(0, updated.monthlyLimit - updated.monthlyUsed)
      }
    } catch (error: any) {
      logger.error('사용량 제한 확인 실패:', error)
      // 에러 발생 시 제한 없이 허용 (안전 모드)
      return {
        dailyLimit: 1000,
        monthlyLimit: 30000,
        dailyUsed: 0,
        monthlyUsed: 0,
        canUse: true,
        remainingDaily: 1000,
        remainingMonthly: 30000
      }
    }
  }

  /**
   * 사용량 제한 확인 (증가 없이)
   */
  async checkLimit(userId: string): Promise<UsageLimit> {
    try {
      let usageLimit = await this.prisma.aIUsageLimit.findUnique({
        where: { userId }
      })

      if (!usageLimit) {
        return {
          dailyLimit: 100,
          monthlyLimit: 3000,
          dailyUsed: 0,
          monthlyUsed: 0,
          canUse: true,
          remainingDaily: 100,
          remainingMonthly: 3000
        }
      }

      // 날짜 리셋 확인
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const lastReset = new Date(usageLimit.lastResetDate)
      lastReset.setHours(0, 0, 0, 0)

      let dailyUsed = usageLimit.dailyUsed
      let monthlyUsed = usageLimit.monthlyUsed

      if (today.getTime() > lastReset.getTime()) {
        dailyUsed = 0
      }

      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      const lastResetMonth = lastReset.getMonth()
      const lastResetYear = lastReset.getFullYear()

      if (currentYear > lastResetYear || (currentYear === lastResetYear && currentMonth > lastResetMonth)) {
        monthlyUsed = 0
      }

      const canUse = dailyUsed < usageLimit.dailyLimit && monthlyUsed < usageLimit.monthlyLimit

      return {
        dailyLimit: usageLimit.dailyLimit,
        monthlyLimit: usageLimit.monthlyLimit,
        dailyUsed,
        monthlyUsed,
        canUse,
        remainingDaily: Math.max(0, usageLimit.dailyLimit - dailyUsed),
        remainingMonthly: Math.max(0, usageLimit.monthlyLimit - monthlyUsed)
      }
    } catch (error: any) {
      logger.error('사용량 제한 확인 실패:', error)
      return {
        dailyLimit: 1000,
        monthlyLimit: 30000,
        dailyUsed: 0,
        monthlyUsed: 0,
        canUse: true,
        remainingDaily: 1000,
        remainingMonthly: 30000
      }
    }
  }

  /**
   * 사용자 제한 설정 업데이트
   */
  async updateLimit(
    userId: string,
    dailyLimit?: number,
    monthlyLimit?: number
  ): Promise<UsageLimit> {
    try {
      const updateData: any = {}
      if (dailyLimit !== undefined) updateData.dailyLimit = dailyLimit
      if (monthlyLimit !== undefined) updateData.monthlyLimit = monthlyLimit

      const updated = await this.prisma.aIUsageLimit.upsert({
        where: { userId },
        update: updateData,
        create: {
          userId,
          dailyLimit: dailyLimit || 100,
          monthlyLimit: monthlyLimit || 3000,
          dailyUsed: 0,
          monthlyUsed: 0,
          lastResetDate: new Date()
        }
      })

      return {
        dailyLimit: updated.dailyLimit,
        monthlyLimit: updated.monthlyLimit,
        dailyUsed: updated.dailyUsed,
        monthlyUsed: updated.monthlyUsed,
        canUse: true,
        remainingDaily: Math.max(0, updated.dailyLimit - updated.dailyUsed),
        remainingMonthly: Math.max(0, updated.monthlyLimit - updated.monthlyUsed)
      }
    } catch (error: any) {
      logger.error('사용량 제한 설정 업데이트 실패:', error)
      throw error
    }
  }

  /**
   * 사용량 리셋 (관리자용)
   */
  async resetUsage(userId: string, resetDaily: boolean = true, resetMonthly: boolean = false): Promise<void> {
    try {
      const updateData: any = {}
      if (resetDaily) updateData.dailyUsed = 0
      if (resetMonthly) updateData.monthlyUsed = 0
      if (resetDaily || resetMonthly) updateData.lastResetDate = new Date()

      await this.prisma.aIUsageLimit.update({
        where: { userId },
        data: updateData
      })
    } catch (error: any) {
      logger.error('사용량 리셋 실패:', error)
      throw error
    }
  }
}

export const usageLimiter = new UsageLimiter()

