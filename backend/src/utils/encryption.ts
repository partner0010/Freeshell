import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64
const TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * 암호화 키 생성 (환경 변수에서)
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다')
  }
  
  // 32바이트 키 생성 (SHA-256 해시 사용)
  return crypto.createHash('sha256').update(key).digest()
}

/**
 * 데이터 암호화
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = cipher.getAuthTag()

    // IV + 태그 + 암호화된 데이터
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted
  } catch (error) {
    throw new Error('암호화 실패: ' + (error as Error).message)
  }
}

/**
 * 데이터 복호화
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey()
    const parts = encryptedData.split(':')
    
    if (parts.length !== 3) {
      throw new Error('잘못된 암호화 형식')
    }

    const iv = Buffer.from(parts[0], 'hex')
    const tag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    throw new Error('복호화 실패: ' + (error as Error).message)
  }
}

/**
 * 비밀번호 해시 (bcrypt 대신 사용)
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const hash = crypto.pbkdf2Sync(password, salt, 10000, KEY_LENGTH, 'sha512')
  return salt.toString('hex') + ':' + hash.toString('hex')
}

/**
 * 비밀번호 검증
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const parts = hashedPassword.split(':')
  if (parts.length !== 2) {
    return false
  }

  const salt = Buffer.from(parts[0], 'hex')
  const hash = Buffer.from(parts[1], 'hex')
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, KEY_LENGTH, 'sha512')

  return crypto.timingSafeEqual(hash, verifyHash)
}

