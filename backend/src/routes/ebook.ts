import { Router, Request, Response } from 'express'
import { generateEbook } from '../services/ebook/generator'
import { generatePDF, generateEPUB } from '../services/ebook/formatter'
import { createGumroadProduct } from '../services/sales/gumroad'
import { validateApiKey } from '../middleware/auth'
import { logger } from '../utils/logger'
import { getPrismaClient } from '../utils/database'
import path from 'path'

const router = Router()

/**
 * POST /api/ebook/generate
 * E-book 생성
 */
router.post('/generate', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { topic, contentType, language, chapterCount } = req.body

    if (!topic || !contentType) {
      return res.status(400).json({
        success: false,
        error: 'topic과 contentType은 필수입니다'
      })
    }

    logger.info('E-book 생성 요청:', { topic, contentType, language, chapterCount })

    // E-book 콘텐츠 생성
    const ebookData = await generateEbook(
      topic,
      contentType,
      language || 'ko',
      chapterCount || 10
    )

    // PDF 생성
    const pdfPath = path.join('./uploads/ebooks', `${Date.now()}.pdf`)
    await generatePDF(ebookData, pdfPath)

    // EPUB 생성
    const epubPath = path.join('./uploads/ebooks', `${Date.now()}.epub`)
    await generateEPUB(ebookData, epubPath)

    res.json({
      success: true,
      data: {
        ...ebookData,
        pdfPath,
        epubPath
      }
    })

  } catch (error: any) {
    logger.error('E-book 생성 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'E-book 생성 중 오류가 발생했습니다'
    })
  }
})

/**
 * POST /api/ebook/publish
 * E-book 판매 플랫폼에 게시
 */
router.post('/publish', validateApiKey, async (req: Request, res: Response) => {
  try {
    const { ebookId, platform, price, accessToken } = req.body

    if (!ebookId || !platform || !price) {
      return res.status(400).json({
        success: false,
        error: 'ebookId, platform, price는 필수입니다'
      })
    }

    // 데이터베이스에서 E-book 정보 조회
    const prisma = getPrismaClient()
    const ebook = await prisma.ebook.findUnique({ 
      where: { id: ebookId },
      include: {
        sales: {
          where: { platform }
        }
      }
    })

    if (!ebook) {
      return res.status(404).json({
        success: false,
        error: 'E-book을 찾을 수 없습니다'
      })
    }

    // 이미 해당 플랫폼에 게시된 경우
    const existingSale = ebook.sales.find(s => s.platform === platform && s.status === 'active')
    if (existingSale) {
      return res.status(400).json({
        success: false,
        error: '이미 해당 플랫폼에 게시된 E-book입니다'
      })
    }

    logger.info('E-book 판매 게시:', { ebookId, platform, price, title: ebook.title })

    let result: any

    switch (platform) {
      case 'gumroad':
        if (!accessToken) {
          return res.status(400).json({
            success: false,
            error: 'Gumroad accessToken이 필요합니다'
          })
        }
        
        // 실제 파일 경로 확인
        const filePath = ebook.pdfPath || ebook.epubPath
        if (!filePath || !fs.existsSync(filePath)) {
          return res.status(400).json({
            success: false,
            error: 'E-book 파일을 찾을 수 없습니다. 먼저 E-book을 생성해주세요.'
          })
        }

        result = await createGumroadProduct({
          name: ebook.title,
          description: ebook.description,
          price: parseFloat(price),
          file: filePath,
        }, accessToken)
        
        // 판매 기록 저장
        await prisma.ebookSale.create({
          data: {
            ebookId: ebook.id,
            platform: 'gumroad',
            productId: result.productId,
            url: result.url,
            price: parseFloat(price),
            status: 'active'
          }
        })
        break

      default:
        return res.status(400).json({
          success: false,
          error: `지원하지 않는 플랫폼: ${platform}`
        })
    }

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    logger.error('E-book 판매 게시 실패:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'E-book 판매 게시 중 오류가 발생했습니다'
    })
  }
})

export default router

