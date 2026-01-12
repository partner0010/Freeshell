/**
 * 이메일 전송 서비스
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  /**
   * 이메일 전송
   * 실제로는 SendGrid, AWS SES, Nodemailer 등을 사용
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // 실제로는 이메일 서비스 API 호출
      // 예: SendGrid, AWS SES, Nodemailer 등
      
      // 개발 환경에서는 콘솔에 출력
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 이메일 전송 시뮬레이션:');
        console.log('받는 사람:', options.to);
        console.log('제목:', options.subject);
        console.log('내용:', options.text || options.html);
        return true;
      }

      // 프로덕션 환경에서는 실제 이메일 서비스 사용
      // 예시: SendGrid
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({
      //   to: options.to,
      //   from: process.env.FROM_EMAIL,
      //   subject: options.subject,
      //   html: options.html,
      //   text: options.text,
      // });

      return true;
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      return false;
    }
  }

  /**
   * 팀 초대 이메일 전송
   */
  async sendTeamInvite(
    to: string,
    inviterName: string,
    inviteLink: string,
    role: string
  ): Promise<boolean> {
    const subject = `${inviterName}님이 팀에 초대했습니다`;
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>팀 초대</h1>
            </div>
            <div class="content">
              <p>안녕하세요,</p>
              <p><strong>${inviterName}</strong>님이 Shell 팀에 초대했습니다.</p>
              <p>역할: <strong>${role === 'admin' ? '관리자' : role === 'member' ? '멤버' : '뷰어'}</strong></p>
              <p>아래 버튼을 클릭하여 팀에 참여하세요:</p>
              <a href="${inviteLink}" class="button">팀 참여하기</a>
              <p>또는 다음 링크를 복사하여 브라우저에 붙여넣으세요:</p>
              <p style="word-break: break-all; color: #667eea;">${inviteLink}</p>
              <p>이 링크는 7일 후에 만료됩니다.</p>
            </div>
            <div class="footer">
              <p>이 이메일은 Shell에서 자동으로 전송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    const text = `${inviterName}님이 Shell 팀에 초대했습니다. 역할: ${role}. 링크: ${inviteLink}`;

    return await this.sendEmail({ to, subject, html, text });
  }

  /**
   * 비밀번호 재설정 이메일 전송
   */
  async sendPasswordReset(
    to: string,
    resetLink: string
  ): Promise<boolean> {
    const subject = '비밀번호 재설정 요청';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>비밀번호 재설정</h1>
            </div>
            <div class="content">
              <p>안녕하세요,</p>
              <p>비밀번호 재설정을 요청하셨습니다.</p>
              <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
              <a href="${resetLink}" class="button">비밀번호 재설정</a>
              <p>또는 다음 링크를 복사하여 브라우저에 붙여넣으세요:</p>
              <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
              <div class="warning">
                <strong>⚠️ 보안 안내</strong>
                <p>이 링크는 1시간 후에 만료됩니다.</p>
                <p>만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하세요.</p>
              </div>
            </div>
            <div class="footer">
              <p>이 이메일은 Shell에서 자동으로 전송되었습니다.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    const text = `비밀번호 재설정 링크: ${resetLink}`;

    return await this.sendEmail({ to, subject, html, text });
  }
}

export const emailService = new EmailService();
export default emailService;
