# Frontend Dockerfile
# Node.js 20, Next.js 빌드 및 정적 파일 서빙

# Stage 1: 빌드
FROM node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package.json package-lock.json* ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# Next.js 빌드
RUN npm run build

# Stage 2: 프로덕션
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 시스템 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# 빌드된 파일 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 소유권 변경
RUN chown -R nextjs:nodejs /app

USER nextjs

# 포트 노출
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 헬스체크
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 애플리케이션 실행
CMD ["node", "server.js"]
