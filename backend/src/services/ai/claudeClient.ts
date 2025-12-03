/**
 * Claude (Anthropic) 클라이언트 (재사용 가능)
 */

import Anthropic from '@anthropic-ai/sdk'
import { logger } from '../../utils/logger'

export const anthropic = process.env.CLAUDE_API_KEY ? new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
}) : null

if (anthropic) {
  logger.info('✅ Claude 클라이언트 초기화 완료')
} else {
  logger.warn('⚠️ Claude API 키가 설정되지 않았습니다')
}

