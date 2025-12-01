/**
 * 백엔드 코드 난독화 스크립트
 * 프로덕션 빌드 시 실행
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distDir = path.join(__dirname, '../dist')

/**
 * 간단한 코드 난독화 (실제로는 javascript-obfuscator 사용 권장)
 */
function obfuscateCode(code) {
  // 주석 제거
  code = code.replace(/\/\*[\s\S]*?\*\//g, '')
  code = code.replace(/\/\/.*$/gm, '')
  
  // 공백 최소화
  code = code.replace(/\s+/g, ' ')
  code = code.replace(/;\s*}/g, ';}')
  code = code.replace(/{\s*/g, '{')
  code = code.replace(/}\s*/g, '}')
  
  return code.trim()
}

/**
 * 파일 난독화
 */
function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8')
    const obfuscated = obfuscateCode(code)
    fs.writeFileSync(filePath, obfuscated, 'utf8')
    console.log(`✓ 난독화 완료: ${path.relative(distDir, filePath)}`)
  } catch (error) {
    console.error(`✗ 난독화 실패: ${filePath}`, error.message)
  }
}

/**
 * 디렉토리 재귀 탐색
 */
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir)
  
  files.forEach(file => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback)
    } else if (file.endsWith('.js')) {
      callback(filePath)
    }
  })
}

/**
 * 메인 실행
 */
function main() {
  if (!fs.existsSync(distDir)) {
    console.log('dist 디렉토리가 없습니다. 빌드를 먼저 실행하세요.')
    return
  }
  
  console.log('코드 난독화 시작...')
  
  walkDir(distDir, obfuscateFile)
  
  console.log('코드 난독화 완료!')
}

main()

