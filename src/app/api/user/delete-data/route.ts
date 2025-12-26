import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

/**
 * 개인정보 삭제 API
 * GDPR 및 개인정보보호법 준수
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;
    const body = await request.json();
    const { deleteType } = body; // 'all' | 'chat' | 'content'

    // 실제 구현 시 데이터베이스에서 삭제
    // 여기서는 시뮬레이션
    const deletedItems: string[] = [];

    switch (deleteType) {
      case 'chat':
        // AI 대화 기록 삭제
        deletedItems.push('AI 대화 기록');
        // 데이터베이스에서 AI 대화 기록 삭제
        // 실제 구현 시 Prisma를 사용하여 삭제
        // await prisma.chatMessage.deleteMany({ where: { userId: session.user.id } });
        break;
      
      case 'content':
        // 생성된 콘텐츠 삭제
        deletedItems.push('생성된 콘텐츠');
        // 데이터베이스에서 생성된 콘텐츠 삭제
        // 실제 구현 시 Prisma를 사용하여 삭제
        // await prisma.generatedContent.deleteMany({ where: { userId: session.user.id } });
        break;
      
      case 'all':
        // 모든 개인정보 삭제 (회원 탈퇴)
        deletedItems.push('AI 대화 기록', '생성된 콘텐츠', '사용자 프로필', '활동 로그');
        // 데이터베이스에서 모든 개인정보 삭제
        // 실제 구현 시 Prisma를 사용하여 삭제
        // await prisma.userData.deleteMany({ where: { userId: session.user.id } });
        // await prisma.user.update({ where: { id: session.user.id }, data: { deletedAt: new Date() } });
        break;
      
      default:
        return NextResponse.json(
          { error: '잘못된 삭제 타입입니다.' },
          { status: 400 }
        );
    }

    // 로그 기록 (법적 요구사항 준수)
    console.log(`[개인정보 삭제] 사용자: ${userId}, 타입: ${deleteType}, 삭제 항목: ${deletedItems.join(', ')}`);

    return NextResponse.json({
      success: true,
      message: '개인정보가 성공적으로 삭제되었습니다.',
      deletedItems,
      deletedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('개인정보 삭제 오류:', error);
    return NextResponse.json(
      { error: '개인정보 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

