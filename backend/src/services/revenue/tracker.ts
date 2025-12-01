import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { getGumroadSales } from '../sales/gumroad'

export interface RevenueData {
  date: string
  platform: string
  amount: number
  currency: string
  productId?: string
  productName?: string
}

/**
 * 수익 추적 및 집계
 */
export async function trackRevenue(
  platform: string,
  amount: number,
  productId?: string,
  productName?: string
): Promise<void> {
  try {
    const prisma = getPrismaClient()
    
    // 데이터베이스에 수익 기록
    await prisma.revenue.create({
      data: {
        platform,
        amount,
        currency: 'USD',
        productId,
        productName,
        date: new Date()
      }
    })

    logger.info('수익 기록 완료:', { platform, amount, productId })
  } catch (error) {
    logger.error('수익 기록 실패:', error)
    throw error
  }
}

/**
 * 플랫폼별 수익 조회
 */
export async function getRevenueByPlatform(
  platform: string,
  startDate?: Date,
  endDate?: Date
): Promise<RevenueData[]> {
  try {
    const prisma = getPrismaClient()
    const where: any = { platform }
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const revenues = await prisma.revenue.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return revenues.map(r => ({
      date: r.date.toISOString(),
      platform: r.platform,
      amount: r.amount,
      currency: r.currency,
      productId: r.productId || undefined,
      productName: r.productName || undefined
    }))
  } catch (error) {
    logger.error('수익 조회 실패:', error)
    throw error
  }
}

/**
 * 총 수익 조회
 */
export async function getTotalRevenue(
  startDate?: Date,
  endDate?: Date
): Promise<{ total: number; byPlatform: Record<string, number> }> {
  try {
    const prisma = getPrismaClient()
    const where: any = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    const revenues = await prisma.revenue.findMany({ where })

    const total = revenues.reduce((sum, r) => sum + r.amount, 0)
    const byPlatform: Record<string, number> = {}

    revenues.forEach(r => {
      byPlatform[r.platform] = (byPlatform[r.platform] || 0) + r.amount
    })

    return { total, byPlatform }
  } catch (error) {
    logger.error('총 수익 조회 실패:', error)
    throw error
  }
}

/**
 * 외부 플랫폼에서 수익 동기화
 */
export async function syncRevenueFromPlatform(
  platform: string,
  accessToken: string
): Promise<void> {
  try {
    const prisma = getPrismaClient()
    
    switch (platform) {
      case 'gumroad':
        const sales = await getGumroadSales(accessToken)
        // 판매 데이터를 수익으로 기록
        for (const sale of sales.sales || []) {
          await trackRevenue(
            'gumroad',
            parseFloat(sale.price),
            sale.product_id,
            sale.product_name
          )
        }
        break

      default:
        logger.warn(`지원하지 않는 플랫폼: ${platform}`)
    }
  } catch (error) {
    logger.error('수익 동기화 실패:', error)
    throw error
  }
}

