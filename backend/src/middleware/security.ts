import { Request, Response, NextFunction } from 'express'
import { IntrusionDetectionSystem } from '../services/security/intrusionDetection'
import { logger } from '../utils/logger'

const ids = new IntrusionDetectionSystem()

/**
 * 침입 탐지 미들웨어
 */
export async function intrusionDetection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const analysis = await ids.analyzeRequest(req)

    if (analysis.isSuspicious) {
      logger.warn('의심스러운 요청 감지:', {
        ip: req.ip,
        path: req.path,
        threatLevel: analysis.threatLevel,
        details: analysis.details
      })

      // Critical 위협은 즉시 차단
      if (analysis.threatLevel === 'critical') {
        return res.status(403).json({
          success: false,
          error: '보안 위협이 감지되어 요청이 차단되었습니다'
        })
      }

      // High 위협은 경고
      if (analysis.threatLevel === 'high') {
        // 추가 검증 필요
        logger.warn('High 위협 감지, 추가 검증 필요')
      }
    }

    next()
  } catch (error) {
    logger.error('침입 탐지 실패:', error)
    // 오류 발생 시에도 요청은 통과 (보안보다 가용성 우선)
    next()
  }
}

/**
 * 요청 로그 기록
 */
export async function logRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { getPrismaClient } = await import('../utils/database')
    const prisma = getPrismaClient()
    
    await prisma.requestLog.create({
      data: {
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        method: req.method,
        path: req.path,
        userAgent: req.get('user-agent') || '',
        timestamp: new Date()
      }
    })
  } catch (error) {
    // 로그 실패는 무시
  }

  next()
}

