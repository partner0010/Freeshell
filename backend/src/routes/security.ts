import { Router, Request, Response } from 'express'
import { VulnerabilityScanner } from '../services/security/vulnerabilityScanner'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'

const router = Router()
const scanner = new VulnerabilityScanner()

/**
 * GET /api/security/vulnerabilities
 * 취약점 스캔 결과 조회
 */
router.get('/vulnerabilities', validateApiKey, async (req: Request, res: Response) => {
  try {
    const scanResult = await scanner.scanAll()

    res.json({
      success: true,
      data: scanResult
    })
  } catch (error: any) {
    logger.error('취약점 스캔 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '취약점 스캔 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/security/vulnerabilities/patch
 * 자동 패치 실행
 */
router.post('/vulnerabilities/patch', validateApiKey, async (req: Request, res: Response) => {
  try {
    const result = await scanner.autoPatch()

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    logger.error('자동 패치 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || '자동 패치 중 오류가 발생했습니다'
    })
  }
})

/**
 * GET /api/security/threats
 * 보안 위협 로그 조회
 */
router.get('/threats', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { limit = 100, threatLevel } = req.query

    const prisma = getPrismaClient()
    const where: any = {}
    if (threatLevel) {
      where.threatLevel = threatLevel
    }

    const threats = await prisma.securityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string)
    })

    res.json({
      success: true,
      data: threats
    })
  } catch (error: any) {
    logger.error('위협 로그 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/security/blocked
 * 차단된 IP 목록 조회
 */
router.get('/blocked', validateApiKey, async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaClient()
    const blockedIPs = await prisma.blockedIP.findMany({
      orderBy: { blockedAt: 'desc' }
    })

    res.json({
      success: true,
      data: blockedIPs
    })
  } catch (error: any) {
    logger.error('차단 IP 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

