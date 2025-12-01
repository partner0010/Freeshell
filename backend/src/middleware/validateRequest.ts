import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

/**
 * 콘텐츠 생성 요청 검증
 */
export function validateContentRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { topic, contentType, text } = req.body

  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '주제(topic)는 필수입니다'
    })
  }

  if (!contentType || typeof contentType !== 'string') {
    return res.status(400).json({
      success: false,
      error: '콘텐츠 유형(contentType)은 필수입니다'
    })
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: '콘텐츠 텍스트(text)는 필수입니다'
    })
  }

  next()
}

