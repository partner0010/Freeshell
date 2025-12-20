let PrismaClient: any;
try {
  // eslint-disable-next-line
  PrismaClient = require('@prisma/client').PrismaClient;
} catch {
  // eslint-disable-next-line
  PrismaClient = require('../types/prisma-shim').PrismaClient;
}

type PrismaClientType = InstanceType<typeof PrismaClient>;

// Next.js (hot reload) 환경에서 PrismaClient 중복 생성을 피하기 위한 패턴
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientType;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

