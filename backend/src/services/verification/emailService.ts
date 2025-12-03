/**
 * 이메일 인증 서비스
 * Nodemailer 사용
 */

import nodemailer from 'nodemailer'
import { logger } from '../../utils/logger'
import crypto from 'crypto'

export class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    // Gmail SMTP 설정 (무료!)
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS

    if (emailUser && emailPass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass, // Gmail 앱 비밀번호
        },
      })
      logger.info('✅ 이메일 서비스 초기화 완료')
    } else {
      logger.warn('⚠️ EMAIL_USER 또는 EMAIL_PASS 미설정 - 콘솔로 인증 코드 출력')
    }
  }

  /**
   * 인증 토큰 생성
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * 인증 코드 생성 (6자리)
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * 이메일 인증 메일 발송
   */
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://freeshell.co.kr'}/verify-email?token=${token}`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0f; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; border-radius: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .content { font-size: 16px; line-height: 1.6; color: #e5e7eb; }
          .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">FreeShell</h1>
            <p style="color: #9ca3af;">이메일 인증</p>
          </div>
          <div class="content">
            <p>안녕하세요!</p>
            <p>FreeShell 회원가입을 진심으로 환영합니다.</p>
            <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">이메일 인증하기</a>
            </div>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 20px;">
              버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br/>
              <span style="color: #60a5fa;">${verificationUrl}</span>
            </p>
            <p style="font-size: 14px; color: #9ca3af;">
              이 링크는 24시간 동안 유효합니다.
            </p>
          </div>
          <div class="footer">
            <p>본 메일은 발신 전용입니다.</p>
            <p>© 2024 FreeShell. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"FreeShell" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '[FreeShell] 이메일 인증을 완료해주세요',
          html: htmlContent,
        })
        logger.info(`✅ 인증 이메일 발송: ${email}`)
        return true
      } else {
        // 이메일 서비스 없으면 콘솔에 출력
        logger.info(`📧 이메일 인증 링크 (콘솔): ${verificationUrl}`)
        console.log('\n========================================')
        console.log('📧 이메일 인증 링크:')
        console.log(verificationUrl)
        console.log('========================================\n')
        return true
      }
    } catch (error: any) {
      logger.error('이메일 발송 실패:', error)
      // 실패해도 콘솔에 출력
      console.log('\n========================================')
      console.log('📧 이메일 인증 링크 (콘솔):')
      console.log(verificationUrl)
      console.log('========================================\n')
      return true
    }
  }

  /**
   * 인증 완료 이메일 발송
   */
  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #0a0a0f; color: #ffffff; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; border-radius: 20px; }
          .title { font-size: 32px; font-weight: bold; text-align: center; background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="title">환영합니다, ${username}님!</h1>
          <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6;">
            FreeShell 회원가입이 완료되었습니다.<br/>
            이제 관리자 승인만 기다리시면 모든 기능을 사용하실 수 있습니다.
          </p>
          <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-top: 30px;">
            © 2024 FreeShell
          </p>
        </div>
      </body>
      </html>
    `

    try {
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"FreeShell" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: '[FreeShell] 환영합니다!',
          html: htmlContent,
        })
      }
    } catch (error) {
      logger.warn('환영 이메일 발송 실패:', error)
    }
  }
}

export const emailService = new EmailService()

