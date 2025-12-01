import { Router, Request, Response } from 'express'
import { templateManager } from '../services/templates/templateManager'
import { logger } from '../utils/logger'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = Router()

/**
 * GET /api/templates
 * 템플릿 목록 조회
 */
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id
    const { category, isPublic } = req.query

    const templates = await templateManager.listTemplates(
      userId || undefined,
      category as string | undefined,
      isPublic === 'true'
    )

    res.json({
      success: true,
      templates
    })
  } catch (error: any) {
    logger.error('템플릿 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/templates
 * 템플릿 저장
 */
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id!
    const { name, description, category, contentType, settings, thumbnail } = req.body

    const templateId = await templateManager.saveTemplate(
      userId,
      {
        name,
        description,
        category,
        contentType,
        settings
      },
      thumbnail
    )

    res.json({
      success: true,
      templateId
    })
  } catch (error: any) {
    logger.error('템플릿 저장 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/templates/:id
 * 템플릿 조회
 */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const template = await templateManager.getTemplate(id)

    res.json({
      success: true,
      template
    })
  } catch (error: any) {
    logger.error('템플릿 조회 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/templates/:id/use
 * 템플릿으로 콘텐츠 생성
 */
router.post('/:id/use', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const overrides = req.body

    const contentForm = await templateManager.generateFromTemplate(id, overrides)

    res.json({
      success: true,
      contentForm
    })
  } catch (error: any) {
    logger.error('템플릿 사용 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/templates/:id
 * 템플릿 삭제
 */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user?.id

    await templateManager.deleteTemplate(id, userId)

    res.json({
      success: true,
      message: '템플릿이 삭제되었습니다'
    })
  } catch (error: any) {
    logger.error('템플릿 삭제 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/templates/:id/favorite
 * 템플릿 즐겨찾기 토글
 */
router.post('/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const isFavorite = await templateManager.toggleFavorite(id)

    res.json({
      success: true,
      isFavorite
    })
  } catch (error: any) {
    logger.error('즐겨찾기 토글 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router

