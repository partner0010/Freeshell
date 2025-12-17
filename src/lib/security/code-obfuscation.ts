/**
 * GRIP Source Code Security
 * 소스 코드 보안 강화 모듈
 */

// ============================================
// 1. 코드 난독화 (Obfuscation)
// ============================================

/**
 * 변수명 난독화
 */
export function obfuscateVariableNames(code: string): string {
  // 실제로는 더 정교한 파싱 필요 (AST 사용 권장)
  // 여기서는 간단한 예시
  const variableMap = new Map<string, string>();
  let counter = 0;

  // 변수 선언 찾기 및 난독화
  const varRegex = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
  return code.replace(varRegex, (match, varName) => {
    if (!variableMap.has(varName)) {
      variableMap.set(varName, generateObfuscatedName(counter++));
    }
    return match.replace(varName, variableMap.get(varName)!);
  });
}

/**
 * 난독화된 이름 생성
 */
function generateObfuscatedName(index: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
  let name = '';
  let i = index;
  
  do {
    name = chars[i % chars.length] + name;
    i = Math.floor(i / chars.length);
  } while (i > 0);
  
  return `_0x${name}`;
}

/**
 * 문자열 암호화
 */
export function encryptStrings(code: string): string {
  // 문자열을 Base64로 인코딩하고 암호화
  const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  
  return code.replace(stringRegex, (match, quote, content) => {
    const encoded = btoa(content);
    return `${quote}__ENC__${encoded}__ENC__${quote}`;
  });
}

/**
 * 제어 흐름 난독화
 */
export function obfuscateControlFlow(code: string): string {
  // if-else를 switch로 변환 등
  // 실제로는 더 정교한 변환 필요
  return code;
}

// ============================================
// 2. 코드 암호화
// ============================================

/**
 * 코드 암호화 (AES-256-GCM)
 */
export async function encryptCode(
  code: string,
  key: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);

  // 키 생성 (PBKDF2)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // IV 생성
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 암호화
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    derivedKey,
    data
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
  };
}

/**
 * 코드 복호화
 */
export async function decryptCode(
  encrypted: string,
  iv: string,
  salt: string,
  key: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // 키 재생성
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToArrayBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 복호화
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToArrayBuffer(iv) },
    derivedKey,
    base64ToArrayBuffer(encrypted)
  );

  return decoder.decode(decrypted);
}

// ============================================
// 3. 소스 맵 제거
// ============================================

/**
 * 소스 맵 제거
 */
export function removeSourceMaps(code: string): string {
  // Source map 주석 제거
  return code.replace(/\/\/# sourceMappingURL=.*$/gm, '');
}

// ============================================
// 4. 민감 정보 제거
// ============================================

/**
 * 민감한 정보 제거/마스킹
 */
export function sanitizeSensitiveData(code: string): string {
  let sanitized = code;

  // API 키 제거
  sanitized = sanitized.replace(
    /(?:api[_-]?key|apikey|api_key)\s*[:=]\s*['"]([^'"]+)['"]/gi,
    'API_KEY: "[REDACTED]"'
  );

  // 비밀번호 제거
  sanitized = sanitized.replace(
    /(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]+)['"]/gi,
    'PASSWORD: "[REDACTED]"'
  );

  // 토큰 제거
  sanitized = sanitized.replace(
    /(?:token|auth[_-]?token|access[_-]?token)\s*[:=]\s*['"]([^'"]+)['"]/gi,
    'TOKEN: "[REDACTED]"'
  );

  // 데이터베이스 연결 문자열 제거
  sanitized = sanitized.replace(
    /(?:mongodb|postgresql|mysql):\/\/[^\s'"]+/gi,
    'DATABASE_URL: "[REDACTED]"'
  );

  return sanitized;
}

// ============================================
// 5. 코드 무결성 검증
// ============================================

/**
 * 코드 해시 생성 (SHA-256)
 */
export async function generateCodeHash(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 코드 무결성 검증
 */
export async function verifyCodeIntegrity(
  code: string,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await generateCodeHash(code);
  return actualHash === expectedHash;
}

// ============================================
// 6. 라이선스 검증
// ============================================

/**
 * 라이선스 키 검증
 */
export async function verifyLicenseKey(licenseKey: string): Promise<boolean> {
  // 실제로는 서버에서 검증해야 함
  // 여기서는 간단한 검증 로직
  const hash = await generateCodeHash(licenseKey);
  // 라이선스 키 형식 검증
  return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey);
}

// ============================================
// 유틸리티 함수
// ============================================

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================
// Export
// ============================================

export const CodeSecurity = {
  // Obfuscation
  obfuscateVariableNames,
  encryptStrings,
  obfuscateControlFlow,

  // Encryption
  encryptCode,
  decryptCode,

  // Sanitization
  removeSourceMaps,
  sanitizeSensitiveData,

  // Integrity
  generateCodeHash,
  verifyCodeIntegrity,

  // License
  verifyLicenseKey,
};

export default CodeSecurity;

