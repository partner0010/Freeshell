import { logger } from '../../utils/logger'
import { VulnerabilityScanner } from './vulnerabilityScanner'

/**
 * 자동 패치 스케줄러
 * 정기적으로 취약점을 스캔하고 자동으로 패치
 */
export class AutoPatchScheduler {
  private scanner: VulnerabilityScanner
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.scanner = new VulnerabilityScanner()
  }

  /**
   * 자동 패치 시작 (매일 새벽 3시 실행)
   */
  start(): void {
    logger.info('자동 패치 스케줄러 시작')

    // 즉시 한 번 실행
    this.runPatch()

    // 매일 새벽 3시에 실행
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(3, 0, 0, 0)

    const msUntilTomorrow = tomorrow.getTime() - now.getTime()

    setTimeout(() => {
      this.runPatch()
      // 이후 매일 실행
      this.intervalId = setInterval(() => {
        this.runPatch()
      }, 24 * 60 * 60 * 1000) // 24시간
    }, msUntilTomorrow)
  }

  /**
   * 자동 패치 중지
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      logger.info('자동 패치 스케줄러 중지')
    }
  }

  /**
   * 패치 실행
   */
  private async runPatch(): Promise<void> {
    try {
      logger.info('자동 취약점 스캔 및 패치 시작...')

      const scanResult = await this.scanner.scanAll()

      if (scanResult.totalCritical > 0 || scanResult.totalHigh > 0) {
        logger.warn(`Critical/High 취약점 발견: Critical ${scanResult.totalCritical}, High ${scanResult.totalHigh}`)
        
        const patchResult = await this.scanner.autoPatch()
        logger.info(`자동 패치 완료: ${patchResult.patched}개 패치, ${patchResult.failed}개 실패`)
      } else {
        logger.info('취약점 없음 - 패치 불필요')
      }
    } catch (error) {
      logger.error('자동 패치 실패:', error)
    }
  }
}

