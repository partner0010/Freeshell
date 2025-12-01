import axios from 'axios'
import { logger } from '../../utils/logger'

const GUMROAD_API_BASE = 'https://api.gumroad.com/v2'

interface GumroadProduct {
  name: string
  description: string
  price: number
  file?: string // 파일 경로
  thumbnail?: string // 썸네일 경로
  tags?: string[]
}

/**
 * Gumroad에 제품 생성 및 판매
 */
export async function createGumroadProduct(
  product: GumroadProduct,
  accessToken: string
): Promise<{ success: boolean; productId?: string; url?: string }> {
  try {
    const formData = new FormData()
    formData.append('name', product.name)
    formData.append('description', product.description)
    formData.append('price', product.price.toString())
    
    if (product.file) {
      const fileBuffer = await fs.readFile(product.file)
      formData.append('file', new Blob([fileBuffer]), path.basename(product.file))
    }

    if (product.thumbnail) {
      const thumbBuffer = await fs.readFile(product.thumbnail)
      formData.append('custom_thumbnail', new Blob([thumbBuffer]), path.basename(product.thumbnail))
    }

    if (product.tags) {
      formData.append('tags', product.tags.join(','))
    }

    const response = await axios.post(
      `${GUMROAD_API_BASE}/products`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    if (response.data.success) {
      logger.info('Gumroad 제품 생성 성공:', response.data.product.id)
      return {
        success: true,
        productId: response.data.product.id,
        url: response.data.product.url
      }
    }

    throw new Error(response.data.message || 'Gumroad 제품 생성 실패')

  } catch (error: any) {
    logger.error('Gumroad 제품 생성 실패:', error)
    throw error
  }
}

/**
 * Gumroad 판매 통계 조회
 */
export async function getGumroadSales(
  accessToken: string,
  productId?: string
): Promise<any> {
  try {
    const url = productId
      ? `${GUMROAD_API_BASE}/products/${productId}/sales`
      : `${GUMROAD_API_BASE}/sales`

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return response.data
  } catch (error: any) {
    logger.error('Gumroad 판매 통계 조회 실패:', error)
    throw error
  }
}

import path from 'path'
import fs from 'fs/promises'

