FROM node:20-alpine

WORKDIR /app

# 시스템 의존성 설치 (FFmpeg 등)
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

# package.json 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# 빌드
RUN npm run build

# 포트 노출
EXPOSE 3001

# 필요한 디렉토리 생성
RUN mkdir -p uploads/videos uploads/images uploads/thumbnails data logs temp

# 서버 시작
CMD ["npm", "start"]

