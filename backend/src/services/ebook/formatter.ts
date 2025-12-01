import fs from 'fs/promises'
import path from 'path'
import { EbookData } from './generator'
import { logger } from '../../utils/logger'

/**
 * E-book을 PDF로 변환
 */
export async function generatePDF(ebookData: EbookData, outputPath: string): Promise<string> {
  logger.info('PDF 생성 시작:', outputPath)

  // HTML 생성
  const html = generateHTML(ebookData)
  const htmlPath = outputPath.replace('.pdf', '.html')
  
  await fs.writeFile(htmlPath, html, 'utf-8')

  // PDF 변환 (Puppeteer 또는 다른 라이브러리 필요)
  // 여기서는 기본 구조만 제공
  logger.warn('PDF 변환은 Puppeteer 또는 wkhtmltopdf가 필요합니다')
  
  return htmlPath // 임시로 HTML 경로 반환
}

/**
 * E-book을 EPUB로 변환
 */
export async function generateEPUB(ebookData: EbookData, outputPath: string): Promise<string> {
  logger.info('EPUB 생성 시작:', outputPath)

  // EPUB 구조 생성
  const epubDir = outputPath.replace('.epub', '_epub')
  await fs.mkdir(epubDir, { recursive: true })

  // META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`

  await fs.writeFile(path.join(epubDir, 'META-INF', 'container.xml'), containerXml, 'utf-8')

  // content.opf 생성
  const opf = generateOPF(ebookData)
  await fs.writeFile(path.join(epubDir, 'OEBPS', 'content.opf'), opf, 'utf-8')

  // 각 챕터 HTML 생성
  for (const chapter of ebookData.chapters) {
    const chapterHtml = generateChapterHTML(chapter)
    await fs.writeFile(
      path.join(epubDir, 'OEBPS', `chapter${chapter.order}.html`),
      chapterHtml,
      'utf-8'
    )
  }

  // ZIP으로 압축 (EPUB는 ZIP 형식)
  // 실제로는 archiver 라이브러리 사용 필요
  logger.warn('EPUB 압축은 archiver 라이브러리가 필요합니다')

  return epubDir
}

/**
 * HTML 생성
 */
function generateHTML(ebookData: EbookData): string {
  const chaptersHtml = ebookData.chapters.map(chapter => `
    <div class="chapter">
      <h1>${chapter.title}</h1>
      <div class="content">${chapter.content.replace(/\n/g, '<br>')}</div>
    </div>
  `).join('\n')

  return `<!DOCTYPE html>
<html lang="${ebookData.language}">
<head>
  <meta charset="UTF-8">
  <title>${ebookData.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .chapter { margin-bottom: 40px; page-break-after: always; }
    .content { line-height: 1.6; }
  </style>
</head>
<body>
  <h1>${ebookData.title}</h1>
  <p><strong>작가:</strong> ${ebookData.author}</p>
  <p>${ebookData.description}</p>
  ${chaptersHtml}
</body>
</html>`
}

/**
 * EPUB OPF 파일 생성
 */
function generateOPF(ebookData: EbookData): string {
  const manifest = ebookData.chapters.map((_, i) => 
    `    <item id="chapter${i + 1}" href="chapter${i + 1}.html" media-type="application/xhtml+xml"/>`
  ).join('\n')

  const spine = ebookData.chapters.map((_, i) => 
    `    <itemref idref="chapter${i + 1}"/>`
  ).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${ebookData.title}</dc:title>
    <dc:creator>${ebookData.author}</dc:creator>
    <dc:description>${ebookData.description}</dc:description>
    <dc:language>${ebookData.language}</dc:language>
    <dc:identifier id="book-id">urn:uuid:${Date.now()}</dc:identifier>
  </metadata>
  <manifest>
${manifest}
  </manifest>
  <spine>
${spine}
  </spine>
</package>`
}

/**
 * 챕터 HTML 생성
 */
function generateChapterHTML(chapter: { title: string; content: string }): string {
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <title>${chapter.title}</title>
</head>
<body>
  <h1>${chapter.title}</h1>
  <div>${chapter.content.replace(/\n/g, '<br>')}</div>
</body>
</html>`
}

