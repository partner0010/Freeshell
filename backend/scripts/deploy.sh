#!/bin/bash

# 올인원 콘텐츠 AI 자동 배포 스크립트
# 사용법: ./deploy.sh [서버주소] [사용자명]

set -e

SERVER_HOST=${1:-"your-server-ip"}
SERVER_USER=${2:-"root"}
APP_NAME="all-in-one-content-ai"
APP_DIR="/opt/$APP_NAME"

echo "🚀 올인원 콘텐츠 AI 배포 시작..."
echo "서버: $SERVER_USER@$SERVER_HOST"
echo ""

# 로컬 빌드
echo "📦 로컬 빌드 중..."
npm run build

# 서버에 파일 전송
echo "📤 서버에 파일 전송 중..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ $SERVER_USER@$SERVER_HOST:$APP_DIR/

# 서버에서 실행할 명령어
echo "🔧 서버에서 설정 중..."
ssh $SERVER_USER@$SERVER_HOST << EOF
set -e

cd $APP_DIR/backend

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo "Node.js 설치 중..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# FFmpeg 확인
if ! command -v ffmpeg &> /dev/null; then
    echo "FFmpeg 설치 중..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg
fi

# 의존성 설치
echo "의존성 설치 중..."
npm install --production

# Prisma 설정
echo "Prisma 설정 중..."
npx prisma generate
npx prisma migrate deploy || npx prisma db push

# 환경 변수 확인
if [ ! -f .env ]; then
    echo "⚠️ .env 파일이 없습니다!"
    echo "서버에 .env 파일을 생성해주세요."
    exit 1
fi

# PM2 설치 및 실행
if ! command -v pm2 &> /dev/null; then
    echo "PM2 설치 중..."
    sudo npm install -g pm2
fi

# 서버 재시작
echo "서버 재시작 중..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start dist/index.js --name $APP_NAME
pm2 save

# 방화벽 설정
echo "방화벽 설정 중..."
sudo ufw allow 3001/tcp || true

echo "✅ 배포 완료!"
echo "서버 주소: http://$SERVER_HOST:3001"
EOF

echo ""
echo "✅ 배포 완료!"
echo "서버 확인: curl http://$SERVER_HOST:3001/api/health"

