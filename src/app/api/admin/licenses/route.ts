import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

type SubscriptionLicense = Awaited<ReturnType<typeof prisma.subscriptionLicense.findMany>>[number];

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 모든 라이선스 조회
    const licenses = await prisma.subscriptionLicense.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      licenses: licenses.map((license: SubscriptionLicense) => ({
        id: license.id,
        licenseKey: license.licenseKey,
        tier: license.tier,
        status: license.status,
        userId: license.userId,
        expiresAt: license.expiresAt,
        maxDevices: license.maxDevices,
        issuedAt: license.issuedAt,
      })),
    });
  } catch (error: any) {
    console.error('라이선스 조회 오류:', error);
    return NextResponse.json(
      { error: '라이선스 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

