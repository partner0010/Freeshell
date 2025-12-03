/**
 * SMS 인증 서비스
 * Twilio, NCP SMS, 알리고 등 사용 가능
 */

import { logger } from '../../utils/logger'
import crypto from 'crypto'

export class SMSService {
  /**
   * 인증 코드 생성 (6자리)
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * SMS 발송 (NCP SMS 사용 - 한국)
   */
  async sendVerificationSMS(phone: string, code: string): Promise<boolean> {
    const ncpAccessKey = process.env.NCP_ACCESS_KEY
    const ncpSecretKey = process.env.NCP_SECRET_KEY
    const ncpServiceId = process.env.NCP_SERVICE_ID
    const ncpFromNumber = process.env.NCP_FROM_NUMBER

    if (!ncpAccessKey || !ncpSecretKey || !ncpServiceId || !ncpFromNumber) {
      // NCP 설정 없으면 콘솔에 출력
      logger.info(`📱 SMS 인증 코드 (콘솔): ${phone} → ${code}`)
      console.log('\n========================================')
      console.log(`📱 SMS 인증 코드: ${code}`)
      console.log(`받는 번호: ${phone}`)
      console.log('========================================\n')
      return true
    }

    try {
      const timestamp = Date.now().toString()
      const space = ' '
      const newLine = '\n'
      const method = 'POST'
      const url = `/sms/v2/services/${ncpServiceId}/messages`
      
      // HMAC 서명 생성
      const message = method + space + url + newLine + timestamp + newLine + ncpAccessKey
      const signature = crypto
        .createHmac('sha256', ncpSecretKey)
        .update(message)
        .digest('base64')

      const response = await fetch(
        `https://sens.apigw.ntruss.com${url}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-ncp-apigw-timestamp': timestamp,
            'x-ncp-iam-access-key': ncpAccessKey,
            'x-ncp-apigw-signature-v2': signature,
          },
          body: JSON.stringify({
            type: 'SMS',
            contentType: 'COMM',
            from: ncpFromNumber,
            content: `[FreeShell] 인증번호: ${code}\n5분 내에 입력해주세요.`,
            messages: [
              {
                to: phone.replace(/-/g, ''),
              },
            ],
          }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        logger.info(`✅ SMS 발송 성공: ${phone}`)
        return true
      } else {
        logger.error('SMS 발송 실패:', data)
        // 실패해도 콘솔에 출력
        console.log('\n========================================')
        console.log(`📱 SMS 인증 코드: ${code}`)
        console.log(`받는 번호: ${phone}`)
        console.log('========================================\n')
        return true
      }
    } catch (error: any) {
      logger.error('SMS 발송 오류:', error)
      // 오류 발생해도 콘솔에 출력
      console.log('\n========================================')
      console.log(`📱 SMS 인증 코드: ${code}`)
      console.log(`받는 번호: ${phone}`)
      console.log('========================================\n')
      return true
    }
  }

  /**
   * Twilio 사용 (글로벌)
   */
  async sendViaTwilio(phone: string, code: string): Promise<boolean> {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom = process.env.TWILIO_FROM_NUMBER

    if (!twilioSid || !twilioToken || !twilioFrom) {
      logger.warn('Twilio 미설정 - 콘솔 출력')
      console.log(`📱 SMS: ${phone} → ${code}`)
      return true
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioFrom,
            To: phone,
            Body: `[FreeShell] 인증번호: ${code}\n5분 내에 입력해주세요.`,
          }),
        }
      )

      if (response.ok) {
        logger.info(`✅ Twilio SMS 발송: ${phone}`)
        return true
      } else {
        throw new Error('Twilio 발송 실패')
      }
    } catch (error: any) {
      logger.error('Twilio 오류:', error)
      console.log(`📱 SMS: ${phone} → ${code}`)
      return true
    }
  }
}

export const smsService = new SMSService()

