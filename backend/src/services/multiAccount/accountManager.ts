import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { encrypt, decrypt } from '../../utils/encryption'

export interface AccountData {
  accountName: string
  platform: string
  channelId?: string
  accountId?: string
  credentials: any
}

/**
 * 다중 계정 관리자
 */
export class MultiAccountManager {
  /**
   * 계정 추가
   */
  async addAccount(userId: string | null, accountData: AccountData): Promise<string> {
    const prisma = getPrismaClient()

    // 인증 정보 암호화
    const encryptedCredentials = encrypt(JSON.stringify(accountData.credentials))

    const account = await prisma.multiAccount.create({
      data: {
        userId,
        accountName: accountData.accountName,
        platform: accountData.platform,
        channelId: accountData.channelId,
        accountId: accountData.accountId,
        credentials: encryptedCredentials
      }
    })

    logger.info(`계정 추가됨: ${account.accountName} (${account.platform})`)
    return account.id
  }

  /**
   * 계정 목록 조회
   */
  async listAccounts(userId?: string, platform?: string) {
    const prisma = getPrismaClient()

    const where: any = {}
    if (userId) {
      where.userId = userId
    }
    if (platform) {
      where.platform = platform
    }

    const accounts = await prisma.multiAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return accounts.map(account => ({
      id: account.id,
      accountName: account.accountName,
      platform: account.platform,
      channelId: account.channelId,
      accountId: account.accountId,
      isActive: account.isActive,
      createdAt: account.createdAt
      // credentials는 보안상 반환하지 않음
    }))
  }

  /**
   * 계정 인증 정보 조회 (복호화)
   */
  async getAccountCredentials(accountId: string, userId?: string): Promise<any> {
    const prisma = getPrismaClient()

    const where: any = { id: accountId }
    if (userId) {
      where.userId = userId
    }

    const account = await prisma.multiAccount.findFirst({
      where
    })

    if (!account) {
      throw new Error('계정을 찾을 수 없습니다')
    }

    if (!account.credentials) {
      return null
    }

    try {
      const decrypted = decrypt(account.credentials)
      return JSON.parse(decrypted)
    } catch (error) {
      logger.error('인증 정보 복호화 실패:', error)
      throw new Error('인증 정보를 복호화할 수 없습니다')
    }
  }

  /**
   * 계정 활성화/비활성화
   */
  async toggleAccount(accountId: string, isActive: boolean): Promise<void> {
    const prisma = getPrismaClient()

    await prisma.multiAccount.update({
      where: { id: accountId },
      data: { isActive }
    })

    logger.info(`계정 상태 변경: ${accountId} -> ${isActive ? '활성' : '비활성'}`)
  }

  /**
   * 계정 삭제
   */
  async deleteAccount(accountId: string, userId?: string): Promise<void> {
    const prisma = getPrismaClient()

    const where: any = { id: accountId }
    if (userId) {
      where.userId = userId
    }

    const account = await prisma.multiAccount.findFirst({ where })
    if (!account) {
      throw new Error('계정을 찾을 수 없습니다')
    }

    await prisma.multiAccount.delete({
      where: { id: accountId }
    })

    logger.info(`계정 삭제됨: ${accountId}`)
  }

  /**
   * 플랫폼별 활성 계정 조회
   */
  async getActiveAccountsByPlatform(platform: string, userId?: string) {
    const prisma = getPrismaClient()

    const where: any = {
      platform,
      isActive: true
    }
    if (userId) {
      where.userId = userId
    }

    return await prisma.multiAccount.findMany({
      where,
      orderBy: { accountName: 'asc' }
    })
  }

  /**
   * 일괄 작업 (여러 계정에 동시 업로드)
   */
  async batchUpload(contentId: string, accountIds: string[]): Promise<{
    success: number
    failed: number
    results: Array<{ accountId: string; success: boolean; error?: string }>
  }> {
    const results: Array<{ accountId: string; success: boolean; error?: string }> = []
    let success = 0
    let failed = 0

    for (const accountId of accountIds) {
      try {
        const account = await this.getAccountCredentials(accountId)
        // 실제 업로드 로직 호출
        const { uploadToPlatforms } = await import('../uploadService')
        if (contentId && account.platform) {
          await uploadToPlatforms(contentId, [{
            platform: account.platform,
            credentials: {
              email: account.credentials?.email,
              username: account.credentials?.username,
              apiKey: account.credentials?.apiKey
            },
            autoUpload: true
          }])
        }
        results.push({ accountId, success: true })
        success++
      } catch (error: any) {
        results.push({ accountId, success: false, error: error.message })
        failed++
      }
    }

    return { success, failed, results }
  }
}

export const accountManager = new MultiAccountManager()

