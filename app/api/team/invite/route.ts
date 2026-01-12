/**
 * 팀 초대 API
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/security/session-enhanced';
import { validateInput } from '@/lib/security/input-validation';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    // 입력 검증
    const emailValidation = validateInput(email, {
      type: 'email',
      required: true,
      allowHtml: false,
    });
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // 역할 검증
    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: '유효하지 않은 역할입니다.' },
        { status: 400 }
      );
    }

    // 실제로는 이메일 전송 로직이 필요하지만, 여기서는 초대 토큰 생성
    const inviteToken = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 초대 정보 저장 (실제로는 데이터베이스에 저장)
    // 여기서는 메모리에 저장하는 예시
    const invite = {
      id: inviteToken,
      email,
      role,
      inviterId: session.userId,
      inviterEmail: session.email,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
      status: 'pending',
    };

    // 이메일 전송
    const { emailService } = await import('@/lib/services/emailService');
    const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/accept-invite?token=${inviteToken}`;
    await emailService.sendTeamInvite(
      email,
      session.email.split('@')[0],
      inviteLink,
      role
    );

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      message: '초대 이메일이 전송되었습니다.',
    });
  } catch (error: any) {
    console.error('[팀 초대 API] 오류:', error);
    return NextResponse.json(
      { error: '초대 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
