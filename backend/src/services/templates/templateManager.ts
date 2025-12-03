import { getPrismaClient } from '../../utils/database'
import { logger } from '../../utils/logger'
import { ContentType } from '../../types'

export interface TemplateData {
  name: string
  description?: string
  category: string
  contentType: string
  settings: {
    topic?: string
    contentTime?: number
    contentFormat?: string[]
    defaultText?: string
    platforms?: string[]
    [key: string]: any
  }
}

/**
 * 템플릿 관리자
 */
export class TemplateManager {
  /**
   * 템플릿 저장
   */
  async saveTemplate(
    userId: string | null,
    templateData: TemplateData,
    thumbnail?: string
  ): Promise<string> {
    const prisma = getPrismaClient()

    const template = await prisma.contentTemplate.create({
      data: {
        userId,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        contentType: templateData.contentType,
        settings: JSON.stringify(templateData.settings),
        thumbnail
      }
    })

    logger.info(`템플릿 저장됨: ${template.name} (${template.id})`)
    return template.id
  }

  /**
   * 템플릿 조회
   */
  async getTemplate(templateId: string) {
    const prisma = getPrismaClient()

    const template = await prisma.contentTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다')
    }

    // 사용 횟수 증가
    await prisma.contentTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } }
    })

    return {
      ...template,
      settings: JSON.parse(template.settings)
    }
  }

  /**
   * 템플릿 목록 조회
   */
  async listTemplates(userId?: string, category?: string, isPublic?: boolean) {
    const prisma = getPrismaClient()

    const where: any = {}
    if (userId) {
      where.userId = userId
    }
    if (category) {
      where.category = category
    }
    if (isPublic !== undefined) {
      where.isPublic = isPublic
    }

    const templates = await prisma.contentTemplate.findMany({
      where,
      orderBy: [
        { isFavorite: 'desc' },
        { usageCount: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return templates.map(t => ({
      ...t,
      settings: JSON.parse(t.settings)
    }))
  }

  /**
   * 템플릿으로 콘텐츠 생성
   */
  async generateFromTemplate(templateId: string, overrides?: Partial<{ topic: string; contentType: ContentType; contentTime: number; text: string }>): Promise<{ topic: string; contentType: ContentType; contentTime: number; text: string }> {
    const template = await this.getTemplate(templateId)
    const settings = template.settings

    const contentForm = {
      topic: overrides?.topic || settings.topic || '템플릿 기반 주제',
      contentType: overrides?.contentType || (template.contentType as any),
      contentTime: overrides?.contentTime || settings.contentTime || 60,
      text: overrides?.text || settings.defaultText || ''
    }

    return contentForm
  }

  /**
   * 템플릿 삭제
   */
  async deleteTemplate(templateId: string, userId?: string): Promise<void> {
    const prisma = getPrismaClient()

    const template = await prisma.contentTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다')
    }

    if (userId && template.userId !== userId) {
      throw new Error('템플릿을 삭제할 권한이 없습니다')
    }

    await prisma.contentTemplate.delete({
      where: { id: templateId }
    })

    logger.info(`템플릿 삭제됨: ${templateId}`)
  }

  /**
   * 템플릿 즐겨찾기 토글
   */
  async toggleFavorite(templateId: string): Promise<boolean> {
    const prisma = getPrismaClient()

    const template = await prisma.contentTemplate.findUnique({
      where: { id: templateId }
    })

    if (!template) {
      throw new Error('템플릿을 찾을 수 없습니다')
    }

    const updated = await prisma.contentTemplate.update({
      where: { id: templateId },
      data: { isFavorite: !template.isFavorite }
    })

    return updated.isFavorite
  }

  /**
   * 인기 템플릿 조회
   */
  async getPopularTemplates(limit: number = 10) {
    const prisma = getPrismaClient()

    const templates = await prisma.contentTemplate.findMany({
      where: { isPublic: true },
      orderBy: { usageCount: 'desc' },
      take: limit
    })

    return templates.map(t => ({
      ...t,
      settings: JSON.parse(t.settings)
    }))
  }
}

export const templateManager = new TemplateManager()

