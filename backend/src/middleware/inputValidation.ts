import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import validator from 'validator'

/**
 * 입력 검증 및 Sanitization
 */

// XSS 방지: HTML 태그 제거
export function sanitizeInput(input: string): string {
  return validator.escape(input.trim())
}

// SQL Injection 방지: 특수 문자 검증
export function validateNoSQLInjection(input: string): boolean {
  const dangerousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\/\*|\*\/|;|\||&)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i
  ]

  return !dangerousPatterns.some(pattern => pattern.test(input))
}

// 파일 확장자 검증
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ext ? allowedExtensions.includes(ext) : false
}

// 파일 크기 검증
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize
}

// URL 검증
export function validateURL(url: string): boolean {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  })
}

// 이메일 검증
export function validateEmail(email: string): boolean {
  return validator.isEmail(email)
}

/**
 * 콘텐츠 생성 요청 검증
 */
export function validateContentInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { topic, contentType, text } = req.body

  // 필수 필드 검증
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({
      success: false,
      error: '주제(topic)는 필수이며 문자열이어야 합니다'
    })
  }

  if (!contentType || typeof contentType !== 'string') {
    return res.status(400).json({
      success: false,
      error: '콘텐츠 유형(contentType)은 필수이며 문자열이어야 합니다'
    })
  }

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      error: '콘텐츠 텍스트(text)는 필수이며 문자열이어야 합니다'
    })
  }

  // 길이 제한
  if (topic.length > 200) {
    return res.status(400).json({
      success: false,
      error: '주제는 200자 이하여야 합니다'
    })
  }

  if (text.length > 10000) {
    return res.status(400).json({
      success: false,
      error: '콘텐츠 텍스트는 10,000자 이하여야 합니다'
    })
  }

  // SQL Injection 방지
  if (!validateNoSQLInjection(topic) || !validateNoSQLInjection(text)) {
    logger.warn('의심스러운 입력 감지:', { topic, text: text.substring(0, 50) })
    return res.status(400).json({
      success: false,
      error: '유효하지 않은 입력입니다'
    })
  }

  // XSS 방지: 입력 Sanitization
  req.body.topic = sanitizeInput(topic)
  req.body.text = sanitizeInput(text)

  next()
}

/**
 * 파일 업로드 검증
 */
export function validateFileUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  if (files) {
    const allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    const allowedVideoExtensions = ['mp4', 'webm', 'mov']
    const maxFileSize = 100 * 1024 * 1024 // 100MB

    // 이미지 검증
    if (files.images) {
      for (const file of files.images) {
        if (!validateFileExtension(file.originalname, allowedImageExtensions)) {
          return res.status(400).json({
            success: false,
            error: `허용되지 않은 이미지 형식: ${file.originalname}`
          })
        }

        if (!validateFileSize(file.size, maxFileSize)) {
          return res.status(400).json({
            success: false,
            error: `파일 크기 초과: ${file.originalname} (최대 100MB)`
          })
        }
      }
    }

    // 비디오 검증
    if (files.videos) {
      for (const file of files.videos) {
        if (!validateFileExtension(file.originalname, allowedVideoExtensions)) {
          return res.status(400).json({
            success: false,
            error: `허용되지 않은 비디오 형식: ${file.originalname}`
          })
        }

        if (!validateFileSize(file.size, maxFileSize)) {
          return res.status(400).json({
            success: false,
            error: `파일 크기 초과: ${file.originalname} (최대 100MB)`
          })
        }
      }
    }
  }

  next()
}

