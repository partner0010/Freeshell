#!/bin/bash

echo "🚀 올인원 콘텐츠 AI 백엔드 설치 시작..."

# Node.js 확인
if ! command -v node &> /dev/null; then
    echo "❌ Node.js가 설치되어 있지 않습니다."
    echo "Node.js 18 이상을 설치해주세요: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js 확인: $(node --version)"

# FFmpeg 확인 및 설치 안내
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️ FFmpeg가 설치되어 있지 않습니다."
    echo "비디오 처리 기능을 사용하려면 FFmpeg가 필요합니다."
    read -p "FFmpeg 설치 가이드를 보시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "FFmpeg 설치:"
        echo "  macOS: brew install ffmpeg"
        echo "  Ubuntu: sudo apt-get install ffmpeg"
        echo "  Windows: https://ffmpeg.org/download.html"
    fi
else
    echo "✅ FFmpeg 확인: $(ffmpeg -version | head -n 1)"
fi

# 의존성 설치
echo "📦 의존성 설치 중..."
npm install

# .env 파일 확인
if [ ! -f .env ]; then
    echo "📝 .env 파일 생성 중..."
    cp .env.example .env
    echo "⚠️ .env 파일을 열어서 API 키를 설정해주세요!"
fi

# 디렉토리 생성
echo "📁 필요한 디렉토리 생성 중..."
mkdir -p uploads/videos uploads/images uploads/thumbnails data logs temp

# Prisma 설정
echo "🗄️ Prisma 설정 중..."
npx prisma generate
npx prisma migrate dev --name init || npx prisma db push

# 빌드
echo "🔨 프로젝트 빌드 중..."
npm run build

echo ""
echo "✅ 설치 완료!"
echo ""
echo "다음 단계:"
echo "1. .env 파일을 열어서 API 키를 설정하세요"
echo "2. 'npm run dev' 명령어로 개발 서버를 시작하세요"
echo "3. 또는 'npm start' 명령어로 프로덕션 서버를 시작하세요"

