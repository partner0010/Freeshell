/**
 * 소스 코드 보호 유틸리티
 * 디버깅 방지 및 코드 분석 방지
 */

/**
 * 개발자 도구 감지 및 차단
 */
export function detectDevTools(): void {
  if (typeof window === 'undefined') return

  // 개발자 도구 열림 감지
  const devtools = {
    open: false,
    orientation: null as 'vertical' | 'horizontal' | null,
  }

  const threshold = 160

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devtools.open) {
        devtools.open = true
        // 개발자 도구 감지 시 처리
        handleDevToolsDetected()
      }
    } else {
      devtools.open = false
    }
  }, 500)

  // F12, Ctrl+Shift+I 등 키 조합 차단
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault()
      return false
    }
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault()
      return false
    }
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault()
      return false
    }
    // Ctrl+U (소스 보기)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault()
      return false
    }
  })

  // 우클릭 방지 (선택적)
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })

    // 텍스트 선택 방지 (선택적)
    document.addEventListener('selectstart', (e) => {
      e.preventDefault()
      return false
    })
  }
}

/**
 * 개발자 도구 감지 시 처리
 */
function handleDevToolsDetected(): void {
  // 프로덕션 환경에서만 실행
  if (process.env.NODE_ENV !== 'production') return

  // 경고 로그 (실제로는 서버에 보고)
  console.warn('개발자 도구 감지됨')

  // 페이지 리로드 또는 경고 표시
  // window.location.reload()
}

/**
 * 코드 난독화 헬퍼
 */
export function obfuscateString(str: string): string {
  // 간단한 Base64 인코딩 (실제로는 더 강력한 난독화 필요)
  if (typeof window !== 'undefined') {
    return btoa(str)
  }
  return Buffer.from(str).toString('base64')
}

/**
 * 디버거 차단
 */
export function blockDebugger(): void {
  if (typeof window === 'undefined') return

  // 디버거 문 감지 및 차단
  const originalDebugger = window.Debugger
  Object.defineProperty(window, 'Debugger', {
    get: () => {
      return originalDebugger
    },
    set: () => {
      // 디버거 설정 차단
    },
  })

  // setInterval을 사용한 디버거 감지
  setInterval(() => {
    const start = performance.now()
    // eslint-disable-next-line no-debugger
    debugger
    const end = performance.now()
    
    // 디버거가 실행되면 시간이 많이 걸림
    if (end - start > 100) {
      handleDevToolsDetected()
    }
  }, 1000)
}

/**
 * 소스 코드 보호 초기화
 */
export function initSourceProtection(): void {
  if (typeof window === 'undefined') return

  // 프로덕션 환경에서만 실행
  if (process.env.NODE_ENV === 'production') {
    detectDevTools()
    blockDebugger()
  }
}

