/**
 * OpenAI 클라이언트 (재사용 가능)
 */

import OpenAI from 'openai'
import { logger } from '../../utils/logger'

export const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

if (openai) {
  logger.info('✅ OpenAI 클라이언트 초기화 완료')
} else {
  logger.warn('⚠️ OpenAI API 키가 설정되지 않았습니다')
}

