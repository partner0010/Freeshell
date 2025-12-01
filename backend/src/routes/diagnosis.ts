import { Router, Request, Response } from 'express'
import { diagnoseSystem, autoFixAll } from '../services/selfDiagnosis'
import { analyzeError, attemptAutoRecovery, saveErrorLog } from '../services/errorRecovery'
import { logger } from '../utils/logger'

const router = Router()

/**
 * GET /api/diagnosis
 * 시스템 자가 진단
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const health = await diagnoseSystem()
    
    res.json({
      success: true,
      health
    })
  } catch (error: any) {
    logger.error('진단 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/diagnosis/fix
 * 자동 복구 시도
 */
router.post('/fix', async (req: Request, res: Response) => {
  try {
    const result = await autoFixAll()
    
    res.json({
      success: true,
      message: `자동 복구 완료: ${result.fixed}개 성공, ${result.failed}개 실패`,
      result
    })
  } catch (error: any) {
    logger.error('자동 복구 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/diagnosis/analyze-error
 * 에러 분석
 */
router.post('/analyze-error', async (req: Request, res: Response) => {
  try {
    const { error, context } = req.body
    
    if (!error || !error.message) {
      return res.status(400).json({
        success: false,
        error: '에러 정보가 필요합니다'
      })
    }
    
    const errorObj = new Error(error.message)
    if (error.stack) {
      errorObj.stack = error.stack
    }
    
    const analysis = await analyzeError(errorObj, context)
    
    // 에러 로그 저장
    await saveErrorLog({
      type: error.type || 'Error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context
    })
    
    res.json({
      success: true,
      analysis
    })
  } catch (error: any) {
    logger.error('에러 분석 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/diagnosis/recover
 * 에러 자동 복구 시도
 */
router.post('/recover', async (req: Request, res: Response) => {
  try {
    const { error, context } = req.body
    
    if (!error || !error.message) {
      return res.status(400).json({
        success: false,
        error: '에러 정보가 필요합니다'
      })
    }
    
    const errorObj = new Error(error.message)
    if (error.stack) {
      errorObj.stack = error.stack
    }
    
    const recovered = await attemptAutoRecovery(errorObj, context)
    
    res.json({
      success: true,
      recovered,
      message: recovered 
        ? '자동 복구가 완료되었습니다' 
        : '자동 복구가 불가능합니다. 수동으로 해결해주세요'
    })
  } catch (error: any) {
    logger.error('복구 시도 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

